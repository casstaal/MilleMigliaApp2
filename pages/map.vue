<script setup lang="ts">
import type { Marker, User } from "@prisma/client";
import { onMounted, ref } from "vue";

definePageMeta({
  middleware: 'my-middleware'
})

const mapContainer = ref<HTMLElement | null>(null);
const loading = ref(true);

const users = ref<User[] | null>(null);
const { data } = await useFetch<User[]>(`/api/users`);
users.value = data.value;

console.log(users);

const markers = ref<Marker[] | null>(null);
const { data: markerData } = await useFetch<Marker[]>(`/api/markers`);
markers.value = markerData.value;

const selectedYears = ref<number[]>([]);
const selectedBrands = ref<string[]>([]);
const selectedUsers = ref<string[]>([]);
const selectedModels = ref<string[]>([]);
const expandedBrand = ref<string | null>(null);

function toggleBrand(brand: string) {
  if (expandedBrand.value === brand) {
    expandedBrand.value = null;
  } else {
    expandedBrand.value = brand;
  }
}

const uniqueYears = computed(() => {
  if (!markers.value) return [];

  const years = markers.value.map(marker => new Date(marker.date).getFullYear());
  return Array.from(new Set(years)).sort();
});

const uniqueBrands = computed(() => {
  if (!markers.value) return [];

  const brands = markers.value.map(marker => marker.brand);
  return Array.from(new Set(brands)).sort();
});

function uniqueModels(brand: string): string[] {
  if(!markers.value) return [];

  const models = markers.value
    .filter(marker => marker.brand === brand)
    .map(marker => marker.model);
  return Array.from(new Set(models)).sort();
}

const filteredMarkers = computed(() => {
  if (!markers.value) return [];

  return markers.value.filter(marker => {
    const matchesYear = selectedYears.value.length === 0 || selectedYears.value.includes(new Date(marker.date).getFullYear());
    const matchesBrand = selectedBrands.value.length === 0 || selectedBrands.value.includes(marker.brand);
    const matchesUser = selectedUsers.value.length === 0 || selectedUsers.value.includes(marker.userId);
    const matchesModel = selectedModels.value.length === 0 || selectedModels.value.includes(marker.model);

    return matchesYear && matchesBrand && matchesUser && matchesModel;
  });
});

const mapMarkers = ref<any[]>([]);
let map: any = null;

onMounted(async () => {
  if (!mapContainer.value) return;

  const L = await import("leaflet");
  import("leaflet/dist/leaflet.css"); 

  delete (L.Icon.Default.prototype as any)._getIconUrl;

  L.Icon.Default.mergeOptions({
    iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).href,
    iconUrl: new URL('leaflet/dist/images/marker-icon.png', import.meta.url).href,
    shadowUrl: new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).href,
  });

  map = L.map(mapContainer.value).setView([41.9028, 12.4964], 6);

  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);

  watch(filteredMarkers, (newMarkers) => {
    // Remove old markers
    mapMarkers.value.forEach(marker => marker.remove());
    mapMarkers.value = [];


    // Add new markers
    newMarkers.forEach(markerFromMarkers => {
      const marker = L.marker([
        Number(markerFromMarkers.latitude),
        Number(markerFromMarkers.longitude),
      ]).addTo(map);

      marker.bindPopup(
        `<b>${markerFromMarkers.brand} ${markerFromMarkers.model}</b><br>` +
        `<img src='${markerFromMarkers.images[0]}' alt='Image' style='width:100%; height:auto; display:block; margin:0 auto;'><br>` +
        `<div style='text-align:center;'>
          <a href='/markers/${markerFromMarkers.id}' style='display:inline-block; padding:8px 12px; width: 100%; background-color:#003366; color:white; text-decoration:none; border-radius:4px;'>
            Zie details
          </a>
        </div>`
      );
      mapMarkers.value.push(marker);
    });
  }, { immediate: true });

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
  <div ref="mapContainer" class="map-container">
    <div class="dropdown dropdown-overlay" @click.stop @mousedown.stop @mouseup.stop @touchstart.stop>
      <button class="btn btn-lg dropdown-button dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
        Filter
      </button>
      <ul class="dropdown-menu">
          <li class="sub-menu2 dropstart">
            <a href="#" class="dropdown-item dropdown-toggle our-pick-2" data-toggle="dropdown">Jaar</a>
            <ul class="dropdown-menu our-pick-menu">
              <li v-for="year in uniqueYears" :key="year">
                <label>
                  <input
                    type="checkbox"
                    :value="year"
                    v-model="selectedYears"
                  />
                  {{ year }}
                </label>
              </li>
            </ul>
          </li>
          <li class="sub-menu2 dropstart">
            <a href="#" class="dropdown-item dropdown-toggle our-pick-2" data-toggle="dropdown">Merk</a>
            <ul class="dropdown-menu our-pick-menu">
              <li 
                v-for="brand in uniqueBrands" 
                :key="brand"
                class="sub-menu2 dropstart"
              >
                <div style="display: flex; align-items: center; justify-content: space-between;">
                  <label style="flex-grow: 1;">
                    <input
                      type="checkbox"
                      :value="brand"
                      v-model="selectedBrands"
                    />
                    {{ brand }}
                  </label>
                  <button @click="toggleBrand(brand)" style="background: none; border: none; cursor: pointer;">
                    {{ expandedBrand === brand ? '▲' : '▼' }}
                  </button>
                </div>
                <ul v-if="expandedBrand === brand" class="dropdown-menu our-pick-menu">
                  <li 
                    v-for="model in uniqueModels(brand)" 
                    :key="model"
                  >
                    <label>
                      <input
                        type="checkbox"
                        :value="model"
                        v-model="selectedModels"
                      />
                      {{ model }}
                    </label>
                  </li>
                </ul>
              </li>
            </ul>
          </li>
          <li class="sub-menu2 dropstart">
            <a href="#" class="dropdown-item dropdown-toggle our-pick-2" data-toggle="dropdown">Gebruiker</a>
            <ul class="dropdown-menu our-pick-menu">
              <li v-for="user in users" :key="user.name">
                <label>
                  <input
                    type="checkbox"
                    :value="user.id"
                    v-model="selectedUsers"
                  />
                  {{ user.name }}
                </label>
              </li>
            </ul>
          </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.map-container {
  width: 100%;
  height: 100vh; 
  position: relative;
}

.dropdown-overlay {
  position: fixed;
  top: 100px;
  right: 20px;
  z-index: 1000;
  pointer-events: auto;
}

.dropdown-menu,
.dropdown-item {
  pointer-events: auto;
}

.dropdown-button {
  width: 150px;
  background-color: #003366;
  color: white;
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

.sub-menu2.dropstart .dropdown-menu.our-pick-menu {
  top: 0;
  left: auto;
  right: 100%;
  margin-top: 0;
  margin-left: 0;
}

</style>