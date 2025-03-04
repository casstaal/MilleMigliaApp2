<script setup lang="ts">
    import type { FetchError } from "ofetch";
    import type { Marker, User } from "@prisma/client";
    import { onMounted, ref } from "vue";
    import { string } from "zod";
    import { Icon } from "@iconify/vue";


    const isEditing = ref(false); 
    const editableMarker = ref<Marker>({
        id: '', brand: '', model: '', description: '', images: [], date: new Date(), latitude: 0, longitude: 0, userId: ''
    });
    const route = useRoute();
    const errorMessage = ref("");
    const error = ref(false);

    const markerId = route.params.id;

    const { data: marker } = await useFetch<Marker>(`/api/markers/${markerId}`);
    const user = await useFetch<User>(`/api/users/${marker?.value?.userId}`);
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

    const firstImage = ref(marker?.value?.images[0]);
    // const secondImage = ref(marker?.value?.imgUrl2);
    // const thirdImage = ref(marker?.value?.imgUrl3);
    // const fourthImage = ref(marker?.value?.imgUrl4);

    const firstImageSelected = ref(true);
    const secondImageSelected = ref(false);
    const thirdImageSelected = ref(false);
    const fourthImageSelected = ref(false);

    function toggleImage(imgNumber: number) {
        if (imgNumber === 1) {
            firstImage.value = marker?.value?.images[0];
            firstImageSelected.value = true;
            secondImageSelected.value = false;
            thirdImageSelected.value = false;
            fourthImageSelected.value = false;
        } else if (imgNumber === 2) {
            firstImage.value = marker?.value?.images[1];
            firstImageSelected.value = false;
            secondImageSelected.value = true;
            thirdImageSelected.value = false;
            fourthImageSelected.value = false;
        } else if (imgNumber === 3) {
            firstImage.value = marker?.value?.images[2];
            firstImageSelected.value = false;
            secondImageSelected.value = false;
            thirdImageSelected.value = true;
            fourthImageSelected.value = false;
        } else if (imgNumber === 4) {
            firstImage.value = marker?.value?.images[3];
            firstImageSelected.value = false;
            secondImageSelected.value = false;
            thirdImageSelected.value = false;
            fourthImageSelected.value = true;
        } 
    }

    async function deleteFileFromMinIO() {
        if(!marker?.value?.images || marker?.value?.images == null) {
            console.log("failed to delete minio urls");
            return;
        }
        for (const image of marker?.value?.images) {
            if (!image || image == null) {
                console.log("failed to delete");
                return;
            }

            try {
                const response = await fetch(image, {
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
    }

    async function deleteFileFromMinioAndDatabase(index: number) {
        const minioUrl = marker?.value?.images[index] ? marker?.value?.images[index] : '';

        editableMarker.value.images[index] = '';

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

    async function confirmImageDelete(index: number) {
        const userConfirmed = confirm("Weet je zeker dat je deze afbeelding wilt verwijderen?");

        if (userConfirmed) {
            await deleteFileFromMinioAndDatabase(index);
        }
    }

    const handleFileChange = async (event: Event, index: number) => {
        const input = event.target as HTMLInputElement;
        if (!input.files || input.files.length === 0) {
            // image.value = null;
            return;
        }

        const file = input.files[0];
        // image.value = file;
        await uploadFile(file, index);
    };

    const uploadFile = async (file: File, index: number) => {
        const fileName = `${Date.now()}-${file.name}`;
        const minioUrl = `${import.meta.env.VITE_MINIO_ENDPOINT}/${import.meta.env.VITE_MINIO_BUCKET}/${fileName}`;

        try {
            const response = await fetch(minioUrl, {
                method: "PUT",
                headers: { "Content-Type": file.type },
                body: file,
            });

            if (response.ok) {
                editableMarker.value.images[index] = minioUrl;
            } else {
                console.error("Upload failed:", response.statusText);
                throw response.statusText
            }
        } catch (error) {
            console.error("Upload error:", error);
            throw error;
        }
    }

    async function updateMarker() {
        const nonEmptyImages = editableMarker.value.images.filter(image => image !== '');
        const emptyImages = editableMarker.value.images.filter(image => image === '');
        
        editableMarker.value.images = [...nonEmptyImages, ...emptyImages];

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

        window.location.reload();
        // navigateTo(`/map`);
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

    const isPopupVisible = ref(false);  

    const togglePopup = () => {
        isPopupVisible.value = !isPopupVisible.value;  
    };

    const mapContainer = ref<HTMLElement | null>(null);
    const loading = ref(true);

    const newMarker = ref(false);
    const isMapClickable = ref(true);
    const mapInstance = ref<any>(null);
    let currentMarker: any = null; 
    let tempMarker: any = null; 

    onMounted(async () => {
        if (!mapContainer.value) return;

        const L = await import("leaflet");
        import("leaflet/dist/leaflet.css"); 

        const map = L.map(mapContainer.value).setView([41.9028, 12.4964], 6);
        mapInstance.value = map;

        L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(map);

        const latitude = marker?.value?.latitude ?? 0;
        const longitude = marker?.value?.longitude ?? 0; 

        currentMarker = L.marker([latitude, longitude]).addTo(map);
        map.flyTo([latitude, longitude], map.getZoom() + 2);

        map.whenReady(() => {
            loading.value = false;
        });
        
        function onMapClick(e: any) {
            const lat = e.latlng.lat; 
            const lng = e.latlng.lng;

            if (tempMarker) {
                map.removeLayer(tempMarker);
            }
            
            tempMarker = L.marker([lat, lng]).addTo(map);

            editableMarker.value.latitude = lat;
            editableMarker.value.longitude = lng;
            isMapClickable.value = false;
            newMarker.value = true;
        }

        map.on('click', onMapClick);
    });

    function saveMarker() {
        if (!mapInstance.value) return; 

        if (tempMarker) {

            if (currentMarker) {
                mapInstance.value.removeLayer(currentMarker);
            }

            currentMarker = tempMarker;
            tempMarker = null;
        }
        newMarker.value = false;
        isMapClickable.value = true;
    }

    function cancelMarker() {
        if (!mapInstance.value) return; 

        if (tempMarker) {
            mapInstance.value.removeLayer(tempMarker);
            tempMarker = null;
        }

        newMarker.value = false;
        isMapClickable.value = true;
    }

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
                    <div class="row">
                        <div class="col-lg-7">
                            <p>
                                Deze {{ marker?.brand }} {{ marker?.model }} is gefotografeerd door {{ user?.data?.value?.name }} tijdens de Mille Miglia van {{ year }}.
                            </p>
                        </div>
                        <div v-if="isEditing" class="col-lg-1">
                            <Icon icon="codicon:lightbulb" :style="{ fontSize: '26px', cursor: 'pointer', color: '#003366' }" :ssr="true" @click="togglePopup" />
                        </div>
                        <div v-if="isPopupVisible" class="popup">
                            <p>Deze informatie wordt automatisch gegenereed op basis van het merk, het model en de datum, en kan daardoor niet worden aangepast.</p>
                            <button @click="togglePopup">Close</button>
                        </div>
                    </div>
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
                <h4>Beschrijving {{ user?.data?.value?.name }}:</h4>
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
                <div v-if="isEditing">
                    <div class="row">
                        <div class="col-lg-4">
                            <p>Klik op de map om de locatie te updaten.</p>
                        </div>
                        <div v-if="newMarker" class="col-lg-3 ms-5">
                            <button class="btn" style="background-color: #003366; color: white;" @click="saveMarker">Save</button>
                            <button class="btn" style="background-color: #FF0000; color: white;" @click="cancelMarker">Cancel</button>
                        </div>
                    </div>
                </div>
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
                <!-- First image -->
                <div v-if="!marker?.images[0] && isEditing" class="col-lg-3 border d-flex justify-content-center align-items-center bg-light">
                    <label for="fileInput1" class="d-flex justify-content-center align-items-center" style="cursor: pointer;">
                        <Icon icon="codicon:add" :style="{ fontSize: '48px'}" :ssr="true" />
                    </label>
                    <input type="file" id="fileInput1" class="d-none" @change="handleFileChange($event, 0)" />
                </div>
                <div v-if="marker?.images[0]" class="col-lg-3">
                    <div v-if="!isEditing">
                        <div v-if="!firstImageSelected">
                            <img class="carImg" :src="marker?.images[0]" alt="test" @click="toggleImage(1)"/>
                        </div>
                        <div v-if="firstImageSelected" class="border border-4 border-danger">
                            <img class="carImg" :src="marker?.images[0]" alt="test" @click="toggleImage(1)"/>
                        </div>
                    </div>
                    <div v-if="isEditing">
                        <div v-if="!firstImageSelected" class="position-relative">
                            <img class="carImg" :src="marker?.images[0]" alt="test" @click="toggleImage(1)"/>
                            <div class="position-absolute bottom-0 end-0 mb-2 me-2">
                                <Icon icon="codicon:trash" :style="{ fontSize: '26px', cursor: 'pointer', color: '#FF0000' }" :ssr="true" @click="confirmImageDelete(0)" />
                            </div>
                        </div>
                        <div v-if="firstImageSelected" class="border border-4 border-danger position-relative">
                            <img class="carImg" :src="marker?.images[0]" alt="test" @click="toggleImage(1)"/>
                            <div class="position-absolute bottom-0 end-0 mb-2 me-2">
                                <Icon icon="codicon:trash" :style="{ fontSize: '26px', cursor: 'pointer', color: '#FF0000' }" :ssr="true" @click="confirmImageDelete(0)" />
                            </div>
                        </div>
                    </div>
                </div>
                <!-- Second image -->
                <div v-if="!marker?.images[1] && isEditing" class="col-lg-3 border d-flex justify-content-center align-items-center bg-light">
                    <label for="fileInput1" class="d-flex justify-content-center align-items-center" style="cursor: pointer;">
                        <Icon icon="codicon:add" :style="{ fontSize: '48px'}" :ssr="true" />
                    </label>
                    <input type="file" id="fileInput1" class="d-none" @change="handleFileChange($event, 1)" />
                </div>
                <div v-if="marker?.images[1]" class="col-lg-3">
                    <div v-if="!isEditing">
                        <div v-if="!secondImageSelected">
                            <img class="carImg" :src="marker?.images[1]" alt="test" @click="toggleImage(2)"/>
                        </div>
                        <div v-if="secondImageSelected" class="border border-4 border-danger">
                            <img class="carImg" :src="marker?.images[1]" alt="test" @click="toggleImage(2)"/>
                        </div>
                    </div>
                    <div v-if="isEditing">
                        <div v-if="!secondImageSelected" class="position-relative">
                            <img class="carImg" :src="marker?.images[1]" alt="test" @click="toggleImage(2)"/>
                            <div class="position-absolute bottom-0 end-0 mb-2 me-2">
                                <Icon icon="codicon:trash" :style="{ fontSize: '26px', cursor: 'pointer', color: '#FF0000' }" :ssr="true" @click="confirmImageDelete(1)" />
                            </div>
                        </div>
                        <div v-if="secondImageSelected" class="border border-4 border-danger position-relative">
                            <img class="carImg" :src="marker?.images[1]" alt="test" @click="toggleImage(2)"/>
                            <div class="position-absolute bottom-0 end-0 mb-2 me-2">
                                <Icon icon="codicon:trash" :style="{ fontSize: '26px', cursor: 'pointer', color: '#FF0000' }" :ssr="true" @click="confirmImageDelete(1)" />
                            </div>
                        </div>
                    </div>
                </div>
                <!-- Third Image -->
                <div v-if="!marker?.images[2] && isEditing" class="col-lg-3 border d-flex justify-content-center align-items-center bg-light">
                    <label for="fileInput1" class="d-flex justify-content-center align-items-center" style="cursor: pointer;">
                        <Icon icon="codicon:add" :style="{ fontSize: '48px'}" :ssr="true" />
                    </label>
                    <input type="file" id="fileInput1" class="d-none" @change="handleFileChange($event, 2)" />
                </div>
                <div v-if="marker?.images[2]" class="col-lg-3">
                    <div v-if="!isEditing">
                        <div v-if="!thirdImageSelected">
                            <img class="carImg" :src="marker?.images[2]" alt="test" @click="toggleImage(3)"/>
                        </div>
                        <div v-if="thirdImageSelected" class="border border-4 border-danger">
                            <img class="carImg" :src="marker?.images[2]" alt="test" @click="toggleImage(3)"/>
                        </div>
                    </div>
                    <div v-if="isEditing">
                        <div v-if="!thirdImageSelected" class="position-relative">
                            <img class="carImg" :src="marker?.images[2]" alt="test" @click="toggleImage(3)"/>
                            <div class="position-absolute bottom-0 end-0 mb-2 me-2">
                                <Icon icon="codicon:trash" :style="{ fontSize: '26px', cursor: 'pointer', color: '#FF0000' }" :ssr="true" @click="confirmImageDelete(2)" />
                            </div>
                        </div>
                        <div v-if="thirdImageSelected" class="border border-4 border-danger position-relative">
                            <img class="carImg" :src="marker?.images[2]" alt="test" @click="toggleImage(3)"/>
                            <div class="position-absolute bottom-0 end-0 mb-2 me-2">
                                <Icon icon="codicon:trash" :style="{ fontSize: '26px', cursor: 'pointer', color: '#FF0000' }" :ssr="true" @click="confirmImageDelete(2)" />
                            </div>
                        </div>
                    </div>
                </div>
                <!-- Fourth Image -->
                <div v-if="!marker?.images[3] && isEditing" class="col-lg-3 border d-flex justify-content-center align-items-center bg-light">
                    <label for="fileInput1" class="d-flex justify-content-center align-items-center" style="cursor: pointer;">
                        <Icon icon="codicon:add" :style="{ fontSize: '48px'}" :ssr="true" />
                    </label>
                    <input type="file" id="fileInput1" class="d-none" @change="handleFileChange($event, 3)" />
                </div>
                <div v-if="marker?.images[3]" class="col-lg-3">
                    <div v-if="!isEditing">
                        <div v-if="!fourthImageSelected">
                            <img class="carImg" :src="marker?.images[3]" alt="test" @click="toggleImage(4)"/>
                        </div>
                        <div v-if="fourthImageSelected" class="border border-4 border-danger">
                            <img class="carImg" :src="marker?.images[3]" alt="test" @click="toggleImage(4)"/>
                        </div>
                    </div>
                    <div v-if="isEditing">
                        <div v-if="!fourthImageSelected" class="position-relative">
                            <img class="carImg" :src="marker?.images[3]" alt="test" @click="toggleImage(4)"/>
                            <div class="position-absolute bottom-0 end-0 mb-2 me-2">
                                <Icon icon="codicon:trash" :style="{ fontSize: '26px', cursor: 'pointer', color: '#FF0000' }" :ssr="true" @click="confirmImageDelete(3)" />
                            </div>
                        </div>
                        <div v-if="fourthImageSelected" class="border border-4 border-danger position-relative">
                            <img class="carImg" :src="marker?.images[3]" alt="test" @click="toggleImage(4)"/>
                            <div class="position-absolute bottom-0 end-0 mb-2 me-2">
                                <Icon icon="codicon:trash" :style="{ fontSize: '26px', cursor: 'pointer', color: '#FF0000' }" :ssr="true" @click="confirmImageDelete(3)" />
                            </div>
                        </div>
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
        width: 51%;
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

    .popup {
        background-color: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 20px;
        border-radius: 8px;
        position: fixed;
        top: 20%;
        left: 50%;
        transform: translateX(-50%);
        z-index: 1000;
        width: 300px;
        text-align: center;
    }

    .popup button {
        background-color: #003366;
        color: white;
        padding: 8px 16px;
        border: none;
        cursor: pointer;
        margin-top: 10px;
        border-radius: 4px;
    }

    .popup button:hover {
        background-color: #FF0000;
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