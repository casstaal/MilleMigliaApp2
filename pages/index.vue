<script setup lang="ts">
  const { getSession, data } = useAuth();

  const session = await getSession();

  console.log("User session:", session);
  console.log("User role:", session?.user?.role);
</script>

<template>
      <div class="page-container d-flex justify-content-center align-items-center vh-100">
    <div class="card p-4 shadow-lg" style="width: 20rem">
      <h2 class="text-center mb-1">Welkom,</h2>
      <h5 class="text-center">{{ session?.user?.firstName }}</h5>
      <h5 class="text-center">{{ session?.user?.role }}</h5>

      <div v-if="session?.user?.role === 'guest'" class="mb-3">
        <p>U heeft beperkte toegang als gast.</p>
        <NuxtLink to="/overview" class="start-button btn btn-primary w-100 mt-4">Ga naar kaart</NuxtLink>
      </div>

      <div v-if="session?.user?.role === 'user'" class="mb-3">
        <NuxtLink to="/overview" class="start-button btn btn-primary w-100 mt-4">Ga naar kaart</NuxtLink>
        <h1>test</h1>
      </div>
    </div>
  </div>
</template>