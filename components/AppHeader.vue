<script setup lang="ts">
    import { Icon } from "@iconify/vue";

    const { signOut } = useAuth();

    const logout = () => {
        signOut();
    }
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
            <div class="collapse navbar-collapse" id="navbarSupportedContent">
                <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                    <li class="nav-item">
                        <a class="nav-link text-white" href="/">Home</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link text-white" href="/map">Map</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link text-white" href="#">Dashboard</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link text-white" href="/blog">Blog</a>
                    </li>
                </ul>
                <div class="d-flex align-items-center justify-content-center">
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
</style>