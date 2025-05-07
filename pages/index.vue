<script setup lang="ts">
  const { getSession, data } = useAuth();

  const session = await getSession();

  // console.log("User session:", session);
  // console.log("User role:", session?.user?.role);
</script>

<template>
  <div class="page-container d-flex justify-content-center align-items-center vh-100">
    <div class="card p-4 shadow-lg" style="width: 20rem;">
      <h2 class="text-center mb-1">Welkom,</h2>
      <h5 class="text-center">{{ session?.user?.firstName }}</h5>
      <h5 class="text-center">{{ session?.user?.role }}</h5>

      <div v-if="session?.user?.role === 'user'" class="mb-3">
        <NuxtLink to="/map" class="start-button btn w-100 mt-4" style="background-color: #003366; color:white;">Ga naar kaart</NuxtLink>
      </div>

      <div v-else class="mb-3">
        <p class="text-center">U heeft beperkte toegang als gast.</p>
        <NuxtLink to="/map" class="start-button btn w-100 mt-4" style="background-color: #003366; color:white;">Ga naar kaart</NuxtLink>
      </div>
    </div>
  </div>
</template>