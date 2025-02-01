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
        <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d6150123.595697122!2d7.432466654884098!3d41.178384507429136!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12d4fe82448dd203%3A0xe22cf55c24635e6f!2sItaly!5e0!3m2!1sen!2snl!4v1738335598322!5m2!1sen!2snl" width="100%" height="100%" style="border:0;" allowfullscreen="true" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
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
</style>

<!-- <template>
    <div class="map-container">
      <div id="map" class="full-page">
        <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d6150123.595697122!2d7.432466654884098!3d41.178384507429136!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12d4fe82448dd203%3A0xe22cf55c24635e6f!2sItaly!5e0!3m2!1sen!2snl!4v1738335598322!5m2!1sen!2snl" width="100%" height="100%" style="border:0;" allowfullscreen="true" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        map: null,
        markers: [
          { lat: 41.9028, lng: 12.4964, title: "Rome" }, // Rome, Italy
          { lat: 43.7696, lng: 11.2558, title: "Florence" }, // Florence
          { lat: 45.4642, lng: 9.1900, title: "Milan" } // Milan
        ],
        polyline: null
      };
    },
    mounted() {
      this.initMap();
    },
    methods: {
      initMap() {
        this.map = new google.maps.Map(document.getElementById("map"), {
          center: { lat: 42.5, lng: 12.5 }, // Centered in Italy
          zoom: 6
        });
  
        this.addMarkers();
        this.drawRoute();
      },
      addMarkers() {
        this.markers.forEach((checkpoint) => {
          new google.maps.Marker({
            position: { lat: checkpoint.lat, lng: checkpoint.lng },
            map: this.map,
            title: checkpoint.title
          });
        });
      },
      drawRoute() {
        const pathCoordinates = this.markers.map((point) => ({
          lat: point.lat,
          lng: point.lng
        }));
  
        this.polyline = new google.maps.Polyline({
          path: pathCoordinates,
          geodesic: true,
          strokeColor: "#FF0000",
          strokeOpacity: 1.0,
          strokeWeight: 2
        });
  
        this.polyline.setMap(this.map);
      }
    }
  };
  </script>
  
  <style>
  /* Full-screen map */
  html, body {
    height: 100%;
    margin: 0;
  }

  .full-page {
    height: 100vh;
    width: 100%;
  }
  
  .map-container {
    height: 100vh;
    width: 100%;
  }
  </style> -->

<!-- <template>
    <div class="map-container">
      <div id="map" class="full-page">
        <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d6150123.595697122!2d7.432466654884098!3d41.178384507429136!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12d4fe82448dd203%3A0xe22cf55c24635e6f!2sItaly!5e0!3m2!1sen!2snl!4v1738335598322!5m2!1sen!2snl" width="100%" height="100%" style="border:0;" allowfullscreen="true" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>

      </div>
  
      <button class="fab" @click="toggleTheme">
        🌙
      </button>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        map: null,
        darkMode: false,
        styles: {
          dark: [
            { elementType: "geometry", stylers: [{ color: "#212121" }] },
            { elementType: "labels.text.stroke", stylers: [{ color: "#212121" }] },
            { elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
            { featureType: "water", stylers: [{ color: "#000000" }] }
          ],
          light: [] // Default Google Maps style
        }
      };
    },
    mounted() {
      this.initMap();
    },
    methods: {
      initMap() {
        this.map = new google.maps.Map(document.getElementById("map"), {
          center: { lat: 41.9028, lng: 12.4964 }, // Rome, Italy
          zoom: 6,
          styles: this.styles.light
        });
      },
      toggleTheme() {
        this.darkMode = !this.darkMode;
        this.map.setOptions({ styles: this.darkMode ? this.styles.dark : this.styles.light });
      }
    }
  };
  </script>
  
  <style>
  /* Ensure the map takes full screen */
  html, body {
    height: 100%;
    margin: 0;
  }

    .full-page {
        height: 100vh;
        width: 100%;
    }
  
  .map-container {
    position: relative;
    height: 100vh;
    width: 100%;
  }
  
  /* Floating Action Button (FAB) */
  .fab {
    position: absolute;
    bottom: 20px;
    right: 20px;
    background: #ff5722;
    color: white;
    border: none;
    padding: 15px;
    border-radius: 50%;
    font-size: 20px;
    cursor: pointer;
    box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.2);
    transition: 0.3s;
  }
  
  .fab:hover {
    background: #e64a19;
  }
  </style> -->