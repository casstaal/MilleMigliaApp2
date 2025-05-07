<script setup lang="ts">
import { object, string } from "zod";

definePageMeta({
  auth: {
    unauthenticatedOnly: true,
    navigateAuthenticatedTo: '/'
  },
});

const { signIn, getSession, status } = useAuth();
const route = useRoute();
const router = useRouter();
const callback = route.query.callback as string | undefined;
let signInError = ref();

const session = await getSession();
const isLoggedIn = computed(() => status.value === 'authenticated');

const schema = toTypedSchema(
  object({
    email: string({ required_error: "Email is verplicht" }).nonempty({ message: "Email is verplicht" }).email({ message: "Ongeldig email" }),
    password: string({ required_error: "Wachtwoord is verplicht" }).nonempty({ message: "Wachtwoord is verplicht" }),
  })
);

const { handleSubmit, errors } = useForm({
  validationSchema: schema,
});

const { value: email } = useField("email");
const { value: password } = useField("password");

const onSubmit = handleSubmit(async (values) => {
  const result: any = await signIn("credentials", { email: values.email, password: values.password, callbackUrl: '/', redirect: false });

  if (result.error) {
    switch (result.error) {
      case "CredentialsSignin":
        signInError.value = "Email of wachtwoord onjuist";
        break;
    }
    return;
  } else {
    navigateTo('/');
  }
});
</script>

<template>
  <div class="d-flex vh-100 justify-content-center align-items-center">
    <div v-if="isLoggedIn" class="card ms-4 me-4 shadow p-3 rounded" style="width: 20rem;">
      <h2 class="text-center mb-1">Welkom,</h2>
      <h5 class="text-center">{{ session?.user?.firstName }}</h5>
      <p class="text-center">U bent al ingelogd</p>
      <NuxtLink to="/map" class="start-button btn w-100 mt-4" style="background-color: #003366; color:white;">Ga naar kaart</NuxtLink>
    </div>
      <form v-if=!isLoggedIn @submit="onSubmit" class="login-form ms-4 me-4 bg-light shadow p-3 rounded">
        <div>
          <input class="form-control input-lg col-12 border border-secondary" :class="{ 'is-invalid': errors.email }" name="email" type="email" v-model="email" placeholder="Email" />
          <div v-if="errors.email" class="invalid-feedback">{{ errors.email }}</div>
        </div>

        <div class="mt-3">
          <input class="form-control input-lg col-12 border border-secondary" :class="{ 'is-invalid': errors.password }" name="password" type="password" v-model="password" placeholder="Wachtwoord" />
          <div v-if="errors.password" class="invalid-feedback">{{ errors.password }}</div>
        </div>

        <div v-if="signInError" class="alert alert-danger mt-3">
          {{ signInError }}
        </div>

        <button class="login-button btn btn-lg mt-3 col-12" style="background-color: #003366; color: white;" type="submit">Login</button>
      </form>
  </div>
</template>

<style>
.login-form {
  width: 100%;
  max-width: 400px;
}

@media screen and (min-width: 768px) {
  .login-form {
    width: 100%;
    max-width: 600px;
    font-size: 25px;
  }

  input.form-control {
    font-size: 20px;
    padding: 15px;
  }

  button.login-button {
    padding: 15px;
    font-size: 25px;
  }
}
</style>
