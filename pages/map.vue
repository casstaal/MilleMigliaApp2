<script setup lang="ts">
import type { Marker } from "@prisma/client";
import { onMounted, ref } from "vue";

const mapContainer = ref<HTMLElement | null>(null);
const loading = ref(true);

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
      `<b>${markerFromMarkers.brand} ${markerFromMarkers.model}</b><br>` +
      `<img src='${markerFromMarkers.images[0]}' alt='Image' style='width:100%; height:auto; display:block; margin:0 auto;'><br>` +      
      `<div style='text-align:center;'>
      <a href='/markers/${markerFromMarkers.id}' style='display:inline-block; padding:8px 12px; width: 100%; background-color:#003366; color:white; text-decoration:none; border-radius:4px;'>
        Zie details
      </a>
    </div>`    
    );
  });

  map.whenReady(() => {
            loading.value = false;
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
  <div v-if="loading" class="loading-container">
    <p class="text-center fs-1">De kaart wordt geladen.....</p>
  </div>
  <div ref="mapContainer" class="map-container"></div>
</template>

<style scoped>
.map-container {
  width: 100%;
  height: 1000px; 
}

.loading-container {
  width: 100%;
  height: 900px;
  border: 0px solid #fff;
}
</style>