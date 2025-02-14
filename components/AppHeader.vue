<script setup lang="ts">
    import { Icon } from "@iconify/vue";
    import { useWindowSize } from '@vueuse/core'

    const { width } = useWindowSize()

    const { signOut } = useAuth();

    const logout = () => {
        signOut();
    }

    const menuVisible = ref(false);

    const toggleMenu = () => {
        menuVisible.value = !menuVisible.value;
    };

</script>


<template>
    <nav class="navbar navbar-expand-lg d-flex align-items-center" :class="{ 'justify-content-between': width > 991 }" style="background-color: #003366; color:white">
        <img src="/MilleMigliaLogo.png" alt="Mille Miglia logo">
        <button class="navbar-toggler custom-toggler me-3" type="button" @click="toggleMenu">
            <span class="navbar-toggler-icon"></span>
        </button>

        <div v-if="menuVisible" class="fullscreen-menu">
            <ul class="mr-auto">
                <li class="nav-item">
                    <a class="nav-link text-white" href="#">Home</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link text-white" href="#">Overview</a>
                </li>
                <li>
                    <a class="nav-link text-white" href="#">Dashboard</a>
                </li>
            </ul>
            <div class="d-flex align-items-center justify-content-center">
                <button class="btn-logout btn" @click="logout" style="background-color: #FF0000; color:white;">Logout</button>
                <Icon icon="codicon:account" :style="{ fontSize: '48px'}" :ssr="true" class="me-3 ms-2" />
            </div>
            <button class="btn-close-menu" @click="toggleMenu" aria-label="Close">&times;</button>   
        </div>
        <div v-if="width > 991">
            <ul class="nav col-12 col-lg-auto me-lg-auto justify-content-center mb-md-0">
                <li>
                    <a href="#" class="nav-link text-white">Home</a>
                </li>
                <li>
                    <a  href="#" class="nav-link text-white">Overview</a>
                </li>
                <li>
                    <a  href="#" class="nav-link text-white">Dashboard</a>
                </li>
            </ul> 
            <div class="d-flex align-items-center justify-content-center">
                <button class="btn-logout btn" @click="logout" style="background-color: #FF0000; color:white;">Logout</button>
                <Icon icon="codicon:account" :style="{ fontSize: '48px'}" :ssr="true" class="me-3 ms-2" />         
            </div>
        </div>
    </nav> 
    <!-- <div class="header d-flex justify-content-between align-items-center">
        <img src="/MilleMigliaLogo.png" alt="Mille Miglia logo">

  </div> -->
        <!-- <ul class="nav col-12 col-lg-auto me-lg-auto justify-content-center mb-md-0">
            <li>
                <a href="#" class="nav-link text-white">Home</a>
            </li>
            <li>
                <a  href="#" class="nav-link text-white">Overview</a>
            </li>
            <li>
                <a  href="#" class="nav-link text-white">Dashboard</a>
            </li>
        </ul> -->
         <!-- <div class="d-flex align-items-center justify-content-center">
            <button class="btn-logout btn" @click="logout" style="background-color: #FF0000; color:white;">Logout</button>
            <Icon icon="codicon:account" :style="{ fontSize: '48px'}" :ssr="true" class="me-3 ms-2" />         
        </div>
    </div> -->
</template>

<style>
    img {
            width: 125px;
            height: auto;
    }

    .account-icon {
        font-size: 50px;
    }

    .fullscreen-menu {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: #003366;
        color: white;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }

    .navbar-toggler-icon {
        background-image: url("data:image/svg+xml;charset=UTF8,%3Csvg viewBox='0 0 30 30' xmlns='http://www.w3.org/2000/svg' fill='white'%3E%3Cpath stroke='white' stroke-width='2' stroke-linecap='round' stroke-miterlimit='10' d='M4 7h22M4 15h22M4 23h22'/%3E%3C/svg%3E");
    }

    .custom-toggler.navbar-toggler {
        border-color: white;
    }

    /* @media screen and (max-width: 767px) {
        img {
            width: 125px;
            height: auto;
        }
    } */
</style>