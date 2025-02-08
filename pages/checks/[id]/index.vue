<script setup lang="ts">
    import type { FetchError } from "ofetch";
    import type { Check } from "@prisma/client";
    
    const errorMessage = ref("");
    const error = ref(false);
    const route = useRoute();

    const checkId = route.params.id;

    const { data: check } = await useFetch<Check>(`/api/checks/${checkId}`);
</script>

<template>

    <h1>{{ check?.title }}</h1>

    <img src="https://mille-miglia-photos.s3.eu-north-1.amazonaws.com/imageBoardgame.jpg" alt="test" />

</template>