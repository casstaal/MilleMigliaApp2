<script lang="ts" setup>
import { ref } from "vue";

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
    } else {
      console.error("Upload failed:", response.statusText);
    }
  } catch (error) {
    console.error("Upload error:", error);
  }
};
</script>

<template>
    <div>
      <input type="file" @change="handleFileChange" />
      <p v-if="fileUrl">Uploaded URL: <a :href="fileUrl" target="_blank">{{ fileUrl }}</a></p>
    </div>
  </template>