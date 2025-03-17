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
    const allLikes = await useFetch<Like[]>("/api/likes/all");

    const isEditing = ref(false); 
    const isSelected = ref(false);
    const selectedPostId = ref<string | null>(null);

    const editablePost = ref<Post>({
        id: '', title: '', link: '', description: '', date: new Date(), userId: ''
    });

    function toggleSelectMode(postId: string) {
        if (selectedPostId.value === postId) {
            selectedPostId.value = null;
            isSelected.value = false;
        } else {
            selectedPostId.value = postId;
            isSelected.value = true;
        }
    }

    function toggleEditMode(post?: Post) {
        if (!isEditing.value) {
            const post = filteredPosts.value?.find(p => p.id === selectedPostId.value);
            if (post) {
                editablePost.value = { ...post };
            }
        }
        isEditing.value = !isEditing.value;
    }

    const search = ref<string>("");
    const selectedFilter = ref<string>("new-old");
    const isAdding = ref(false);

    const expandedPost: Record<string, boolean> = {};

    function toggleDescription(postId: string) {
        expandedPost[postId] = !expandedPost[postId];
    }

    function toggleAddMode() {
        isAdding.value = !isAdding.value;
    }

    const isLiked = (postId: string) => {
        if (!userLikes.data.value) return false;
        return userLikes.data.value.some((like) => like.postId === postId);
    };

    const isSaved = (postId: string) => {
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
        } else if (selectedFilter.value === "most-liked") {
            filtered = filtered?.sort((a: any, b: any) => getPostLikeNumber(b.id) - getPostLikeNumber(a.id));
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

    async function saveSave(postId: string) {
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

    async function deleteSave(saveId: string | null) {
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

    async function deletePost() {
        const postId = selectedPostId.value;
        const response = await $fetch<Post>(`/api/posts/`, { method: "delete", body: { postId }}).catch((e: FetchError) => {
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

    async function confirmDelete() {
        const userConfirmed = confirm("Weet je zeker dat je deze post wilt verwijderen?");

        if (userConfirmed) {
            await deletePost();
        }
    }
    
    const getPostLikeNumber = (postId: string) => {
        if (!allLikes.data.value) return 0;
        return allLikes.data.value.filter((like) => like.postId === postId).length;
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

    async function updatePost() {
        console.log("Editable Post:", editablePost.value);

        const response = await $fetch<Post>(`/api/posts`, { method: "put", body: editablePost.value }).catch((e: FetchError) => {
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
                        <li><a class="dropdown-item" href="#" @click.prevent="handleFilterSelect('most-liked', 'Meest geliked')">Meest geliked</a></li>
                        <li><a class="dropdown-item" href="#" @click.prevent="handleFilterSelect('saved', 'Opgeslagen')">Opgeslagen</a></li>
                        <li><a class="dropdown-item" href="#" @click.prevent="handleFilterSelect('old-new', 'Datum (oud-nieuw)')">Datum (oud-nieuw)</a></li>
                        <li><a class="dropdown-item" href="#" @click.prevent="handleFilterSelect('new-old', 'Datum (nieuw-oud)')">Datum (nieuw-oud)</a></li>
                    </ul>
                </div>
                <div v-if="isSelected" class="me-3">
                    <div v-if="!isEditing">
                        <button class="btn col-6" style="background-color: #003366; color: white;" @click="toggleEditMode()">
                            Edit
                        </button>
                        <button class="btn col-6 pe-4" style="background-color: #FF0000; color: white;" @click="confirmDelete()">
                            Delete
                        </button>
                    </div>
                    <div v-if="isEditing">
                        <button class="btn col-6" style="background-color: #003366; color: white;" @click="updatePost">
                            Save
                        </button>
                        <button class="btn col-6 pe-4" style="background-color: #FF0000; color: white;" @click="toggleEditMode()">
                            Cancel
                        </button>
                    </div>
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
                <div v-for="post in filteredPosts" :key="post.id" class="card p-3 shadow-sm mb-3 bg-white" :class="{ 'selected': selectedPostId === post.id }" @click="!isEditing && toggleSelectMode(post.id)">
                    <div class="row">
                        <div class="card-body col-8">
                            <div class="row">
                                <div v-if="!(isEditing && post.id === selectedPostId)" class="col-10">
                                    <h3>
                                        {{ post.title }}
                                    </h3>
                                </div>
                                <div v-if="(isEditing && post.id === selectedPostId)" class="col-10">
                                    <h3>
                                        <input class="w-100" style="font-size: 1.5rem;" v-model="editablePost.title" placeholder="Titel">
                                    </h3>
                                </div>
                                <div class="col-2">
                                    <div class="row align-items-center gx-0">
                                        <div class="col-auto">
                                            {{ post?.date ? new Date(post.date).toISOString().split('T')[0] : '' }}
                                        </div>
                                        <div class="col-auto d-flex align-items-center ms-3">
                                            <span class="fs-5" style="margin-bottom: 2px;">{{ getPostLikeNumber(post.id) }}</span>
                                            <Icon 
                                                v-if="isLiked(post.id) !== null" 
                                                :icon="isLiked(post.id) ? 'codicon:heart-filled' : 'codicon:heart'" 
                                                :style="{ fontSize: '26px', cursor: 'pointer', color: isLiked(post.id) ? '#FF0000' : 'black' }" 
                                                :ssr="true" 
                                                @click="isLiked(post.id) ? deleteLike(getLikeId(post.id)) : likePost(post.id)" 
                                            />
                                        </div>
                                        <div class="col-auto d-flex align-items-center">
                                            <Icon 
                                                :icon="isSaved(post.id) ? 'material-symbols:bookmark' : 'material-symbols:bookmark-outline'" 
                                                :style="{ fontSize: '26px', cursor: 'pointer', color: isSaved(post.id) ? '#003366' : 'black' }" 
                                                :ssr="true" 
                                                @click="isSaved(post.id) ? deleteSave(getSaveId(post.id)) : saveSave(post.id)" 
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div v-if="!(isEditing && post.id === selectedPostId)" class="col-12">
                                <a :href="post.link" target="_blank">{{ post.link }}</a>
                            </div>
                            <div v-if="(isEditing && post.id === selectedPostId)" class="col-12">
                                <input class="w-100" v-model="editablePost.link" type="text" placeholder="Link">
                            </div>
                            <div v-if="!(isEditing && post.id === selectedPostId)" class="col-12 mt-3">
                                <p v-if="!expandedPost[post.id]">
                                    {{ post.description.length > 370 ? post.description.substring(0, 370) + '...' : post.description }}
                                </p>
                                <p v-else>
                                    {{ post.description }}
                                </p>

                                <button v-if="post.description.length > 370" @click="toggleDescription(post.id)" class="btn btn-link p-0">
                                    {{ expandedPost[post.id] ? 'Show less' : 'Show more' }}
                                </button>
                            </div>
                            <div v-if="(isEditing && post.id === selectedPostId)" class="col-12 mt-3">
                                <textarea 
                                        class="w-100"
                                        type="text"
                                        v-model="editablePost.description"
                                        placeholder="Beschrijving" 
                                        cols="50"
                                        rows="5">
                                </textarea>                    
                            </div>
                            <div class="col-auto">
                                Cas Staal
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

    .selected {
        border: 2px solid #003366 !important;
    }
</style>