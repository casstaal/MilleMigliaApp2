<script setup lang="ts">
    import { toTypedSchema } from "@vee-validate/zod";
    import { object, string } from "zod";
    import type { FetchError } from "ofetch";
    import type { Check } from "@prisma/client";

    const errorMessage = ref("");
    const error = ref(false);

    const schema = toTypedSchema(
        object({
            title: string().min(1, { message: "Titel is verplicht"}),
            imgUrl: string().min(1, { message: "Afbeelding url is verplicht"}),
            location: string().min(1, { message: "Locatie is verplicht"}),
            date: string({ required_error: "Datum is verplicht" }).date(),
        })
    );

    const { handleSubmit, errors } = useForm({
        validationSchema: schema,
    });

    const { value: title } = useField("title");
    const { value: imgUrl } = useField("imgUrl");
    const { value: location } = useField("location");
    const { value: date } = useField("date");

    async function createCheck(values: any) {
        values.date = new Date(values.date);
        const response = await $fetch<Check>("/api/checks", { method: "post", body: values }).catch((e: FetchError) => {
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

        navigateTo("/overview");
    }

    const onSubmit = handleSubmit(async (values) => {
        createCheck(values);
    })
</script>

<template>
    <div class="addCheck-div d-md-flex justify-content-center align-items-center mt-5 mb-5">
        <form @submit="onSubmit" class="addCheck-form col-sm-12 col-md-8 pe-0 ms-4 me-4 shadow rounded pt-1 pb-3">
            <h4 class="text-center mt-2">Voeg check toe</h4>
            <div class="ms-4 me-4">
                <div class="mt-2">
                    <label for="title" class="form-label">Titel:</label>
                    <input class="form-control input-lg" :class="{ 'is-invalid': errors.title }" id="title" type="text" v-model="title" placeholder="Titel" />
                    <div v-if="errors.title" class="invalid-feedback">{{  errors.title }}</div>
                </div>
                <div class="mt-3">
                    <label for="imgUrl" class="form-label">Afbeelding URL:</label>
                    <input class="form-control input-lg" :class="{ 'is-invalid': errors.imgUrl }" id="imgUrl" type="text" v-model="imgUrl" placeholder="Afbeelding URL" />
                    <div v-if="errors.imgUrl" class="invalid-feedback">{{ errors.imgUrl }}</div>
                </div>
                <div class="mt-3">
                    <label for="location" class="form-label">Locatie:</label>
                    <input class="form-control input-lg" :class="{ 'is-invalid': errors.location}" id="location" type="text" v-model="location" placeholder="Location" />
                    <div v-if="errors.location" class="invalid-feedback">{{ errors.location }}</div>
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

    .addCheck-form {
        background-color: #003366;
        color: white;
    }
</style>