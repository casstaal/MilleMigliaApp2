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
    const selectedYears = ref<number[]>([]);
    const selectedBrands = ref<string[]>([]);
    const selectedUsers = ref<string[]>([]);

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

    const filteredMarkers = computed(() => {
        if (!markers.value) return [];

        return markers.value.filter(marker => {
            const year = new Date(marker.date).getFullYear();
            return (
                (selectedYears.value.length === 0 || selectedYears.value.includes(year)) &&
                (selectedBrands.value.length === 0 || selectedBrands.value.includes(marker.brand))
                // (selectedUsers.value.length === 0 || selectedUsers.value.includes(marker.userName)) // Adjust based on your data structure
            );
        });
    });

    const markersByYear = computed(() => {
        const yearCounts: Record<number, number> = {};

        filteredMarkers.value.forEach(marker => {
            const year = new Date(marker.date).getFullYear();
            yearCounts[year] = (yearCounts[year] || 0) + 1;
        });

        return yearCounts;
    });

    // const markersByYear = computed(() => {
    //     if (!markers.value) return {};

    //     // Initialize an object to store the count per year
    //     const yearCounts: Record<number, number> = {};

    //     // Loop through each marker and extract the year
    //     markers.value.forEach(marker => {
    //         const year = new Date(marker.date).getFullYear(); // Get the year from the date

    //         // Increment the count for that year
    //         if (yearCounts[year]) {
    //             yearCounts[year]++;
    //         } else {
    //             yearCounts[year] = 1;
    //         }
    //     });

    //     return yearCounts; // Return the object containing the year counts
    // });

    const chartData = markersByYear.value;

    var years = Object.keys(chartData).map(year => parseInt(year)); // Get the years as an array

    const getBrands = computed(() => {
        if (!markers.value) return {};

        return [...new Set(markers.value.map(marker => marker.brand))];
    });

    const brands = getBrands.value;
    
    const getModelsByBrand = (brand: any) => {
        if (!markers.value) return [];
        return [...new Set(markers.value
            .filter(marker => marker.brand === brand)
            .map(marker => marker.model))];
    };

    const models = getModelsByBrand("Ferrari").values;
    
    const mapContainer = ref<HTMLElement | null>(null);

    let chart: Chart | null = null;

    watch(markersByYear, () => {
            updateChart();
        });

        function updateChart() {
            if (!chart) return;

            chart.data.labels = Object.keys(markersByYear.value).map(year => parseInt(year));
            chart.data.datasets[0].data = Object.values(markersByYear.value);
            chart.update();
        }

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

        var markerCounts = years.map(year => chartData[year]); // Get the corresponding marker counts

        chart = new Chart("myChart", {
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

            <div class="overflow-auto" style="max-height: 520px">
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
                Statistieken 
            </h1>
            <canvas id="myChart" style="width:100%;"></canvas>
        </div>
        <div class="col-lg-1"></div>
        <div class="row">
            <div class="col-lg-1"></div>
            <div class="col-lg-2">
                <h5>Year filters</h5>
                <div>
                    <input class="me-2" type="checkbox" id="selectAll">
                    <label for="selectAll">Select all</label>
                </div>
                <div v-for="year in years" :key="year">
                    <input class="me-2" type="checkbox" :id="'year-' + year" :value="year" v-model="selectedYears">
                    <label :for="'year-' + year">{{ year }}</label>
                </div>
            </div>
            <div class="col-lg-2">
                <h5>Brand filters</h5>
                <div v-for="brand in brands" :key="brand">
                    <input class="me-2" type="checkbox" :id="'brand-' + brand" :value="brand" v-model="selectedBrands">
                    <label :for="'brand-' + brand">{{ brand }}</label>
                </div>
            </div>
            <!-- <div class="col-lg-2">
                <h5>Model filters</h5>
                <div v-for="model in models">
                    <input class="me-2" type="checkbox" :id="'model-' + model" :value="model">
                    <label :for="'model-' + model">{{ model }}</label>
                </div>
            </div> -->
            <div class="col-lg-2">
                <h5>User filters</h5>
                <div v-for="user in users">
                    <input class="me-2" type="checkbox" :id="'user-' + user.id" :value="user.name">
                    <label :for="'user-' + user.name">{{ user.name }}</label>
                </div>
            </div>
            <!-- <div class="col-lg-2">
                <button class="btn" type="button" style="background-color: #FF0000; color: white;" @click="updateChart">Save Filters</button>
            </div> -->
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