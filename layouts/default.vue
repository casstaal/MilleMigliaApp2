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