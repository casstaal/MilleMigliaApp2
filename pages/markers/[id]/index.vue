<script setup lang="ts">
    import type { FetchError } from "ofetch";
    import type { Marker, User } from "@prisma/client";
    import { onMounted, ref } from "vue";
import { string } from "zod";

    const isEditing = ref(false); 
    const editableMarker = ref<Marker>({
        id: '', brand: '', model: '', description: '', imgUrl: '', date: new Date(), latitude: 0, longitude: 0, userId: '',
        imgUrl2: "",
        imgUrl3: "",
        imgUrl4: "",
        imgUrl5: ""
    });
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

    const firstImage = ref(marker?.value?.imgUrl);
    // const secondImage = ref(marker?.value?.imgUrl2);
    // const thirdImage = ref(marker?.value?.imgUrl3);
    // const fourthImage = ref(marker?.value?.imgUrl4);

    const firstImageSelected = ref(true);
    const secondImageSelected = ref(false);
    const thirdImageSelected = ref(false);
    const fourthImageSelected = ref(false);

    function toggleImage(imgNumber: number) {
        if (imgNumber === 1) {
            firstImage.value = marker?.value?.imgUrl;
            firstImageSelected.value = true;
            secondImageSelected.value = false;
            thirdImageSelected.value = false;
            fourthImageSelected.value = false;
        } else if (imgNumber === 2) {
            firstImage.value = marker?.value?.imgUrl2;
            firstImageSelected.value = false;
            secondImageSelected.value = true;
            thirdImageSelected.value = false;
            fourthImageSelected.value = false;
        } else if (imgNumber === 3) {
            firstImage.value = marker?.value?.imgUrl3;
            firstImageSelected.value = false;
            secondImageSelected.value = false;
            thirdImageSelected.value = true;
            fourthImageSelected.value = false;
        } else if (imgNumber === 4) {
            firstImage.value = marker?.value?.imgUrl4;
            firstImageSelected.value = false;
            secondImageSelected.value = false;
            thirdImageSelected.value = false;
            fourthImageSelected.value = true;
        } 
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

    async function updateMarker() {
        const response = await $fetch<Marker>(`/api/markers/${markerId}`, { method: "put", body: editableMarker.value }).catch((e: FetchError) => {
            errorMessage.value = e.data.message;
            error.value = true;
        });

        if (error.value) {
            return;
        }

        if (!response) {
            errorMessage.value = "An error occurred";
            error.value = true;
            return;
        }

        navigateTo(`/map`);
        // navigateTo(`/markers/${markerId}`);
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
    const loading = ref(true);

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

        map.whenReady(() => {
            loading.value = false;
        });
    });
</script>

<template>
    <div class="row">
        <div class="col-lg-6 col-sm-12 mb-3 ms-3">
            <div class="row">
                <div class="col-lg-9 col-sm-12">
                    <div v-if="isEditing" class="mb-2 mt-2">
                        <input v-model="editableMarker.brand" style="font-size: 1.5rem;" placeholder="Merk"/>
                        <input v-model="editableMarker.model" style="font-size: 1.5rem;" placeholder="Model"/>
                    </div>
                    <span v-else><h1>{{ marker?.brand }} {{ marker?.model }}</h1></span>
                </div>
                <div class="col-lg-3 col-sm-12 mt-2">
                    <div v-if="isEditing">
                        <button @click="updateMarker" class="btn col-6" style="background-color: #003366; color: white;">Save</button>
                        <button @click="toggleEditMode" class="btn col-6" style="background-color: #FF0000; color: white;">Cancel</button>
                    </div>
                    <span v-else>
                        <button @click="toggleEditMode" class="btn col-6" style="background-color: #003366; color: white;">Edit</button>
                        <button @click="confirmDelete" class="btn col-6" style="background-color: #FF0000; color: white;">Delete</button>
                    </span>
                </div>
            </div>
            <img class="carImg" :src="firstImage" alt="test"/>
        </div>
        <div class="col-lg-5 col-sm-12 mt-5">
            <div>
                <h4>Informatie:</h4>
                <div>
                    <p>
                        Deze {{ marker?.brand }} {{ marker?.model }} is gefotografeerd door {{ user?.name }} tijdens de Mille Miglia van {{ year }}.
                    </p>
                    <div>
                        <h6>Datum:</h6>
                        <div v-if="isEditing">
                            <input type="date" v-model="editableMarker.date" placeholder="Datum"/>
                        </div>
                        <span v-else>
                            <p>{{ marker?.date ? new Date(marker.date).toISOString().split('T')[0] : '' }}</p>
                        </span>
                    </div>
                </div>
            </div>
            <div>
                <h4>Beschrijving {{ user?.name }}:</h4>
                <div v-if="isEditing">
                    <textarea 
                        class="w-100"
                        type="text"
                        v-model="editableMarker.description" 
                        placeholder="Description" 
                        cols="50"
                        rows="5">
                    </textarea>
                </div>
                <span v-else>
                    <p>{{ marker?.description }}</p>
                </span>
            </div>
            <div>
                <h4>Locatie:</h4>
                <div v-if="loading" class="loading-container">
                    <p>De kaart wordt geladen.....</p>
                </div>
                <div ref="mapContainer" class="map-container"></div>
            </div>
            <div class="mt-3">
                <h4>Beschrijving van Mille Miglia:</h4>
                <p>Het idee is om het nummer van de auto mee te geven en dan door de pdf heen te lezen, om zo de informatie op te vragen</p>
            </div>
        </div>
    </div>
    <div class="row">
        <div class="col-lg-6 ms-3 mb-3">
            <div class="row">
                <div v-if="marker?.imgUrl" class="col-lg-3">
                    <div v-if="!firstImageSelected">
                        <img class="carImg" :src="marker?.imgUrl" alt="test" @click="toggleImage(1)"/>
                    </div>
                    <div v-if="firstImageSelected" class="border border-4 border-danger">
                        <img class="carImg" :src="marker?.imgUrl" alt="test" @click="toggleImage(1)"/>
                    </div>
                </div>
                <div v-if="marker?.imgUrl2" class="col-lg-3">
                    <div v-if="!secondImageSelected">
                        <img class="carImg" :src="marker?.imgUrl2" alt="test" @click="toggleImage(2)"/>
                    </div>
                    <div v-if="secondImageSelected" class="border border-4 border-danger">
                        <img class="carImg" :src="marker?.imgUrl2" alt="test" @click="toggleImage(2)"/>
                    </div>
                </div>
                <div v-if="marker?.imgUrl3" class="col-lg-3">
                    <div v-if="!thirdImageSelected">
                        <img class="carImg" :src="marker?.imgUrl3" alt="test" @click="toggleImage(3)"/>
                    </div>
                    <div v-if="thirdImageSelected" class="border border-4 border-danger">
                        <img class="carImg" :src="marker?.imgUrl3" alt="test" @click="toggleImage(3)"/>
                    </div>
                </div>
                <div v-if="marker?.imgUrl4" class="col-lg-3">
                    <div v-if="!fourthImageSelected">
                        <img class="carImg" :src="marker?.imgUrl4" alt="test" @click="toggleImage(4)"/>
                    </div>
                    <div v-if="fourthImageSelected" class="border border-4 border-danger">
                        <img class="carImg" :src="marker?.imgUrl4" alt="test" @click="toggleImage(4)"/>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style>

    .carImg {
        height: auto;
        width: 100%;
        cursor: pointer;
    }

    .map-container {
        width: 50%;
        height: 300px; 
    }

    .loading-container {
        width: 50%;
        height: 300px;
        border: 2px solid #000000;
    }

    .btn:hover {
        transform: scale(1.05); 
        transition: transform 0.3s ease;
    }

    .row {
        margin-right: 0;
        overflow-x: hidden; 
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