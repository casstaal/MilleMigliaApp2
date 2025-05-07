<script setup lang="ts">
    import { Icon } from "@iconify/vue";

    const { data: session, status, signOut } = useAuth();

    const route = useRoute();

    const logout = () => {
        signOut();
    }

    const isLoggedIn = computed(() => status.value === 'authenticated');

    const newPost = ref(false);

    onMounted(async () => {
        const response = await $fetch("/api/posts/check-new", { credentials: "include" }).catch(() => null);

        if (response?.newPostAvailable) {
            newPost.value = true;
        }
    });
</script>


<template>
    <nav class="navbar navbar-expand-lg bg-body-tertiary mt-0 mb-0">
        <div class="container-fluid" style="background-color: #003366; color:white">
            <a href="/">
                <img src="/MilleMigliaLogo.png" alt="Mille Miglia logo">
            </a>
            <button class="navbar-toggler custom-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse justify-content-center" id="navbarSupportedContent">
                <ul class="navbar-nav flex-lg-row flex-column me-auto mb-2 mb-lg-0 align-items-center">
                    <li class="nav-item">
                        <a :class="['nav-link text-white', { active: route.path === '/'}]" href="/">Home</a>
                    </li>
                    <li class="nav-item">
                        <a :class="['nav-link text-white', { active: route.path === '/map' }]" href="/map">
                        Map
                        </a>
                    </li>
                    <li class="nav-item">
                        <a :class="['nav-link text-white', { active: route.path === '#'}]" href="#">Dashboard</a>
                    </li>
                    <li class="nav-item position-relative">
                        <a :class="['nav-link text-white', { active: route.path === '/blog'}]" href="/blog">Blog</a>
                        <span v-if="newPost" 
                            class="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle">
                            <span class="visually-hidden">New posts</span>
                        </span>
                    </li>
                </ul>
                <div v-if="!isLoggedIn" class="d-flex align-items-center justify-content-center">
                    <NuxtLink to="/login" class="login-button fw-bold fs-4">Login</NuxtLink>
                </div>
                <div v-if="isLoggedIn" class="d-flex align-items-center justify-content-center">
                    <button class="btn-logout btn" @click="logout" style="background-color: #FF0000; color:white;">Logout</button>
                    <a href="/account" class="nav-link text-white">
                        <Icon icon="codicon:account" :style="{ fontSize: '48px'}" :ssr="true" class="me-3 ms-2" />         
                    </a>
                </div>
            </div>
        </div>
    </nav>
</template>

<style>
    img {
            width: 125px;
            height: auto;
    }

    .account-icon {
        font-size: 50px;
    }

    .navbar-toggler-icon {
        background-image: url("data:image/svg+xml;charset=UTF8,%3Csvg viewBox='0 0 30 30' xmlns='http://www.w3.org/2000/svg' fill='white'%3E%3Cpath stroke='white' stroke-width='2' stroke-linecap='round' stroke-miterlimit='10' d='M4 7h22M4 15h22M4 23h22'/%3E%3C/svg%3E");
    }

    .custom-toggler.navbar-toggler {
        border-color: white;
    }

    .navbar {
        padding-top: 0 !important;
        padding-bottom: 0 !important;
        margin-top: 0 !important;
        margin-bottom: 0 !important;
    }

    .login-button {
        color: white;
    }

    .login-button:hover {
        color: #FF0000;
    }

    .nav-link:hover {
        color: #FF0000 !important;
    }

    .nav-link.active {
        color: #FF0000 !important;
        font-weight: bold;
    }

</style>