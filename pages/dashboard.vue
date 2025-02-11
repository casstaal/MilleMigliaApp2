<script setup lang="ts">
    import { ref, computed, onMounted } from "vue";
    import { useFetch } from "#app";
    import type { User } from "@prisma/client";
    import type { Marker } from "@prisma/client";
    import { Chart, registerables  } from 'chart.js';
    // import 'leaflet.markercluster';
    // import { MarkerClusterGroup } from 'leaflet.markercluster';

    Chart.register(...registerables);

    const search = ref<string>("");

    const users = ref<User[] | null>(null);
    const markers = ref<Marker[] | null>(null);

    const { data } = await useFetch<User[]>(`/api/users`);
    const { data: markerData } = await useFetch<Marker[]>(`/api/markers`);

    users.value = data.value;
    markers.value = markerData.value;

    const filteredUsers = computed(() => {
        return users.value?.filter((user: any) => {
            const query = search.value.toLowerCase();
            return user.name.toLowerCase().includes(query);
        })
    })

    const markersByYear = computed(() => {
        if (!markers.value) return {};

        // Initialize an object to store the count per year
        const yearCounts: Record<number, number> = {};

        // Loop through each marker and extract the year
        markers.value.forEach(marker => {
            const year = new Date(marker.date).getFullYear(); // Get the year from the date

            // Increment the count for that year
            if (yearCounts[year]) {
                yearCounts[year]++;
            } else {
                yearCounts[year] = 1;
            }
        });

        return yearCounts; // Return the object containing the year counts
    });

    const mapContainer = ref<HTMLElement | null>(null);

    onMounted(async () => {
        if (!mapContainer.value) return;

        const L = await import("leaflet");
        import("leaflet/dist/leaflet.css"); 

        const map = L.map(mapContainer.value).setView([41.9028, 12.4964], 13);

        L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(map);

        // const markers = L.markerClusterGroup();

        // markers?.value?.forEach((markerFromMarkers: any) => {
        //     // const marker = L.marker([markerFromMarkers.latitude, markerFromMarkers.longitude]).addTo(map);
        //     const latLon = [markerFromMarkers.latitude, markerFromMarkers.longitude];
        //     const leafletMarker = L.marker(latLon);
        //     markers.addLayer(leafletMarker);  
        // });

        var circle = L.circle([41.9028, 12.4964], {
            color: 'red',
            fillColor: '#f03',
            fillOpacity: 0.5,
            radius: 500
        }).addTo(map);

        const chartData = markersByYear.value;

        var years = Object.keys(chartData).map(year => parseInt(year)); // Get the years as an array
        var markerCounts = years.map(year => chartData[year]); // Get the corresponding marker counts

        new Chart("myChart", {
            type: "bar",
            data: {
                labels: years,
                datasets: [{
                    label: 'Aantal markers',
                    backgroundColor: "red",
                    data: markerCounts
                }]
            }
        });

        new Chart("myChart2", {
            type: "bar",
            data: {
                labels: years,
                datasets: [{
                    label: 'Aantal markers',
                    backgroundColor: "red",
                    data: markerCounts
                }]
            }
        });
    });
</script>

<template>
    <div class="row">
        <div class="col-lg-1"></div>
        <div class="py-5 col-lg-3 vh-40">
            <h1>Gebruikers</h1>
            <input class="form-control mb-3 mt-3 bg-white" type="text" v-model="search" placeholder="Search..." />
            <hr />

            <div class="overflow-auto vh-50">
                <div v-if="filteredUsers?.length === 0" class="text-center text-muted p-3">
                    Geen gebruikers gevonden
                </div>
                <div v-for="user in filteredUsers" :key="user.id" class="card p-3 shawod-sm mb-3 bg-white">
                    <div class="card-body">
                        <div class="row">
                            <div class="col-6 d-flex flex-column justify-content-center">
                                <p class="mb-1">
                                    <strong>{{ user.name }}</strong>
                                </p>
                                <p class="text-muted mb-0">{{ user.email }}</p>
                            </div>
                            <div class="col-6 d-flex align-items-center justify-content-end">
                                <p class="me-2 mb-0">Markers: 12</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-lg-1"></div>
        <div class="py-5 col-lg-6">
            <h1>
                Meest bezochte locatie
            </h1>
            <div ref="mapContainer" class="map-container"></div>
        </div>
        <div class="col-lg-1"></div>
        <div class="col-lg-1"></div>
        <div class="col-lg-10">
            <h1>
                Automerken 
            </h1>
            <p>Moet een graph statistics tabel komen, waar het aantal markers tegenover de automerken staat</p>
            <canvas id="myChart2" style="width:100%;"></canvas>
        </div>
        <div class="col-lg-1"></div>
        <div class="col-lg-1"></div>
        <div class="col-lg-10">
            <h1>
                Jaartallen 
            </h1>
            <canvas id="myChart" style="width:100%;"></canvas>
        </div>
    </div>
</template>

<style>
    .container {
        max-width: 600px;
        margin: auto;
    }

    .card {
        border-radius: 15px;
    }

    input::placeholder {
        font-style: italic;
    }

    .map-container {
        width: 100%;
        height: 597px; 
    }
</style>