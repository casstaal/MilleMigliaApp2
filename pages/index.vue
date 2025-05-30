<script setup lang="ts">
    import type { Marker, Post, User } from "@prisma/client";
    import { ref, onMounted, onUnmounted } from "vue";
    import { Icon } from "@iconify/vue";
    import { useRoute, useRouter } from 'vue-router';

    definePageMeta({
        middleware: 'my-middleware'
    })

    const { getSession, data } = useAuth();
    const session = await getSession();

    const route = useRoute();
    const router = useRouter();
    const showWelcomePopup = ref(false);

    const loggedInUser = await useFetch<User>(`/api/users/${session?.user?.userId}`);
    const { data: markers } = await useFetch<Marker[]>("/api/markers");
    const { data: posts } = await useFetch<Post[]>("/api/posts", {
        credentials: "include",
    });

    const clickedGuestInfo = ref(false);
    const clickedUserInfo = ref(false);
    const clickedAdminInfo = ref(false);

    function toggleClickedMode(info: string) {
        if (info === 'guest') {
            clickedGuestInfo.value = !clickedGuestInfo.value;
        }

        if (info ==='user') {
            clickedUserInfo.value = !clickedUserInfo.value;
        }

        if (info ==='admin') {
            clickedAdminInfo.value = !clickedAdminInfo.value;
        }
    }

    const selected = ref<string>("foto");
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

          if (route.query.welcome === 'true') {
            showWelcomePopup.value = true;

            const { welcome, ...cleanQuery } = route.query;
            router.replace({ query: cleanQuery });
        }
    });

    const scrollToContent = () => {
        const content = document.querySelector(".home-sec-intro");
        if (content) {
            content.scrollIntoView({ behavior: "smooth" });
        }
    };

    const postsContainer = ref<HTMLElement | null>(null);

    function scrollPosts(direction: "left" | "right") {
    const container = postsContainer.value;
    if (container) {
        const scrollAmount = 300;
        container.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
        });
    }
    }
</script>

    <!-- Bootstrap 5.3 uses a mobile-first approach, and col-sm-* is actually only applied on ≥576px widths.
    In other words: below 576px, no grid columns are applied at all unless you specify col-12 or similar  -->

<template>
    <div v-if="showWelcomePopup" class="popup-overlay">
        <div class="popup-content" style="width: 20rem;">
            <h2 class="text-center mb-1">Welkom,</h2>
            <h5 class="text-center">{{ session?.user?.firstName }}</h5>
            <h5 class="text-center">{{ session?.user?.role }}</h5>

            <div v-if="loggedInUser.data.value?.role === 'guest'">
                <p>U heeft beperkte toegang als gast</p>
                <Icon icon="codicon:lightbulb" :style="{ fontSize: '26px', cursor: 'pointer', color: '#003366' }" :ssr="true" @click="toggleClickedMode('guest')" />
                <p v-if="clickedGuestInfo">
                    Als gast kunt u alleen dingen bekijken. <br> 
                    U kunt geen markers of posts toevoegen, bewerken en verwijderen.
                </p>
            </div>
            <div v-if="loggedInUser.data.value?.role === 'user'">
                <p>U bent ingelogd als gebruiker</p>
                <Icon icon="codicon:lightbulb" :style="{ fontSize: '26px', cursor: 'pointer', color: '#003366' }" :ssr="true" @click="toggleClickedMode('user')" />
                <p v-if="clickedUserInfo">
                    Als gebruiker kunt u markers en posts toevoegen. <br> 
                    Ook kunt u uw eigen markers en posts bewerken en verwijderen.
                </p>
            </div>
            <div v-if="loggedInUser.data.value?.role === 'admin'">
                <p>U bent ingelogd als admin.</p>
                <Icon icon="codicon:lightbulb" :style="{ fontSize: '26px', cursor: 'pointer', color: '#003366' }" :ssr="true" @click="toggleClickedMode('admin')" />
                <p v-if="clickedAdminInfo">
                    Als admin kunt u alles: <br>
                    - Markers en posts toevoegen. <br>
                    - Markers en posts bewerken of verwijderen (ook die van andere gebruikers). <br>
                    - Gebruikers of gasten aanmaken, bewerken en verwijderen. <br>
                    - U kunt zien wanneer een gebruiker of gast voor het laatst online is geweest. <br>
                    - Zien hoeveel markers en posts een gebruiker heeft aangemaakt.
                </p>
            </div>

            <button class="btn btn-lg mt-3 col-12" @click="showWelcomePopup = false" style="background-color: #003366; color: white;">Sluit</button>
        </div>
    </div>
    <div class="video-container">
        <video width="100%" height="auto" autoplay muted loop playsinline>
            <source src="/IMG_4175.MOV" type="video/mp4">
            Your browser does not support the video tag.
        </video>
        <div>
            <button class="scroll-to sprite-before" @click="scrollToContent">
                <Icon icon="codicon:arrow-circle-down" :style="{ fontSize: '48px'}" :ssr="true" />
            </button>
        </div>
    </div>

    <div class="row home-sec-intro pt-4 pb-4" style="background-color: #f2f0ec;">
        <div class="col-lg-3"></div>
        <div class="col-lg-6 col-12 p-5 p-sm-0 rounded-3">
            <h1 class="text-center">1000 Miglia, the most beautiful race in the world</h1>
            <p class="text-center">
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
            </p>
            <div class="d-flex justify-content-center">
                <NuxtLink to="/map" class="start-button btn mt-4" style="background-color: #003366; color:white;">Ga naar kaart</NuxtLink>
            </div>
        </div>
        <div class="col-lg-3"></div>
    </div>
    <div class="row pt-5 pb-5" style="background-color: #eae7e1;">
            <div class="col-lg-3 col-1"></div>
            <div class="col-lg-6 col-10 d-flex align-items-center p-3 ms-1" style="background-color: #003366;">
                <div class="col-6 me-1">
                    <img src="/IMG_5676.jpg" alt="aston martin db2" style="height: auto; width: 100%;">
                </div>
                <div class="col-6">
                    <div class="text-white text-center">
                        <h6 style="color: #FF0000;"><b>NEXT RACE</b></h6>
                        <h1>1000 Miglia</h1>
                        <h5>{{ countdown }}</h5>
                        <a href="https://1000miglia.it/en/events/1000-miglia/1000-miglia-2025/" target="_blank">
                            <button class="btn" type="button" style="background-color: #FF0000; color: white;"><b>SEE THE EVENT</b></button>
                        </a>
                    </div>
                </div>
            </div>
    </div>
    <div class="row mt-5">
        <div class="col-lg-3 col-1"></div>
        <div class="col-lg-6 col-10 mb-5">
            <div class="d-flex justify-content-between align-items-center">
                <h1 class="mb-0">Posts</h1>
                <NuxtLink to="/blog" class="text-decoration-underline fw-bold" style="color: #003366;">Zie alle posts</NuxtLink>
            </div>
            <hr />

            <div class="position-relative">
                <button class="scroll-button scroll-button-left" @click="scrollPosts('left')">
                    <Icon icon="codicon:chevron-left" width="32" />
                </button>
                <div ref="postsContainer" class="posts-carousel d-flex flex-nowrap overflow-auto">
                    <div v-for="post in posts?.slice(0, 10)" :key="post.id" class="col-lg-4 col-10 border card p-3 shadow-sm mb-3 bg-white me-4">
                        <h3>{{ post.title }}</h3>
                        <div class="d-flex justify-content-between mb-2">
                            <p class="mb-0">Cas Staal</p>
                            <p class="mb-0">{{ post?.date ? new Date(post.date).toISOString().split('T')[0] : '' }}</p>
                        </div>
                        <p v-if="post.description.length > 200">
                            {{ post.description.substring(0, 200) + '...' }}
                        </p>
                        <p v-else>
                            {{ post.description }}
                        </p>
                        <NuxtLink :to="`/blog?postId=${post.id}`" class="btn mt-auto" style="background-color: #003366; color:white; margin-top: auto;">Read more</NuxtLink>
                    </div>
                </div>
                <button class="scroll-button scroll-button-right" @click="scrollPosts('right')">
                    <Icon icon="codicon:chevron-right" width="32" />
                </button>
            </div>
        </div>
        <div class="col-lg-3 col-1"></div>
    </div>
    <div class="container-fluid p-0">
        <div class="row g-0">
            <div class="col-12">
                <img src="/seperator2.png" class="w-100 d-block" alt="separator">
            </div>
        </div>
    </div>
    <div class="pb-4">
        <h1 class="text-center mt-5 mb-5">Keep in touch</h1>
        <div class="row ms-1">
            <div class="col-lg-3 col-1"></div>
            <div class="col-lg-6 col-10 border" style="background-color: #003366;">
                <img src="/IMG_24103.jpg" alt="aston martin db2" style="height: auto; width: 100%;">
            </div>
            <div class="col-lg-3 col-1"></div>
        </div>
        <div class="row mt-5 mb-5 ms-1">
            <div class="col-lg-3 col-1"></div>
            <div class="col-lg-3 col-10 d-flex justify-content-center align-items-center" style="background-color: #eae7e1;">
                <div class="d-flex flex-column justify-content-center align-items-center text-center p-4" style="background-color: #eae7e1;">
                    <div v-if="session">
                        <h4>U bent ingelogd als {{ loggedInUser.data.value?.role }}.</h4>
                        <div v-if="loggedInUser.data.value?.role === 'guest'">
                            <p>U kunt geen dingen toevoegen aan deze site.</p>
                        </div>
                        <div v-if="loggedInUser.data.value?.role === 'user'">
                            <p>U kunt markers en posts toevoegen aan deze site.</p>
                        </div>
                        <div v-if="loggedInUser.data.value?.role === 'admin'">
                            <p>U kunt alles aanpassen en toevoegen op deze site.</p>
                        </div>
                        <NuxtLink to="/map" class="start-button btn mt-3" style="background-color: #003366; color:white;">Ga naar kaart</NuxtLink>
                    </div>
                </div>
            </div>
            <div class="d-lg-none col-1"></div>
            <div class="d-lg-none col-1"></div>
            <div class="col-lg-3 col-10 text-center pb-5 mt-lg-0 mt-5 me-3" style="background-color: #ce232a; color: white;">
                <h4 class="mt-5">Newsletter</h4>
                <p>Keep yourself up-to-date with new additions to this site</p>
                <form class="ps-3 pe-3">
                    <div class="row mb-5 mt-5">
                        <div class="col">
                            <label class="form-label">Name</label>
                            <input type="text" class="form-control" />
                        </div>
                        <div class="col">
                            <label class="form-label ms-3">Surname</label>
                            <input type="text" class="form-control ms-2" />
                        </div>
                    </div>
                    <div class="mb-5">
                        <label class="form-label">Country</label>
                        <input type="text" class="form-control" />
                    </div>
                    <div class="mb-5">
                        <label class="form-label">Email</label>
                        <input type="email" class="form-control" />
                    </div>
                    <div class="form-check mb-5">
                        <input type="checkbox" class="form-check-input" id="privacyPolicy" />
                        <label class="form-check-label" for="privacyPolicy">I have read and accepted the <a href="#" class="text-white text-decoration-underline">privacy policy</a>.</label>
                    </div>
                    <button type="submit" class="btn w-50" style="background-color: #F2A7A6; color: white;">JOIN</button>
                </form>
            </div>
            <div class="col-lg-3 col-1"></div>
        </div>
    </div>
</template>

<style>
    body, html {
        margin: 0;
        padding: 0;
        overflow-x: hidden;
    }

    .video-container {
        position: relative;
        width: 100%;
        display: flex;
        justify-content: center;
    }

    .scroll-to {
        position: absolute;
        bottom: 12%;
        left: 50%;
        transform: translateX(-50%);
        background: none;
        color: white;
        padding: 10px 20px;
        border: none;
        cursor: pointer;
        z-index: 10;
        font-size: 16px;
        text-decoration: underline;
        transition: opacity 0.3s ease-in-out;
    }

    .scroll-to:hover {
        opacity: 0.7;
        color: #FF0000;
    }

    .scroll-button {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        z-index: 10;
        background: white;
        border: none;
        padding: 0.5rem;
        border-radius: 50%;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        cursor: pointer;
    }

    .scroll-button-left {
        left: -1rem;
    }

    .scroll-button-right {
        right: -1rem;
    }

    .posts-carousel::-webkit-scrollbar {
        display: none; 
    }

    .popup-overlay {
        position: fixed;
        top: 0; left: 0;
        width: 100vw; height: 100vh;
        background: rgba(0, 0, 0, 0.4);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 2000;
    }
    .popup-content {
        background: white;
        padding: 2rem;
        border-radius: 12px;
        max-width: 90%;
        text-align: center;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    }
</style>