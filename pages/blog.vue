<script setup lang="ts">
    import type { Like, Post } from "@prisma/client";
    import { Icon } from "@iconify/vue";
    import type { FetchError } from "ofetch";

    const posts = await useFetch<Post[]>("/api/posts", {
        credentials: "include",
    });
    const userLikes = await useFetch<Like[]>("/api/likes");

    const search = ref<string>("");
    const selectedFilter = ref<string>("");

    const isLiked = (postId: string) => {
        if (!userLikes.data.value) return false; // Handle null case
        console.log("User Likes Data:", userLikes.data.value);
        return userLikes.data.value.some((like) => like.postId === postId);
    };



    const filteredPosts = computed(() => {
        let filtered = posts?.data?.value?.filter((post: any) => {
            const query = search.value.toLowerCase();
            return post.title.toLowerCase().includes(query);
        });

        if (selectedFilter.value === "old-new") {
            filtered = filtered?.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
        } else if (selectedFilter.value === "new-old") {
            filtered = filtered?.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
        }

        return filtered;
    })    
    
    const handleFilterSelect = (filter: string, label: string) => {
        selectedFilter.value = filter;
        filterButtonLabel.value = label; 
    };

    const filterButtonLabel = ref("Filter"); 

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

        navigateTo("/map");
    }

</script>

<template>
    <div class="row">
        <div class="col-lg-3"></div>
        <div class="py-5 col-lg-6">
            <h1>Blogs</h1>
            <input class="form-control mb-3 mt-3 bg-white" type="text" v-model="search" placeholder="Search..." />
            <hr />

            <div class="dropdown mt-3 mb-3 me-3">
                <button class="btn dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false" style="background-color: #003366; color: white;">
                    {{ filterButtonLabel }}
                </button>
                <ul class="dropdown-menu">
                    <li><a class="dropdown-item" href="#">Meest geliked</a></li>
                    <li><a class="dropdown-item" href="#">Meest opgeslagen</a></li>
                    <li><a class="dropdown-item" href="#" @click.prevent="handleFilterSelect('old-new', 'Datum (oud-nieuw)')">Datum (oud-nieuw)</a></li>
                    <li><a class="dropdown-item" href="#" @click.prevent="handleFilterSelect('new-old', 'Datum (nieuw-oud)')">Datum (nieuw-oud)</a></li>
                </ul>
            </div>

            <div class="overflow-auto" style="max-height: 700px;">
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
                                            <Icon :icon="isLiked(post.id) ? 'codicon:heart-filled' : 'codicon:heart'" :style="{ fontSize: '26px', cursor: 'pointer', color: '#003366' }" :ssr="true" @click="likePost(post.id)" />
                                        </div>
                                        <div class="col-2">
                                            <Icon icon="codicon:bookmark" :style="{ fontSize: '26px', cursor: 'pointer', color: '#003366' }" :ssr="true" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="col-12">
                                <a href="{{ post.link }}" target="_blank">{{ post.link }}</a>
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