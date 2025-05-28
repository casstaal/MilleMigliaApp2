<script setup lang="ts">
    import type { Marker, Post, User } from "@prisma/client";
    import type { FetchError } from "ofetch";
    import { object, string, z } from "zod";
    import { useRoute, useRouter } from "vue-router";
    import { Icon } from "@iconify/vue";
    import { Chart, registerables  } from 'chart.js';

    definePageMeta({
        middleware: 'my-middleware'
    })

    Chart.register(...registerables);

    const { getSession, data } = useAuth();

    const session = await getSession();

    const route = useRoute();
    const router = useRouter();

    const loggedInUser = await useFetch<User>(`/api/users/${session?.user?.userId}`)

    const users = ref<User[] | null>(null);
    const { data: userData } = await useFetch<User[]>(`/api/users`);
    users.value = userData.value;

    const markers = ref<Marker[] | null>(null);
    const { data: markerData } = await useFetch<Marker[]>(`/api/markers`);
    markers.value = markerData.value;

    const posts = ref<Post[] | null>(null);
    const { data: postData } = await useFetch<Post[]>(`/api/posts`);
    posts.value = postData.value;

    const userUsers = computed(() => {
        return users.value?.filter(u => u.role === 'user') || [];
    });

    const guestUsers = computed(() => {
        return users.value?.filter(u => u.role === 'guest') || [];
    });  
    
    const markerByUser = computed(() => {
        return markers.value?.filter(m => m.userId === session?.user?.userId) || [];
    });

    const postByUser = computed(() => {
        return posts.value?.filter(p => p.userId === session?.user?.userId) || [];
    });

    const chartCanvas = ref<HTMLCanvasElement | null>(null)
    const chartCanvasPost = ref<HTMLCanvasElement | null>(null)

    const markerCount = computed(() => markerByUser.value.length)
    const postCount = computed(() => postByUser.value.length)
    let chart: Chart | null = null;
    let postChart: Chart | null = null;
    
    const errorMessage = ref("");
    const error = ref(false);

    const userSchema = toTypedSchema(
        object({
            name: string().min(1, { message: "Naam is verplicht"}),
            email: string().min(1, { message: "Email is verplicht"}),
            password: string().min(1, { message: "Wachtwoord is verplicht"}),
            role: string().min(1, { message: "Role is verplicht"})
        })
    )

    const resetPasswordSchema = toTypedSchema(
        object({
            currentPassword: string().min(1, { message: "Huidig wachtwoord is verplicht" }),
            newPassword: string().min(1, { message: "Nieuw wachtwoord is verplicht" }),
            newPassword2: string().min(1, { message: "Herhaal wachtwoord is verplicht" })
        }).refine(data => data.newPassword === data.newPassword2, {
            message: "Wachtwoorden komen niet overeen",
            path: ["newPassword2"]
        })
    );

    const { handleSubmit: handleAddUserSubmit, errors: addUserErrors } = useForm({
        validationSchema: userSchema,
    });

    const { value: name } = useField("name");
    const { value: email } = useField("email");
    const { value: password } = useField("password");
    const { value: role } = useField("role");

    const onSubmit = handleAddUserSubmit(async (values) => {
        createUser(values);
    })

    const { handleSubmit: handleResetPasswordSubmit, errors: resetPasswordErrors } = useForm({
        validationSchema: resetPasswordSchema,
    })

    const { value: currentPassword } = useField("currentPassword");
    const { value: newPassword } = useField("newPassword");
    const { value: newPassword2 } = useField("newPassword2");

    const onUpdateSubmit = handleResetPasswordSubmit(async (values) => {
        updatePassword(values);
    })

    async function createUser(values: any) {
        const response = await $fetch<User>("/api/users", { method: "post", body: values }).catch((e: FetchError) => {
            errorMessage.value = e.data.message;
            error.value = true;
        });

        if (error.value) {
            return;
        }

        if (!response) {
            errorMessage.value = "An error occurred";
            error.value = true;
            return;
        }

        window.location.reload();
    }

    async function updatePassword(values: any) {
        const response = await $fetch<User>(`/api/users/${session?.user?.userId}`, { method: "put", body: values }).catch((e: FetchError) => {
            errorMessage.value = e.data.message;
            error.value = true;
        });

        if (error.value) {
            return;
        }

        if (!response) {
            errorMessage.value = "An error occurred";
            error.value = true;
            return;
        }

        window.location.reload();
    }

    const isSelected = ref(false);
    const selectedUserId = ref<string | null>(null)

    function toggleSelectMode(postId: string) {
        if (selectedUserId.value === postId) {
            selectedUserId.value = null;
            isSelected.value = false;
        } else {
            selectedUserId.value = postId;
            isSelected.value = true;
        }
    }

    async function deleteUser() {
        const userId = selectedUserId.value;
        const response = await $fetch<User>(`/api/users/${selectedUserId}`, { method: "delete", body: { userId }}).catch((e: FetchError) => {
            errorMessage.value = e.data.message;
            error.value = true;
        });

        if (error.value) {
            return;
        }

        if (!response) {
            errorMessage.value = "An error occurred";
            error.value = true;
            return;
        }

        window.location.reload();
    }

    const welcomeMessage = ref('');

    function getWelcomeMessage() {
        const hour = new Date().getHours();
        const name = session?.user?.firstName || 'gebruiker';

        if (hour < 12) {
            return `Goedemorgen, ${name}`;
        } else if (hour < 18) {
            return `Goedemiddag, ${name}`;
        } else {
            return `Goedenavond, ${name}`;
        }
    }

    onMounted(() => {
    welcomeMessage.value = getWelcomeMessage()

    if (chartCanvas.value) {
        chart = new Chart(chartCanvas.value, {
        type: 'pie',
        data: {
            labels: ['Jouw markers', 'Overige markers'],
            datasets: [
            {
                label: 'Verdeling markers',
                data: [markerCount.value, (markers.value?.length || 0) - markerCount.value],
                backgroundColor: ['#003366', '#CCCCCC'],
                borderWidth: 1
            }
            ]
        },
        options: {
            responsive: false,
            plugins: {
            legend: {
                position: 'top'
            },
            title: {
                display: true,
                text: 'Jouw aandeel in geplaatste markers'
            }
            }
        }
        })
    }

    if (chartCanvasPost.value) {
        postChart = new Chart(chartCanvasPost.value, {
        type: 'pie',
        data: {
            labels: ['Jouw posts', 'Overige posts'],
            datasets: [
            {
                label: 'Verdeling markers',
                data: [postCount.value, (posts.value?.length || 0) - postCount.value],
                backgroundColor: ['#003366', '#CCCCCC'],
                borderWidth: 1
            }
            ]
        },
        options: {
            responsive: false,
            plugins: {
            legend: {
                position: 'top'
            },
            title: {
                display: true,
                text: 'Jouw aandeel in geplaatste posts'
            }
            }
        }
        })
    }
    });

</script>

<template>
    <div class="page-body">
        <div class="row">
            <div class="col-12 ps-lg-5 ps-4 mt-2 text-white">
                <h4>{{ welcomeMessage }}</h4>
            </div>
        </div>

        <div class="row mt-4 text-white">
            <div class="col-12 ps-lg-5 ps-4">
                <h2>Statistieken</h2>
                <!-- Hoeveel posts toegevoegd, hoeveel markers toegevoegd en dan laten zien wat het percentage is van de totaal toegevoegd posts en markers -->
                <div class="row">
                    <div class="col-lg-3 col-12 mb-lg-0 mb-3">
                        <canvas ref="chartCanvas" width="400" height="400"></canvas>
                    </div>
                    <div class="col-lg-3 col-12">
                        <canvas ref="chartCanvasPost" width="400" height="400"></canvas>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="loggedInUser?.data.value?.role !== 'admin'" class="row">
            <div class="col-12 ps-lg-5 pe-lg-0 ps-4 pe-4 mb-5 mt-3">
                <h2 class="text-white">Reset password</h2>
                <form @submit="onUpdateSubmit" class="reset-password-form border rounded bg-white p-3 col-lg-3">
                    <div class="mt-2">
                        <label for="currentPassword" class="form-label fs-5">Current password:</label>
                        <input class="form-control input-lg" :class="{ 'is-invalid': resetPasswordErrors.currentPassword}" id="currentPassword" type="password" v-model="currentPassword" placeholder="Current password">
                    </div>
                    <div class="mt-3">
                        <label for="newPassword" class="form-label fs-5">New password:</label>
                        <input class="form-control input-lg" :class="{ 'is-invalid': resetPasswordErrors.newPassword}" id="newPassword" type="password" v-model="newPassword" placeholder="New password">
                    </div>
                    <div class="mt-3">
                        <label for="newPassword2" class="form-label fs-5">New password:</label>
                        <input class="form-control input-lg" :class="{ 'is-invalid': resetPasswordErrors.newPassword2}" id="newPassword2" type="password" v-model="newPassword2" placeholder="New password">
                    </div>
                    <button class="reset-password-button btn btn-lg mt-3 mb-3 me-4 col-12" type="submit">Reset password</button>
                </form>
            </div>
        </div>

        <!-- <div v-if="session?.user?.role === 'admin'" class="row mt-5"> -->
        <div v-if="loggedInUser?.data?.value?.role === 'admin'">
            <div class="row mt-5">
                <div class="col-lg-4 pe-lg-3 ps-lg-5 ps-4 pe-4 mb-4">
                    <div class="d-flex align-items-center gap-2">
                        <h2 class="mb-0 text-white">Users</h2>
                        <div v-if="isSelected">
                            <Icon
                            icon="codicon:trash"
                            :style="{ fontSize: '26px', cursor: 'pointer', color: '#FF0000' }"
                            :ssr="true"
                            @click="deleteUser()"
                            />
                        </div>
                    </div>


                    <!-- laat zien of een user nu actief is of wanneer de laatste activiteit is. Hoeveel markers een user heeft toegevoegd en wanneer de laatste toevoeging is. -->
                    <!-- Kleine dropdown om extra info van user te laten zien. Als hij ingeklapt is alleen de naam en groen puntje of actief is en anders hoelang geleden hij actief was. -->
                    <!-- delete voor user (select user en dan verschijnt er een delete knop) -->
                    <div class="overflow-auto" style="max-height: 450px;">
                        <div v-if="userUsers?.length === 0" class="text-center text-muted p-3">
                            Geen gebruikers gevonden
                        </div>
                        <div v-for="user in userUsers" :key="user.id" class="card p-3 shadow-sm mb-3 bg-white" :class="{ 'selected': selectedUserId === user.id }" @click="toggleSelectMode(user.id)">
                            <div class="card-body">
                                    <div class="row">
                                        <div class="col-4 d-flex flex-column justify-content-center">
                                            <p class="mb-1">
                                                <strong>{{ user.name }}</strong>
                                            </p>
                                            <p class="text-muted mb-0">{{ user.email }}</p>
                                        </div>
                                        <div class="col-4 d-flex align-items-center justify-content-center">
                                            <p class="me-2 mb-0">Markers: 12</p>
                                            <p class="me-2 mb-0">Posts: 5</p>
                                        </div>
                                        <div class="col-4 d-flex align-items-center justify-content-end">
                                            <p class="me-2 mb-0">Laatst online: 5 days ago</p>
                                        </div>
                                    </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-lg-4 pe-lg-3 ps-lg-5 ps-4 pe-4 mb-4">
                    <div class="d-flex align-items-center gap-2">
                        <h2 class="mb-0 text-white">Guests</h2>
                        <div v-if="isSelected">
                            <Icon
                            icon="codicon:trash"
                            :style="{ fontSize: '26px', cursor: 'pointer', color: '#FF0000' }"
                            :ssr="true"
                            @click="deleteUser()"
                            />
                        </div>
                    </div>


                    <!-- laat zien of een user nu actief is of wanneer de laatste activiteit is. Hoeveel markers een user heeft toegevoegd en wanneer de laatste toevoeging is. -->
                    <!-- Kleine dropdown om extra info van user te laten zien. Als hij ingeklapt is alleen de naam en groen puntje of actief is en anders hoelang geleden hij actief was. -->
                    <!-- delete voor user (select user en dan verschijnt er een delete knop) -->
                    <div class="overflow-auto" style="max-height: 450px;">
                        <div v-if="guestUsers?.length === 0" class="text-center text-muted p-3">
                            Geen gasten gevonden
                        </div>
                        <div v-for="user in guestUsers" :key="user.id" class="card p-3 shadow-sm mb-3 bg-white" :class="{ 'selected': selectedUserId === user.id }" @click="toggleSelectMode(user.id)">
                            <div class="card-body">
                                    <div class="row">
                                        <div class="col-4 d-flex flex-column justify-content-center">
                                            <p class="mb-1">
                                                <strong>{{ user.name }}</strong>
                                            </p>
                                            <p class="text-muted mb-0">{{ user.email }}</p>
                                        </div>
                                        <div class="col-4 d-flex align-items-center justify-content-center">
                                            <p class="me-2 mb-0">Markers: 12</p>
                                            <p class="me-2 mb-0">Posts: 5</p>
                                        </div>
                                        <div class="col-4 d-flex align-items-center justify-content-end">
                                            <p class="me-2 mb-0">Laatst online: 5 days ago</p>
                                        </div>
                                    </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-lg-4 ps-lg-3 pe-lg-5 ps-4 pe-4 mb-5">
                    <h2 class="text-white">Add new user</h2>
                    <form  @submit="onSubmit" class="addUser-form border rounded bg-white">
                        <div class="ms-4 me-4">
                            <div class="mt-3">
                                <label for="name" class="form-label fs-5">Name:</label>
                                <input class="form-control input-lg" :class="{ 'is-invalid': addUserErrors.name}" id="name" type="text" v-model="name" placeholder="Name">
                            </div>
                            <div class="mt-3">
                                <label for="email" class="form-label fs-5">Email:</label>
                                <input class="form-control input-lg" :class="{ 'is-invalid': addUserErrors.email}" id="email" type="email" v-model="email" placeholder="Email">
                            </div>
                            <div class="mt-3">
                                <label for="password" class="form-label fs-5">Password:</label>
                                <input class="form-control input-lg" :class="{ 'is-invalid': addUserErrors.password}" id="password" type="password" v-model="password" placeholder="Password">
                            </div>
                            <div class="mt-3">
                                <label for="role" class="form-label fs-5">Role:</label><br>
                                <select class="form-control input-lg" :class="{ 'is-invalid': addUserErrors.role}" name="role" id="role" v-model="role">
                                    <option value="guest">Guest</option>
                                    <option value="user">User</option>
                                </select>
                            </div>
                        </div>
                        <button class="create-button btn btn-lg mt-3 mb-3 me-5 ms-4 col-12" type="submit">Save user</button>
                    </form>
                </div>
            </div>
        </div>
    </div>
</template>

<style>
    .page-body {
        background-color: #204060 !important;
        /* background-color: #406482; */
    }

    .create-button, .reset-password-button {
        background-color: #003366;
        color: white;
    }

    .addUser-form {
        overflow: hidden;
    }

    .selected {
        /* border: 2px solid #003366 !important; */
        background-color: rgb(245, 245, 235) !important;
    }

    canvas {
        background-color: white;
        padding: 1rem;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

</style>