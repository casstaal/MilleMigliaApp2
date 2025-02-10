<script setup lang="ts">
    import type { FetchError } from "ofetch";
    import type { Marker } from "@prisma/client";
    
    const errorMessage = ref("");
    const error = ref(false);
    const route = useRoute();

    const markerId = route.params.id;

    const { data: marker } = await useFetch<Marker>(`/api/markers/${markerId}`);
</script>

<template>

    <h1>{{ marker?.title }}</h1>

    <img src="https://mille-miglia-photos.s3.eu-north-1.amazonaws.com/imageBoardgame.jpg" alt="test" />

</template>