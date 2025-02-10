<script setup lang="ts">
    const { signOut } = useAuth();

    const logout = () => {
        signOut();
    }

</script>


<template>
    <div class="header d-flex justify-content-start align-items-center">
        <img src="/MilleMigliaLogo.png" alt="Mille Miglia logo">
        <!-- <h1 class="d-flex align-items-center justify-content-center mx-auto">Mille Miglia</h1> -->
        <button class="btn-logout btn btn-primary" @click="logout">Logout</button>
    </div>
</template>

<style>
    .header {
        background-color: #003366;
        color: white;
    }

    @media screen and (max-width: 767px) {
        img {
            width: 125px;
            height: auto;
        }
    }
</style>