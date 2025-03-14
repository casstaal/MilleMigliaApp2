<script setup lang="ts">
    import { type Saved, type Like, type Post } from "@prisma/client";
    import { Icon } from "@iconify/vue";
    import type { FetchError } from "ofetch";
    import { toTypedSchema } from "@vee-validate/zod";
    import { object, string, z } from "zod";


    const posts = await useFetch<Post[]>("/api/posts", {
        credentials: "include",
    });
    const userLikes = await useFetch<Like[]>("/api/likes");
    const userSaves = await useFetch<Saved[]>("/api/saves");

    const search = ref<string>("");
    const selectedFilter = ref<string>("new-old");
    const isAdding = ref(false);

    function toggleAddMode() {
        isAdding.value = !isAdding.value;
    }

    const isLiked = (postId: string) => {
        console.log("User Likes Data:", userLikes.data.value);
        if (!userLikes.data.value) return false;
        return userLikes.data.value.some((like) => like.postId === postId);
    };

    const isSaved = (postId: string) => {
        console.log("User saved Data:", userSaves.data.value);
        if (!userSaves.data.value) return false;
        return userSaves.data.value.some((save) => save.postId === postId);
    }

    const filteredPosts = computed(() => {
        let filtered = posts?.data?.value?.filter((post: any) => {
            const query = search.value.toLowerCase();
            return post.title.toLowerCase().includes(query);
        });

        if (selectedFilter.value === "old-new") {
            filtered = filtered?.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
        } else if (selectedFilter.value === "new-old") {
            filtered = filtered?.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
        } else if (selectedFilter.value === "saved") {
            filtered = filtered?.filter((post) => isSaved(post.id));
        }

        return filtered;
    })    
    
    const handleFilterSelect = (filter: string, label: string) => {
        selectedFilter.value = filter;
        filterButtonLabel.value = label; 
    };

    const filterButtonLabel = ref("Datum (nieuw-oud)"); 

    const errorMessage = ref("");
    const error = ref(false);

    async function likePost(postId: string) {
        const response = await $fetch<Like>("api/likes", { method: "post", body: { postId } }).catch((e: FetchError) => {
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

    async function deleteLike(likeId: string | null) {
        if (!likeId) return;

        const response = await $fetch<Like>("api/likes", { method: "delete", body: { likeId } }).catch((e: FetchError) => {
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

    async function savePost(postId: string) {
        const response = await $fetch<Saved>("api/saves", { method: "post", body: { postId } }).catch((e: FetchError) => {
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

    async function deletePost(saveId: string | null) {
        if (!saveId) return;

        const response = await $fetch<Saved>("api/saves", { method: "delete", body: { saveId } }).catch((e: FetchError) => {
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
    

    const getLikeId = (postId: string) => {
        const like = userLikes.data.value?.find((like) => like.postId === postId);
        return like ? like.id : null;
    };

    const getSaveId = (postId: string) => {
        const save = userSaves.data.value?.find((save) => save.postId === postId);
        return save ? save.id : null;
    };

    const schema = toTypedSchema(
        object({
            title: string().min(1, { message: "Titel is verplicht"}),
            link: string().min(1, { message: "Link is verplicht" }),
            description: string().min(1, { message: "Beschrijving is verplicht" })
        })
    );

    const { handleSubmit, errors } = useForm({
        validationSchema: schema,
    });

    const { value: title } = useField("title");
    const { value: link } = useField<string>("link");
    const { value: description } = useField<string>("description");

    async function createPost(values: any) {
        const response = await $fetch<Post>("/api/posts", { method: "post", body: values }).catch((e: FetchError) => {
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

    const onSubmit = handleSubmit(async (values) => {
        createPost(values);
    })

</script>

<template>
    <div class="row">
        <div class="col-lg-3"></div>
        <div class="py-5 col-lg-6">
            <h1>Blogs</h1>
            <input class="form-control mb-3 mt-3 bg-white" type="text" v-model="search" placeholder="Search..." />
            <hr />

            <div class="d-flex align-items-center mt-2 mb-2">
                <div class="dropdown flex-grow-1">
                    <button class="btn dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false" style="background-color: #003366; color: white;">
                        {{ filterButtonLabel }}
                    </button>
                    <ul class="dropdown-menu">
                        <li><a class="dropdown-item" href="#">Meest geliked</a></li>
                        <li><a class="dropdown-item" href="#" @click.prevent="handleFilterSelect('saved', 'Opgeslagen')">Opgeslagen</a></li>
                        <li><a class="dropdown-item" href="#" @click.prevent="handleFilterSelect('old-new', 'Datum (oud-nieuw)')">Datum (oud-nieuw)</a></li>
                        <li><a class="dropdown-item" href="#" @click.prevent="handleFilterSelect('new-old', 'Datum (nieuw-oud)')">Datum (nieuw-oud)</a></li>
                    </ul>
                </div>
                <div v-if="!isAdding" class="me-5">
                    <button class="border-0 bg-transparent p-0">
                        <Icon icon="codicon:add" :style="{ fontSize: '42px', cursor: 'pointer' }" :ssr="true" @click="toggleAddMode" />
                    </button>
                </div>
            </div>
            <div class="overflow-auto" style="max-height: 700px;">
                <div v-if="isAdding" class="card p-3 shadow-sm mb-3 bg-white">
                    <form @submit="onSubmit">
                        <div class="row">
                            <div class="card-body col-8">
                                <div class="col-10">
                                    <input class="w-100" style="font-size: 1.5rem;" v-model="title" placeholder="Titel">
                                </div>
                                <div class="col-12 mt-3">
                                    <input class="w-100" v-model="link" type="text" placeholder="Link">
                                </div>
                                <div class="col-12 mt-3">
                                    <textarea 
                                        class="w-100"
                                        type="text"
                                        v-model="description"
                                        placeholder="Beschrijving" 
                                        cols="50"
                                        rows="5">
                                    </textarea>
                                </div>
                            </div>
                        </div>
                        <div class="col-4">
                            <button class="btn col-5 me-2" style="background-color: #003366; color: white;">Save</button>
                            <button @click="toggleAddMode" class="btn col-5" style="background-color: #FF0000; color: white;">Cancel</button>     
                        </div>
                    </form>
                </div>
                <div v-if="filteredPosts?.length === 0" class="text-center text-muted p-3">
                    Geen posts gevonden
                </div>
                <div v-for="post in filteredPosts" :key="post.id" class="card p-3 shadow-sm mb-3 bg-white">
                    <div class="row">
                        <div class="card-body col-8">
                            <div class="row">
                                <div class="col-10">
                                    <h3>
                                        {{ post.title }}
                                    </h3>
                                </div>
                                <div class="col-2">
                                    <div class="row">
                                        <div class="col-7">
                                            {{ post?.date ? new Date(post.date).toISOString().split('T')[0] : '' }}
                                        </div>
                                        <div class="col-2">
                                            <div v-if="!isLiked(post.id)">
                                                <p>5</p>
                                                <Icon icon="codicon:heart" :style="{ fontSize: '26px', cursor: 'pointer', color: 'black' }" :ssr="true" @click="likePost(post.id)" />
                                            </div>
                                            <div v-if="isLiked(post.id)">
                                                <p>5</p>
                                                <Icon icon="codicon:heart-filled" :style="{ fontSize: '26px', cursor: 'pointer', color: '#FF0000' }" :ssr="true" @click="deleteLike(getLikeId(post.id))" />
                                            </div>
                                        </div>
                                        <div class="col-2">
                                            <div v-if="!isSaved(post.id)">
                                                <Icon icon="material-symbols:bookmark-outline" :style="{ fontSize: '26px', cursor: 'pointer', color: 'black' }" :ssr="true" @click="savePost(post.id)" />
                                            </div>
                                            <div v-if="isSaved(post.id)">
                                                <Icon icon="material-symbols:bookmark" :style="{ fontSize: '26px', cursor: 'pointer', color: '#003366' }" :ssr="true" @click="deletePost(getSaveId(post.id))" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="col-12">
                                <a :href="post.link" target="_blank">{{ post.link }}</a>
                            </div>
                            <div class="col-12 mt-3">
                                {{ post.description }}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-lg-3"></div>
    </div>
</template>

<style>
    .row {
        margin-right: 0;
        overflow-x: hidden; 
    }
</style>