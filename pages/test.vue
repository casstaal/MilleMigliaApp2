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

//   var marker = L.marker([41.9028, 12.4964]).addTo(map);
//   marker.bindPopup(
//   "<b>Ferrari</b><br>" +
//   "<img src='https://images.pexels.com/photos/2664399/pexels-photo-2664399.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' alt='Image' style='width:100px; height:auto;'><br>" +
//   "<a href='/checks/73dfd6b6-e107-46e7-afb7-bdbcfd43d8fd'>Zie details</a>"
// );

  // Loop through each check and add a marker to the map
  checks.forEach((check) => {
    const marker = L.marker([check.latitude, check.longitude]).addTo(map);
    marker.bindPopup(
      `<b>${check.id}</b><br>` +
      `<img src='${check.imgUrl}' alt='Image' style='width:100px; height:auto;'><br>` +
      `<a href='/checks/${check.id}'>Zie details</a>`
    );
  });
});
</script>

<template>
  <div ref="mapContainer" class="map-container"></div>
</template>

<style scoped>
.map-container {
  width: 100%;
  height: 900px; /* Adjust height as needed */
}
</style>