<script setup>
import { onMounted } from "vue";
import { ref } from "vue";
import { useRouter } from "vue-router";
import UserServices from "../services/UserServices.js";

const router = useRouter();
const isCreateAccount = ref(false);
const loginType = ref("user");
const emailInValid = ref(false);
const snackbar = ref({
  value: false,
  color: "",
  text: "",
});
const user = ref({
  firstName: "",
  lastName: "",
  email: "",
  password: "",
});

onMounted(async () => {
  if (localStorage.getItem("user") !== null) {
    router.push({ name: "stories" });
  }
});

async function createAccount() {
  await UserServices.addUser(user.value)
    .then(() => {
      emailInValid.value = false;
      snackbar.value.value = true;
      snackbar.value.color = "green";
      snackbar.value.text = "Account created successfully!";
      isCreateAccount.value = false;
      user.value = {
        firstName: "",
        lastName: "",
        email: "",
        password: "",
      };
      router.push({ name: "login" });
    })
    .catch((error) => {
      console.log(error);
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response.data.message;
    });
}

async function login() {
  await UserServices.loginUser(user)
    .then((data) => {
      window.localStorage.setItem("user", JSON.stringify(data.data));
      snackbar.value.value = true;
      snackbar.value.color = "green";
      snackbar.value.text = "Login successful!";
      user.value = {
        firstName: "",
        lastName: "",
        email: "",
        password: "",
      };
      router.push({ name: "stories" });
    })
    .catch((error) => {
      console.log(error);
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response.data.message;
    });
}

function openCreateAccount() {
  emailInValid.value = false;
  isCreateAccount.value = true;
  user.value = {
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  };
}

function closeCreateAccount() {
  emailInValid.value = false;
  isCreateAccount.value = false;
  user.value = {
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  };
}

function closeSnackBar() {
  snackbar.value.value = false;
}

function onEmailChange() {
  if (user.value.email) {
    if (user.value.email.match(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i)) {
      emailInValid.value = false;
    } else {
      emailInValid.value = true;
    }
  } else {
    emailInValid.value = false;
  }
}
</script>

<template>
  <v-container>
    <div id="wrapper">
      <v-card id="body" color="#232323" class="rounded-lg" max-width="600" dark>
        <v-card-title class="headline mb-2 text-center">Login</v-card-title>
        <v-card-text>
          <v-text-field v-model="user.email" label="Email*" :hint="emailInValid && 'Please enter valid email'"
            @input="onEmailChange" required></v-text-field>

          <v-text-field v-model="user.password" label="Password*" type="password" required></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-btn v-if="loginType == 'user'" variant="outlined" @click="openCreateAccount()">Create
            Account</v-btn>
          <v-spacer></v-spacer>
          <v-btn variant="outlined" :disabled="emailInValid || !user.email || !user.password"
            @click="login()">Login</v-btn>
        </v-card-actions>
      </v-card>

      <v-dialog persistent v-model="isCreateAccount" width="700">
        <v-card color="#232323" class="rounded-lg elevation-5">
          <v-card-title class="headline mb-2">Create User Account</v-card-title>
          <v-card-text>
            <v-text-field v-model="user.firstName" label="First Name*" required></v-text-field>

            <v-text-field v-model="user.lastName" label="Last Name*" required></v-text-field>

            <v-text-field v-model="user.email" label="Email*" :hint="emailInValid && 'Please enter valid email'"
              @input="onEmailChange" required></v-text-field>

            <v-text-field v-model="user.password" label="Password*" required type="password"></v-text-field>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn @click="closeCreateAccount()">Close</v-btn>
            <v-btn variant="outlined" :disabled="emailInValid ||
            !user.email ||
            !user.password ||
            !user.firstName ||
            !user.lastName" @click="createAccount()">Create Account</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-snackbar v-model="snackbar.value" rounded="pill">
        {{ snackbar.text }}

        <template v-slot:actions>
          <v-btn :color="snackbar.color" variant="text" @click="closeSnackBar()">
            Close
          </v-btn>
        </template>
      </v-snackbar>
    </div>
  </v-container>
</template>

<style scoped>
#wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 85vh;
}

#body {
  width: 100%;
  max-width: 600px;
}
</style>
