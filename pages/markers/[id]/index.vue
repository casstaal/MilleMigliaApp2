<script setup lang="ts">
    import type { FetchError } from "ofetch";
    import type { Marker, User } from "@prisma/client";
    import { onMounted, ref } from "vue";

    const isEditing = ref(false); 
    const editableMarker = ref<Marker>({ id: '', brand: '', model: '', imgUrl: '', date: new Date(), latitude: 0, longitude: 0, userId: '' }); // Initialized with defaults
    const route = useRoute();
    const errorMessage = ref("");
    const error = ref(false);

    const markerId = route.params.id;

    const { data: marker } = await useFetch<Marker>(`/api/markers/${markerId}`);
    const user = await $fetch<User>(`/api/users/${marker?.value?.userId}`);
    const year = marker?.value?.date ? new Date(marker.value?.date).getFullYear() : "Invalid Date";

    if (marker?.value) {
        editableMarker.value = {
            ...marker.value,
            date: marker.value.date ? new Date(marker.value.date) : new Date(),
        };
    }

    function toggleEditMode() {
        isEditing.value = !isEditing.value;
    }

    async function deleteFileFromMinIO() {
        const minioUrl: string = marker?.value?.imgUrl ?? "";

        try {
            const response = await fetch(minioUrl, {
                method: "DELETE"
            });

            if (!response.ok) {
                console.error("Delete failed:", response.statusText);
                return;
            }
        } catch (error) {
            console.error("Delete error:", error);
            return;
        }
    }

    async function deleteMarker() {
        const response = await $fetch<Marker>(`/api/markers/${markerId}`, { method: "delete"}).catch((e: FetchError) => {
            errorMessage.value = e.data.message;
            error.value = true;
        });

        deleteFileFromMinIO();

        if (error.value) {
            return;
        }

        if (!response) {
            errorMessage.value = "An error occurred";
            error.value = true;
            return;
        }

        navigateTo(`/map`);
    }

    async function confirmDelete() {
        const userConfirmed = confirm("Weet je zeker dat je deze marker wilt verwijderen?");

        if (userConfirmed) {
            await deleteMarker();
        }
    }

    const mapContainer = ref<HTMLElement | null>(null);

    onMounted(async () => {
        if (!mapContainer.value) return;

        const L = await import("leaflet");
        import("leaflet/dist/leaflet.css"); 

        const map = L.map(mapContainer.value).setView([41.9028, 12.4964], 6);

        L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(map);

        const latitude = marker?.value?.latitude ?? 0;
        const longitude = marker?.value?.longitude ?? 0; 

        const markerForMap = L.marker([latitude, longitude]).addTo(map);
        map.flyTo([latitude, longitude], map.getZoom() + 2);
    });
</script>

<template>
    <div class="row">
        <div class="car col-lg-6 col-sm-12 ms-3 mb-3">
            <div class="row">
                <div class="col-lg-9 col-sm-12">
                    <div v-if="isEditing">
                        <input v-model="editableMarker.brand" style="font-size: 1.5rem;" placeholder="Merk"/>
                        <input v-model="editableMarker.model" style="font-size: 1.5rem;" placeholder="Model"/>
                    </div>
                    <span v-else><h1>{{ marker?.brand }} {{ marker?.model }}</h1></span>
                </div>
                <div class="col-lg-3 col-sm-12 mt-2">
                    <button @click="toggleEditMode" class="btn col-6" style="background-color: #003366; color: white;">Edit</button>
                    <button @click="confirmDelete" class="btn col-6" style="background-color: #FF0000; color: white;">Delete</button>
                </div>
            </div>
            <img class="carImg" :src="marker?.imgUrl" alt="test"/>
        </div>
        <div class="col-lg-5 col-sm-12 mt-5">
            <div>
                <h4>Informatie:</h4>
                <div>
                    <p>
                        Deze {{ marker?.brand }} {{ marker?.model }} is gefotografeerd door {{ user?.name }} tijdens de Mille Miglia van {{ year }}.
                    </p>
                    <div class="row">
                        <h6>Datum:</h6>
                        <p>{{ marker?.date }}</p>
                    </div>
                </div>
            </div>
            <div>
                <h4>Beschrijving {{ user?.name }}:</h4>
                <p>"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."</p>
            </div>
            <div>
                <h4>Locatie:</h4>
                <div ref="mapContainer" class="map-container"></div>
            </div>
            <div>
                <h4>Beschrijving van Mille Miglia:</h4>
                <p>Het idee is om het nummer van de auto mee te geven en dan door de pdf heen te lezen, om zo de informatie op te vragen</p>
            </div>
        </div>
    </div>
</template>

<style>

    .carImg {
        height: auto;
        width: 100%;
    }

    .map-container {
        width: 50%;
        height: 300px; 
    }

    .btn:hover {
        transform: scale(1.1); 
        transition: transform 0.3s ease;
    }

    @media screen and (max-width: 600px) {
        .carImg {
            height: auto;
            width: 100%;
        }

        .map-container {
            width: 100%;
            height: 300px; 
        }
    }
</style>