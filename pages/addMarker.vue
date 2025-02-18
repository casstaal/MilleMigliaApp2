<script setup lang="ts">
    import { toTypedSchema } from "@vee-validate/zod";
    import { object, string, z } from "zod";
    import type { FetchError } from "ofetch";
    import type { Marker } from "@prisma/client";
    import { ref } from "vue";

    const router = useRouter();
    const route = useRoute();

    const fileUrl = ref<string | null>(null);

    const handleFileChange = async (event: Event) => {
        const input = event.target as HTMLInputElement;
        if (!input.files || input.files.length === 0) return;

        const file = input.files[0];
        await uploadFile(file);
    };

    const uploadFile = async (file: File) => {
        const fileName = `${Date.now()}-${file.name}`;
        const minioUrl = `${import.meta.env.VITE_MINIO_ENDPOINT}/${import.meta.env.VITE_MINIO_BUCKET}/${fileName}`;

        try {
            const response = await fetch(minioUrl, {
                method: "PUT",
                headers: { "Content-Type": file.type },
                body: file,
            });

            if (response.ok) {
                fileUrl.value = minioUrl;
                imgUrl.value = minioUrl;
            } else {
                console.error("Upload failed:", response.statusText);
            }
        } catch (error) {
            console.error("Upload error:", error);
        }
    };

    const goBack = () => {
        router.go(-1);
    }

    const lat = typeof route.query.lat === 'string' ? route.query.lat : null;
    const lng = typeof route.query.lng === 'string' ? route.query.lng : null;

    const errorMessage = ref("");
    const error = ref(false);

    const schema = toTypedSchema(
        object({
            brand: string().min(1, { message: "Brand is verplicht"}),
            model: string().min(1, { message: "Model is verplicht"}),
            imgUrl: string().min(1, { message: "Afbeelding url is verplicht"}),
            date: string({ required_error: "Datum is verplicht" }).date(),
        })
    );

    const { handleSubmit, errors } = useForm({
        validationSchema: schema,
    });

    const { value: brand } = useField("brand");
    const { value: model } = useField("model");
    const { value: imgUrl } = useField("imgUrl");
    const { value: date } = useField("date");

    async function createCheck(values: any) {
        values.date = new Date(values.date);
        values.latitude = parseFloat(lat ?? "0");
        values.longitude = parseFloat(lng ?? "0");
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
        <form @submit="onSubmit" class="addMarker-form col-sm-12 col-md-8 pe-0 ms-4 me-4 shadow rounded pt-1 pb-3">
            <h4 class="text-center mt-2">Voeg marker toe</h4>
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
                <!-- <div class="mt-3">
                    <label for="imgUrl" class="form-label">Afbeelding URL:</label>
                    <input class="form-control input-lg" :class="{ 'is-invalid': errors.imgUrl }" id="imgUrl" type="text" v-model="imgUrl" placeholder="Afbeelding URL" />
                    <div v-if="errors.imgUrl" class="invalid-feedback">{{ errors.imgUrl }}</div>
                </div> -->
                <div class="mt-3">
                    <label>Afbeelding:</label>
                    <input type="file" @change="handleFileChange" />
                    <p v-if="fileUrl">Uploaded URL: <a :href="fileUrl" target="_blank">{{ fileUrl }}</a></p>
                </div>
                <div class="mt-3">
                    <label for="latitude" class="form-label">Latitude:</label>
                    <input class="form-control input-lg" :class="{ 'is-invalid': errors.imgUrl }" id="latitude" type="number" :value="lat" disabled />
                    <div v-if="errors.imgUrl" class="invalid-feedback">{{ errors.imgUrl }}</div>
                </div>
                <div class="mt-3">
                    <label for="longitude" class="form-label">Longitude:</label>
                    <input class="form-control input-lg" :class="{ 'is-invalid': errors.imgUrl }" id="longitude" type="number" :value="lng" disabled />
                    <div v-if="errors.imgUrl" class="invalid-feedback">{{ errors.imgUrl }}</div>
                </div>
                <div class="mt-3">
                    <label for="date" class="form-label">Datum:</label>
                    <input class="form-control input-lg" :class="{ 'is-invalid': errors.date }" id="date" type="date" v-model="date" placeholder="Datum"/>
                    <div v-if="errors.date" class="invalid-feedback">{{ errors.date }}</div>
                </div>
                <button class="create-check-button btn btn-lg mt-3 col-12" type="submit">Opslaan</button>
            </div>
        </form>
    </div>
</template>

<style>
    .create-check-button {
        background-color: #FF0000;
        color: white;
    }

    .addMarker-form {
        background-color: #003366;
        color: white;
    }

    .back-button {
        background-color: #FF0000;
        color: white;
    }
</style>