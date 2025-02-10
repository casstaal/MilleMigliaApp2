<script setup lang="ts">
    import { ref, computed } from "vue";
    import { useFetch } from "#app";
    import type { User } from "@prisma/client";


    const search = ref<string>("");

    const users = ref<User[] | null>(null);

    const { data } = await useFetch<User[]>(`/api/users`);

    users.value = data.value;

    const filteredUsers = computed(() => {
        return users.value?.filter((user: any) => {
            const query = search.value.toLowerCase();
            return user.name.toLowerCase().includes(query);
        })
    })
</script>

<template>
    <div class="container py-5 d-flex flex-column" style="min-height: 100vh">
        <input class="form-control mb-3 mt-3 bg-white" type="text" v-model="search" placeholder="Search..." />
        <hr />

        <div class="flex-grow-1 overflow-auto">
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
                            <p class="me-2 mb-0">Markers: {{ user.markers?.length }}</p>
                        </div>
                    </div>
                </div>
            </div>
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
</style>