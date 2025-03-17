<script setup lang="ts">
    import { type Marker, type Post } from "@prisma/client";

    const markers = await useFetch<Marker[]>("/api/markers");
    const posts = await useFetch<Post[]>("/api/posts", {
        credentials: "include",
    });
</script>

<template>
    <video width="100%" height="auto" autoplay muted loop playsinline>
        <source src="/IMG_4175.MOV" type="video/mp4">
        Your browser does not support the video tag.
    </video>

    <div class="row">
        <div class="col-3"></div>
        <div class="col-6 p-5 rounded-3">
            <h1 class="text-center">1000 Miglia, the most beautiful race in the world</h1>
            <p class="text-center">
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
            </p>
            <div class="d-flex justify-content-center">
                <NuxtLink to="/map" class="start-button btn mt-4" style="background-color: #003366; color:white;">Ga naar kaart</NuxtLink>
            </div>
        </div>
        <div class="col-3"></div>
    </div>
    <div class="row bg-light">
        <div v-for="marker in markers" :key="marker.id" class>

        </div>
    </div>
</template>