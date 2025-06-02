<script setup lang="ts">
  import { onMounted, ref } from 'vue';
  import { $fetch, FetchError } from 'ofetch';

  const error = ref(false);
  const errorMessage = ref('');

  onMounted(() => {
    setInterval(async () => {
      error.value = false;
      errorMessage.value = '';

      const response = await $fetch('/api/heartbeat', {
        method: 'POST',
      }).catch((e: FetchError) => {
        errorMessage.value = e?.data?.statusMessage || 'Heartbeat failed';
        error.value = true;
      });

      if (error.value || !response) {
        console.warn('Heartbeat error:', errorMessage.value);
        return;
      }

    }, 30000);
  });
</script>

<template>
    <div class="page-container">
      <AppHeader />
      
      <main class="content">
        <slot />
      </main>
  
      <AppFooter />
    </div>
  </template>
  
  <style scoped>
    html, body, #__nuxt, #__layout {
        height: 100%;
        margin: 0;
        padding: 0;
    }
    
    .page-container {
        display: flex;
        flex-direction: column;
        min-height: 100vh;
    }
    
    .content {
        flex: 1;
    }
  </style>