<script setup lang="ts">
import type { Check } from "@prisma/client";
import { onMounted, ref } from "vue";

const mapContainer = ref<HTMLElement | null>(null);

onMounted(async () => {
  if (!mapContainer.value) return;

  const L = await import("leaflet");
  import("leaflet/dist/leaflet.css"); 

  const checks = await $fetch<Check[]>(`/api/checks`);

  const map = L.map(mapContainer.value).setView([41.9028, 12.4964], 6);

  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);

  checks.forEach((check) => {
    const marker = L.marker([check.latitude, check.longitude]).addTo(map);
    marker.bindPopup(
      `<b>${check.title}</b><br>` +
      `<img src='${check.imgUrl}' alt='Image' style='width:100px; height:auto;'><br>` +
      `<a href='/checks/${check.id}'>Zie details</a>`
    );
  });


  function onMapClick(e: any) {
    const lat = e.latlng.lat;
    const lng = e.latlng.lng;

    window.location.href = `addCheck?lat=${lat}&lng=${lng}`;
  }

  map.on('click', onMapClick);
});
</script>

<template>
  <div ref="mapContainer" class="map-container"></div>
</template>

<style scoped>
.map-container {
  width: 100%;
  height: 900px; 
}
</style>