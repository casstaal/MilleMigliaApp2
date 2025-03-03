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
  <div class="dropdown d-flex justify-content-end mt-3 mb-3 me-3">
    <button class="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
      Dropdown button
    </button>
    <ul class="dropdown-menu">
      <div class="btn-group dropstart">
        <li class="sub-menu2"><a href="#" class="dropdown-item dropdown-toggle our-pick-2" data-toggle="dropdown">Our Pick 2</a>
          <ul class="dropdown-menu our-pick-menu">
            <li><a href="2019.html" class="dropdown-item">2021</a></li>
            <li><a href="2020.html" class="dropdown-item">2022</a></li>
          </ul>
        </li>
      </div>
      <li><a class="dropdown-item" href="#">Jaar</a></li>
      <li><a class="dropdown-item" href="#">Gebruiker</a></li>
    </ul>
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

.sub-menu:hover .games-menu {
  display: block;
}

.sub-menu2:hover .our-pick-menu {
  display: block;
}

</style>