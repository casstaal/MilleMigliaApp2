<script setup lang="ts">
    import { toTypedSchema } from "@vee-validate/zod";
    import { object, string } from "zod";
    import type { FetchError } from "ofetch";
    import type { Check } from "@prisma/client";
    import { S3Client } from "@aws-sdk/client-s3";
    import { CognitoIdentityClient } from "@aws-sdk/client-cognito-identity";
    import { fromCognitoIdentityPool } from "@aws-sdk/credential-provider-cognito-identity";
    import { onMounted } from "vue";

    onMounted(() => {
        // Load AWS SDK
        const awsScript = document.createElement("script");
        awsScript.src = "https://sdk.amazonaws.com/js/aws-sdk-3.740.0.js";
        awsScript.async = true;
        document.body.appendChild(awsScript);

    });

    var albumBucketName = "mille-miglia-photos";
    var bucketRegion = "Europe (Stockholm) eu-north-1";
    var IdentityPoolId = "IDENTITY_POOL_ID";

    // AWS.config.update({
    // region: bucketRegion,
    // credentials: new AWS.CognitoIdentityCredentials({
    //     IdentityPoolId: IdentityPoolId,
    // }),
    // });

    // var s3 = new S3Client({
    //     apiVersion: "2006-03-01",
    //     params: { Bucket: albumBucketName },
    // });

    const s3 = new S3Client({
    region: bucketRegion,
    credentials: fromCognitoIdentityPool({
        client: new CognitoIdentityClient({ region: bucketRegion }),
        identityPoolId: identityPoolId,
    }),
    });


    // function addPhoto() {
    //     var files = document.getElementById("photoupload").files;
    //     if (!files.length) {
    //         return alert("Please choose a file to upload first.");
    //     }
    //     var file = files[0];
    //     var fileName = file.name;
    //     var albumPhotosKey = encodeURIComponent("images") + "/";

    //     var photoKey = albumPhotosKey + fileName;

    //     // Use S3 ManagedUpload class as it supports multipart uploads
    //     var upload = new AWS.S3.ManagedUpload({
    //         params: {
    //         Bucket: albumBucketName,
    //         Key: photoKey,
    //         Body: file,
    //         },
    //     });

    //     var promise = upload.promise();

    //     promise.then(
    //         function (data) {
    //         alert("Successfully uploaded photo.");
    //         viewAlbum(albumName);
    //         },
    //         function (err) {
    //         return alert("There was an error uploading your photo: ", err.message);
    //         }
    //     );
    // }

    const router = useRouter();


    const goBack = () => {
        router.go(-1);
    }

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

    const fileInput = ref<HTMLInputElement | null>(null);

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
        // Handle file upload to S3
        const file = fileInput.value?.files?.[0];
        if (!file) {
            alert("Please select a file to upload");
            return;
        }

        // const fileName = `${title.value}_${Date.now()}_${file.name}`;
        const fileName = file.name;
        var albumPhotosKey = encodeURIComponent("images") + "/";

        var photoKey = albumPhotosKey + fileName;
        // const params = {
        //     Bucket: albumBucketName,
        //     Key: photoKey,
        //     Body: file,
        // };

          // Use S3 ManagedUpload class as it supports multipart uploads
        var upload = new S3Client.ManagedUpload({
            params: {
            Bucket: albumBucketName,
            Key: photoKey,
            Body: file,
            },
        });

        var promise = upload.promise();

        promise.then(
            function () {
                alert("Successfully uploaded photo.");
                values.imgUrl = fileName;  // Store the file URL or key here
                createCheck(values);
            },
            function () {
                return alert("There was an error uploading your photo: ");
            }
        );

        // try {
        //     await s3.upload(params).promise();
        //     alert("File uploaded successfully!");
        //     values.imgUrl = fileName;  // Store the file URL or key here
        //     createCheck(values);  // Proceed with submitting the form
        // } catch (error) {
        //     alert("Error uploading file: ");
        // }    
        })
</script>

<template>
    <div class="addCheck-div d-md-flex justify-content-center align-items-center mt-5 mb-5">
        <button class="btn back-button mt-3" @click="goBack">Back</button>
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
                    <input class="form-control input-lg" :class="{ 'is-invalid': errors.imgUrl }" id="imgUrl" type="file" accept="image/*" ref="fileInput" placeholder="Afbeelding URL" />
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

    .back-button {
        background-color: #FF0000;
        color: white;
    }
</style>