<script setup lang="ts">
    import { Icon } from "@iconify/vue";

    const { signOut } = useAuth();

    const logout = () => {
        signOut();
    }

</script>


<template>
    <div class="header d-flex justify-content-between align-items-center">
        <img src="/MilleMigliaLogo.png" alt="Mille Miglia logo">
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
</template>

<style>
    .header {
        background-color: #003366;
        color: white;
    }

    img {
            width: 125px;
            height: auto;
    }

    .account-icon {
        font-size: 50px;
    }

    /* @media screen and (max-width: 767px) {
        img {
            width: 125px;
            height: auto;
        }
    } */
</style>