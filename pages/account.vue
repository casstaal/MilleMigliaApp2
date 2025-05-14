<script setup lang="ts">
import type { User } from "@prisma/client";

  const { getSession, data } = useAuth();

  const session = await getSession();
    const users = ref<User[] | null>(null);
    const { data: userData } = await useFetch<User[]>(`/api/users`);
    users.value = userData.value;  

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
        welcomeMessage.value = getWelcomeMessage();
    });

</script>

<template>
    <div class="row">
        <div class="col-12 ps-lg-5 ps-4">
            <h1>Account</h1>
            <h4>{{ welcomeMessage }}</h4>
        </div>
    </div>

    <div class="row mt-4">
        <div class="col-12 ps-lg-5 ps-4">
            <h2>Statistieken</h2>
            <p>U heeft ... markers geplaatsd van de ... markers in totaal.</p>
            <!-- Hoeveel posts toegevoegd, hoeveel markers toegevoegd en dan laten zien wat het percentage is van de totaal toegevoegd posts en markers -->
        </div>
    </div>

    <div class="row">
        <div class="col-12 ps-lg-5 pe-lg-0 ps-4 pe-4">
            <h2>Reset password</h2>
            <form class="reset-password-form border rounded p-3 col-lg-3">
                <div class="mt-2">
                    <label for="currentPassword" class="form-label fs-5">Current password:</label>
                    <input class="form-control input-lg" id="currentPassword" type="password" placeholder="Current password">
                </div>
                <div class="mt-3">
                    <label for="newPassword" class="form-label fs-5">New password:</label>
                    <input class="form-control input-lg" id="newPassword" type="password" placeholder="New password">
                </div>
                <div class="mt-3">
                    <label for="newPassword2" class="form-label fs-5">New password:</label>
                    <input class="form-control input-lg" id="newPassword2" type="password" placeholder="New password">
                </div>
                <button class="reset-password-button btn btn-lg mt-3 mb-3 me-4 col-12" type="submit">Reset password</button>
            </form>
        </div>
    </div>

    <div class="row mt-5">
        <div class="col-lg-6 pe-lg-3 ps-lg-5 ps-4 pe-4 mb-4">
            <h2>Users</h2>
            <!-- laat zien of een user nu actief is of wanneer de laatste activiteit is. Hoeveel markers een user heeft toegevoegd en wanneer de laatste toevoeging is. -->
            <!-- Kleine dropdown om extra info van user te laten zien. Als hij ingeklapt is alleen de naam en groen puntje of actief is en anders hoelang geleden hij actief was. -->
            <!-- delete voor user (select user en dan verschijnt er een delete knop) -->
             <div class="overflow-auto" style="max-height: 450px;">
                <div v-if="users?.length === 0" class="text-center text-muted p-3">
                    Geen users gevonden
                </div>
                <div v-for="user in users" :key="user.id" class="card p-3 shadow-sm mb-3 bg-white">
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
        <div class="col-lg-6 ps-lg-3 pe-lg-5 ps-4 pe-4 mb-5">
            <h2>Add new user</h2>
            <form class="addUser-form border rounded">
                <div class="ms-4 me-4">
                    <div class="mt-3">
                        <label for="name" class="form-label fs-5">Name:</label>
                        <input class="form-control input-lg" id="name" type="text" placeholder="Name">
                    </div>
                    <div class="mt-3">
                        <label for="email" class="form-label fs-5">Email:</label>
                        <input class="form-control input-lg" id="email" type="email" placeholder="Email">
                    </div>
                    <div class="mt-3">
                        <label for="password" class="form-label fs-5">Password:</label>
                        <input class="form-control input-lg" id="password" type="password" placeholder="Password">
                    </div>
                    <div class="mt-3">
                        <label for="role" class="form-label fs-5">Role:</label><br>
                        <select class="form-control input-lg" name="role" id="role">
                            <option value="guest">Guest</option>
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                </div>
                <button class="create-button btn btn-lg mt-3 mb-3 me-5 ms-4 col-12" type="submit">Save user</button>
            </form>
        </div>
    </div>
</template>

<style>
    .create-button, .reset-password-button {
        background-color: #003366;
        color: white;
    }

    .addUser-form {
        overflow: hidden;
    }
</style>