<script setup lang="ts">
import type { Marker } from "@prisma/client";
import { onMounted, ref } from "vue";

const mapContainer = ref<HTMLElement | null>(null);

onMounted(async () => {
  if (!mapContainer.value) return;

  const L = await import("leaflet");
  import("leaflet/dist/leaflet.css"); 

  const markers = await $fetch<Marker[]>(`/api/markers`);

  const map = L.map(mapContainer.value).setView([41.9028, 12.4964], 6);

  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);

  markers.forEach((markerFromMarkers) => {
    const marker = L.marker([markerFromMarkers.latitude, markerFromMarkers.longitude]).addTo(map);
    marker.bindPopup(
      `<b>${markerFromMarkers.title}</b><br>` +
      `<img src='${markerFromMarkers.imgUrl}' alt='Image' style='width:100px; height:auto;'><br>` +
      `<a href='/markers/${markerFromMarkers.id}'>Zie details</a>`
    );
  });


  function onMapClick(e: any) {
    const lat = e.latlng.lat;
    const lng = e.latlng.lng;

    window.location.href = `addMarker?lat=${lat}&lng=${lng}`;
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