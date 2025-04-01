<script setup lang="ts">
    import { type Marker, type Post } from "@prisma/client";
    import { ref, onMounted, onUnmounted } from "vue";

    const { data: markers } = await useFetch<Marker[]>("/api/markers");
    const { data: posts } = await useFetch<Post[]>("/api/posts", {
        credentials: "include",
    });

    const countdown = ref("Loading...");

    function startCountdown(targetDate: Date) {
    function updateTimer() {
        const now = new Date().getTime();
        const timeLeft = targetDate.getTime() - now;

        if (timeLeft > 0) {
        const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

        countdown.value = `${days}d ${hours}h ${minutes}m ${seconds}s`;
        } else {
        countdown.value = "The race has started!";
        clearInterval(timerInterval);
        }
    }

        updateTimer();
        const timerInterval = setInterval(updateTimer, 1000);

        onUnmounted(() => {
            clearInterval(timerInterval);
        });
    }

    onMounted(() => {
        const raceDate = new Date("2025-06-17T00:00:00");
        startCountdown(raceDate);
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
    <div class="row bg-light-subtle pt-5 pb-5">
        <div class="row">
            <div class="col-3"></div>
            <div class="col-6 d-flex align-items-center p-3" style="background-color: #003366;">
                <div class="col-6">
                    <img src="/IMG_4103.jpg" alt="aston martin db2" style="height: auto; width: 100%;">
                </div>
                <div class="col-6">
                    <div class="text-white text-center">
                        <h6 style="color: #FF0000;"><b>NEXT RACE</b></h6>
                        <h1>1000 Miglia</h1>
                        <h5>{{ countdown }}</h5>
                        <a href="https://1000miglia.it/en/events/1000-miglia/1000-miglia-2025/" target="_blank">
                            <button class="btn" type="button" style="background-color: #FF0000; color: white;"><b>SEE THE EVENT ></b></button>
                        </a>
                    </div>
                </div>
            </div>
        </div>
        <div class="row mt-5">
            <div class="col-3"></div>
            <div class="col-6">
                <div class="row">
                    <div class="col-5 p-3" style="background-color: #003366; margin-right: 10px;">
                        <img src="/IMG_4034.jpg" alt="aston martin db2" style="height: auto; width: 100%;">
                    </div>
                    <div class="col-5 p-3" style="background-color: #003366; margin-left: 10px;">
                        <img src="/IMG_4165.jpg" alt="aston martin db2" style="height: auto; width: 100%;">
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="row mt-5">
        <div class="col-3"></div>
        <div class="col-6 mb-5">
            <h1>Posts</h1>
            <!-- <NuxtLink to="/blog" class="start-button btn mt-4" style="background-color: #003366; color:white;">Zie alle posts</NuxtLink> -->
            <hr />

            <div class="row">
                <div v-for="post in posts?.slice(0, 4)" :key="post.id" class="col-3 border card p-3 shadow-sm mb-3 bg-white">
                    <h3>{{ post.title }}</h3>
                    <div class="d-flex justify-content-between mb-2">
                        <p class="mb-0">Cas Staal</p>
                        <p class="mb-0">{{ post?.date ? new Date(post.date).toISOString().split('T')[0] : '' }}</p>
                    </div>
                    <p v-if="post.description.length > 100">
                        {{ post.description.substring(0, 100) + '...' }}
                    </p>
                    <p v-else>
                        {{ post.description }}
                    </p>
                    <NuxtLink :to="`/blog?postId=${post.id}`" class="start-button btn mt-4" style="background-color: #003366; color:white; margin-top: auto;">Read more</NuxtLink>
                </div>
            </div>
        </div>
        <div class="col-3"></div>
    </div>
</template>