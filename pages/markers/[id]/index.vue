<script setup lang="ts">
    import type { FetchError } from "ofetch";
    import type { Marker, User } from "@prisma/client";
    import { onMounted, ref } from "vue";

    const route = useRoute();

    const markerId = route.params.id;

    const { data: marker } = await useFetch<Marker>(`/api/markers/${markerId}`);
    const user = await $fetch<User>(`/api/users/${marker?.value?.userId}`);
    const year = marker?.value?.date ? new Date(marker.value?.date).getFullYear() : "Invalid Date";

    const mapContainer = ref<HTMLElement | null>(null);

    onMounted(async () => {
        if (!mapContainer.value) return;

        const L = await import("leaflet");
        import("leaflet/dist/leaflet.css"); 

        const map = L.map(mapContainer.value).setView([41.9028, 12.4964], 6);

        L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(map);

        const latitude = marker?.value?.latitude ?? 0;
        const longitude = marker?.value?.longitude ?? 0; 

        const markerForMap = L.marker([latitude, longitude]).addTo(map);
        map.flyTo([latitude, longitude], map.getZoom() + 2);
    });
</script>

<template>
    <div class="row">
        <div class="car col-lg-6 col-sm-12 ms-3 mb-3">
            <h1>{{ marker?.brand }} {{ marker?.model }}</h1>
            <img class="carImg" :src="marker?.imgUrl" alt="test"/>
        </div>
        <div class="col-lg-5 col-sm-12 mt-5">
            <h4>Beschrijving:</h4>
            <p>
                Deze {{ marker?.brand }} {{ marker?.model }} is gefotografeerd door {{ user?.name }} tijdens de Mille Miglia van {{ year }}.
            </p>
            <div>
                <h4>Locatie:</h4>
                <div ref="mapContainer" class="map-container"></div>
            </div>
        </div>
    </div>
</template>

<style>

    .carImg {
        height: auto;
        width: 100%;
    }

    .map-container {
        width: 50%;
        height: 300px; 
    }

    @media screen and (max-width: 600px) {
        .carImg {
            height: auto;
            width: 100%;
        }

        .map-container {
            width: 100%;
            height: 300px; 
        }
    }
</style>