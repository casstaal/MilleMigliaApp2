<script setup lang="ts">
    import { toTypedSchema } from "@vee-validate/zod";
    import { object, string, z } from "zod";
    import type { FetchError } from "ofetch";
    import type { Marker } from "@prisma/client";
    import { ref } from "vue";
    import { Icon } from "@iconify/vue";
    // import WalkthroughModal from "./WalkthroughModal.vue";
    import WalkthroughModal from "~/components/WalkthroughModal.vue";

    definePageMeta({
        middleware: 'my-middleware'
    })

    const router = useRouter();
    const route = useRoute();

    const fileUrls = ref<(string | null)[]>(Array(4).fill(null));
    const firstImageSelected = ref(false);
    const secondImageSelected = ref(false);
    const thirdImageSelected = ref(false);
    const fourthImageSelected = ref(false);


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

    // To delete all the images, for example for the back button
    async function deleteFilesFromMinIO() {
        for (const fileUrl of fileUrls.value) {
            if (!fileUrl || fileUrl == null) {
                console.log("failed to delete");
                return;
            }
            try {
                const response = await fetch(fileUrl, {
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

    // To delete one image, for example for the trashcan button
    async function deleteFileFromMinIO(index: number) {
        const minioUrl = fileUrls.value[index] ? fileUrls.value[index] : '';

        console.log("URL to delete", minioUrl);

        try {
            const response = await fetch(minioUrl, {
                method: "DELETE"
            });

            if (!response.ok) {
                console.error("Delete failed:", response.statusText);
                return;
            }

            // After deleting, remove the file URL and shift images
            fileUrls.value.splice(index, 1); // Remove the deleted file from the array

            // // Shift all images forward in the array (optional, if you want to make the array contiguous)
            // for (let i = index; i < fileUrls.value.length; i++) {
            //     fileUrls.value[i] = fileUrls.value[i + 1] || null; // Shift the image to the previous position
            // }

            // // Set the last element to null since the last image has been shifted
            // fileUrls.value[fileUrls.value.length - 1] = null;

            // Update the selection state
            if (index == 0) {
                firstImageSelected.value = false;
            } else if (index == 1) {
                secondImageSelected.value = false;
            } else if (index == 2) {
                thirdImageSelected.value = false;
            } else if (index == 3) {
                fourthImageSelected.value = false;
            }

            console.log("first image value", fileUrls.value[0])
            console.log("second image value", fileUrls.value[1])
            console.log("third image value", fileUrls.value[2])
            console.log("fourth image value", fileUrls.value[3])
        } catch (error) {
            console.error("Delete error:", error);
            return;
        }
    }

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
                fileUrls.value[index] = minioUrl;
                if (index == 0) {
                    firstImageSelected.value = true;
                } else if (index == 1) {
                    secondImageSelected.value = true;
                } else if (index == 2) {
                    thirdImageSelected.value = true;
                } else if (index == 3) {
                    fourthImageSelected.value = true;
                } 
                console.log(fileUrls.value);
            } else {
                console.error("Upload failed:", response.statusText);
                throw response.statusText
            }
        } catch (error) {
            console.error("Upload error:", error);
            throw error;
        }
    }

    async function goBack() {
        await deleteFilesFromMinIO();
        router.go(-1);
    }

    // Walkthrough
    const showModal = ref(false);
    const currentStep = ref<number>(0);

    async function startWalkThrough() {
        showModal.value = true;
    }



    const lat = typeof route.query.lat === 'string' ? route.query.lat : null;
    const lng = typeof route.query.lng === 'string' ? route.query.lng : null;

    const errorMessage = ref("");
    const error = ref(false);

    const schema = toTypedSchema(
        object({
            brand: string().min(1, { message: "Brand is verplicht"}),
            model: string().min(1, { message: "Model is verplicht"}),
            description: string().min(1, { message: "Model is verplicht"}),
            // image: z.instanceof(File, { message: "Afbeelding is verplicht"}),
            date: string({ required_error: "Datum is verplicht" }).date(),
        })
    );

    const { handleSubmit, errors } = useForm({
        validationSchema: schema,
    });

    const { value: brand } = useField("brand");
    const { value: model } = useField("model");
    const { value: description } = useField<string>("description");
    // const { value: image } = useField("image");
    const { value: date } = useField("date");

    async function createCheck(values: any) {
        values.date = new Date(values.date);
        values.latitude = parseFloat(lat ?? "0");
        values.longitude = parseFloat(lng ?? "0");

        values.images = Array.isArray(values.images) ? values.images : [];

        values.images[0] = fileUrls.value[0] ? fileUrls.value[0] : '';
        values.images[1] = fileUrls.value[1] ? fileUrls.value[1] : '';
        values.images[2] = fileUrls.value[2] ? fileUrls.value[2] : '';
        values.images[3] = fileUrls.value[3] ? fileUrls.value[3] : '';


        // const imgUrl = await uploadFile(values.image);
        // delete values.image;

        // values.imgUrl = imgUrl;

        const response = await $fetch<Marker>("/api/markers", { method: "post", body: values }).catch((e: FetchError) => {
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

        navigateTo("/map");
    }

    const onSubmit = handleSubmit(async (values) => {
        createCheck(values);    
    })
</script>

<template>
    <div class="addMarker-div d-md-flex justify-content-center align-items-center mt-5 mb-5">
        <button class="btn back-button mt-3" @click="goBack">Back</button>
        <form @submit="onSubmit" class="addMarker-form col-lg-4 col-sm-12 col-md-8 pe-0 ms-4 me-4 shadow rounded pt-1 pb-3">
            <div class="row">
                <h2 class="text-center mt-2">Voeg marker toe</h2>
                <Icon icon="codicon:lightbulb" :style="{ fontSize: '26px', cursor: 'pointer', color: '#FFF' }" :ssr="true" @click="startWalkThrough" />
                <!-- <WalkthroughModal v-if="showModal" :isVisible="showModal" @close="showModal = false" /> -->
            </div>
            <div class="ms-4 me-4">
                <div class="mt-2">
                    <label for="brand" class="form-label">Brand:</label>
                    <input class="form-control input-lg" :class="{ 'is-invalid': errors.brand }" id="brand" type="text" v-model="brand" placeholder="Brand" />
                    <div v-if="errors.brand" class="invalid-feedback">{{  errors.brand }}</div>
                </div>
                <div class="mt-2">
                    <label for="model" class="form-label">Model:</label>
                    <input class="form-control input-lg" :class="{ 'is-invalid': errors.model }" id="model" type="text" v-model="model" placeholder="Model" />
                    <div v-if="errors.model" class="invalid-feedback">{{  errors.model }}</div>
                </div>
                <div class="mt-3">
                    <label class="mb-2">Afbeelding:</label><br>
                    <input class="form-control input-lg" type="file" @change="handleFileChange($event, 0)" />
                </div>
                <div v-if="fileUrls[0]" class="row p-3 d-flex align-items-center">
                    <div class="col-lg-3 border p-2 rounded d-flex justify-content-center align-items-center position-relative">
                        <img :src="fileUrls[0] ? fileUrls[0] : ''" alt="car image" style="width: 100%; height: auto;"/>
                        <div class="position-absolute bottom-0 end-0 mb-2 me-2">
                            <Icon icon="codicon:trash" :style="{ fontSize: '26px', cursor: 'pointer', color: '#FF0000' }" :ssr="true" @click="deleteFileFromMinIO(0)" />
                        </div>
                    </div>
                    <!-- Second Image -->
                    <div v-if="!fileUrls[1]" class="col-lg-3 border p-2 rounded d-flex justify-content-center align-items-center">
                        <label for="fileInput1" class="d-flex justify-content-center align-items-center" style="cursor: pointer;">
                            <Icon icon="codicon:add" :style="{ fontSize: '48px'}" :ssr="true" />
                        </label>
                        <input type="file" id="fileInput1" class="d-none" @change="handleFileChange($event, 1)" />
                    </div>
                    <div v-if="fileUrls[1]" class="col-lg-3 border p-2 rounded d-flex justify-content-center align-items-center position-relative">
                        <img :src="fileUrls[1] ? fileUrls[1] : ''" alt="car image" style="width: 100%; height: auto;"/>
                        <div class="position-absolute bottom-0 end-0 mb-2 me-2">
                            <Icon icon="codicon:trash" :style="{ fontSize: '26px', cursor: 'pointer', color: '#FF0000' }" :ssr="true" @click="deleteFileFromMinIO(1)" />
                        </div>
                    </div>

                    <!-- Third Image -->
                    <div v-if="!fileUrls[2]" class="col-lg-3 border p-2 rounded d-flex justify-content-center align-items-center">
                        <label for="fileInput2" class="d-flex justify-content-center align-items-center" style="cursor: pointer;">
                            <Icon icon="codicon:add" :style="{ fontSize: '48px'}" :ssr="true" />
                        </label>
                        <input type="file" id="fileInput2" class="d-none" @change="handleFileChange($event, 2)" />
                    </div>
                    <div v-if="fileUrls[2]" class="col-lg-3 border p-2 rounded d-flex justify-content-center align-items-center position-relative">
                        <img :src="fileUrls[2] ? fileUrls[2] : ''" alt="car image" style="width: 100%; height: auto;"/>
                        <div class="position-absolute bottom-0 end-0 mb-2 me-2">
                            <Icon icon="codicon:trash" :style="{ fontSize: '26px', cursor: 'pointer', color: '#FF0000' }" :ssr="true" @click="deleteFileFromMinIO(2)" />
                        </div>
                    </div>

                    <!-- Fourth Image -->
                    <div v-if="!fileUrls[3]" class="col-lg-3 border p-2 rounded d-flex justify-content-center align-items-center">
                        <label for="fileInput3" class="d-flex justify-content-center align-items-center" style="cursor: pointer;">
                            <Icon icon="codicon:add" :style="{ fontSize: '48px'}" :ssr="true" />
                        </label>
                        <input type="file" id="fileInput3" class="d-none" @change="handleFileChange($event, 3)" />
                    </div>
                    <div v-if="fileUrls[3]" class="col-lg-3 border p-2 rounded d-flex justify-content-center align-items-center position-relative">
                        <img :src="fileUrls[3] ? fileUrls[3] : ''" alt="car image" style="width: 100%; height: auto;"/>
                        <div class="position-absolute bottom-0 end-0 mb-2 me-2">
                            <Icon icon="codicon:trash" :style="{ fontSize: '26px', cursor: 'pointer', color: '#FF0000' }" :ssr="true" @click="deleteFileFromMinIO(3)" />
                        </div>
                    </div>
                </div>
                <div class="mt-2">
                    <label for="description" class="form-label">Description:</label>
                    <textarea 
                        class="form-control input-lg" 
                        :class="{ 'is-invalid': errors.description }" 
                        id="description" 
                        type="text"
                        v-model="description" 
                        placeholder="Description" 
                        rows="5">
                    </textarea>
                    <div v-if="errors.description" class="invalid-feedback">{{ errors.description }}</div>
                </div>
                <div class="mt-3">
                    <label for="latitude" class="form-label">Latitude:</label>
                    <input class="form-control input-lg" :class="{ 'is-invalid': errors.brand }" id="latitude" type="number" :value="lat" disabled />
                    <div v-if="errors.brand" class="invalid-feedback">{{ errors.brand }}</div>
                </div>
                <div class="mt-3">
                    <label for="longitude" class="form-label">Longitude:</label>
                    <input class="form-control input-lg" :class="{ 'is-invalid': errors.brand }" id="longitude" type="number" :value="lng" disabled />
                    <div v-if="errors.brand" class="invalid-feedback">{{ errors.brand }}</div>
                </div>
                <div class="mt-3">
                    <label for="date" class="form-label">Datum:</label>
                    <input class="form-control input-lg" :class="{ 'is-invalid': errors.date }" id="date" type="date" v-model="date" placeholder="Datum"/>
                    <div v-if="errors.date" class="invalid-feedback">{{ errors.date }}</div>
                </div>
                <button class="create-check-button btn btn-lg mt-3 mb-2 col-12" type="submit">Opslaan</button>
            </div>
        </form>
    </div>
</template>

<style>

    .create-check-button {
        background-color: #FF0000;
        color: white;
    }

    .create-check-button:hover {
        background-color: #FF0000;
        color: white;
    }

    .addMarker-form {
        background-color: #003366;
        color: white;
        overflow: hidden;
    }

    .back-button {
        background-color: #FF0000;
        color: white;
    }

    .back-button:hover {
        background-color: #FF0000;
        color: white;
    }
</style>