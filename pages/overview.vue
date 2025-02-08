<script setup lang="ts">
  import { ref, onMounted } from "vue";

  const zoom = ref(2);
  const center = ref([47.41322, -1.219482]);

  let LMap: any;
  let LTileLayer: any;

  onMounted(async () => {
    if (process.client) {
      const { LMap: Map, LTileLayer: TileLayer } = await import("@vue-leaflet/vue-leaflet");
      LMap = Map;
      LTileLayer = TileLayer;
    }
  });
</script>

<template>
    <div class="dropdown justify-content-right pt-3 pb-3">
        <button class="btn dropdown-button dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
            Dropdown button
        </button>
        <ul class="dropdown-menu">
            <li><a class="dropdown-item" href="#">Action</a></li>
            <li><a class="dropdown-item" href="#">Another action</a></li>
            <li><a class="dropdown-item" href="#">Something else here</a></li>
        </ul>
    </div>
    <div class="full-page">
        <l-map v-if="LMap" ref="map" v-model:zoom="zoom" :center="center">
          <l-tile-layer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            layer-type="base"
            name="OpenStreetMap"
          ></l-tile-layer>
      </l-map>
    </div>
</template>

<style>
    html, body {
        height: 100%;
        margin: 0;
    }

    .full-page {
        height: 100vh;
        width: 100%;
    }

    .dropdown-button {
      background-color: #FF0000;
      color: white;
    }

    /* .fab {
    position: absolute;
    top: 220px;
    right: 20px;
    background: #FF0000;
    color: white;
    border: none;
    padding: 14px;
    padding-right: 20px;
    padding-left: 20px;
    border-radius: 50%;
    font-size: 30px;
    cursor: pointer;
    box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.2);
    transition: 0.3s;
  }
  
  .fab:hover {
    background: #a51818;
  } */
</style>
