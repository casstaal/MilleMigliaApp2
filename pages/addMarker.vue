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
        if (!input.files || input.files.length === 0) {
            image.value = null;
            return;
        }

        const file = input.files[0];
        image.value = file;
    };

    const uploadFile = async (file: File): Promise<string> => {
        const fileName = `${Date.now()}-${file.name}`;
        const minioUrl = `${import.meta.env.VITE_MINIO_ENDPOINT}/${import.meta.env.VITE_MINIO_BUCKET}/${fileName}`;

        try {
            const response = await fetch(minioUrl, {
                method: "PUT",
                headers: { "Content-Type": file.type },
                body: file,
            });

            if (response.ok) {
                return minioUrl;
            } else {
                console.error("Upload failed:", response.statusText);
                throw response.statusText
            }
        } catch (error) {
            console.error("Upload error:", error);
            throw error;
        }
    }

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
            description: string().min(1, { message: "Model is verplicht"}),
            image: z.instanceof(File, { message: "Afbeelding is verplicht"}),
            date: string({ required_error: "Datum is verplicht" }).date(),
        })
    );

    const { handleSubmit, errors } = useForm({
        validationSchema: schema,
    });

    const { value: brand } = useField("brand");
    const { value: model } = useField("model");
    const { value: description } = useField<string>("description");
    const { value: image } = useField("image");
    const { value: date } = useField("date");

    async function createCheck(values: any) {
        values.date = new Date(values.date);
        values.latitude = parseFloat(lat ?? "0");
        values.longitude = parseFloat(lng ?? "0");

        const imgUrl = await uploadFile(values.image);
        delete values.image;

        values.imgUrl = imgUrl;

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
        <form @submit="onSubmit" class="addMarker-form col-lg-6 col-sm-12 col-md-8 pe-0 ms-4 me-4 shadow rounded pt-1 pb-3">
            <h2 class="text-center mt-2">Voeg marker toe</h2>
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
                    <input class="form-control input-lg" type="file" @change="handleFileChange" />
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
                    <input class="form-control input-lg" :class="{ 'is-invalid': errors.image }" id="latitude" type="number" :value="lat" disabled />
                    <div v-if="errors.image" class="invalid-feedback">{{ errors.image }}</div>
                </div>
                <div class="mt-3">
                    <label for="longitude" class="form-label">Longitude:</label>
                    <input class="form-control input-lg" :class="{ 'is-invalid': errors.image }" id="longitude" type="number" :value="lng" disabled />
                    <div v-if="errors.image" class="invalid-feedback">{{ errors.image }}</div>
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