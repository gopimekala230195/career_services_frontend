<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import UserServices from "../services/UserServices";
import logo from "../images/stories-logo.png";

const router = useRouter();

const user = ref(null);
const title = ref("The Narrator");

onMounted(() => {
  if (!localStorage.getItem("user")) {
    router.push({ name: "login" });
  }
  user.value = JSON.parse(localStorage.getItem("user"));
});

function logout() {
  UserServices.logoutUser()
    .then((data) => {
      console.log(data);
    })
    .catch((error) => {
      console.log(error);
    });
  localStorage.removeItem("user");
  user.value = null;
  router.push({ name: "login" });
}
</script>

<template>
  <div>
    <v-app-bar color="#0f0f0f" app dark>
      <router-link :to="{ name: 'login' }">
        <v-img class="mx-2" :src="logo" height="60" width="60" contain></v-img>
      </router-link>
      <v-toolbar-title class="title">
        {{ title }}
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn v-if="user === null" class="mx-2" :to="{ name: 'login' }">
        Login
      </v-btn>
      <v-menu v-if="user !== null" min-width="200px" rounded>
        <template v-slot:activator="{ props }">
          <v-btn icon v-bind="props">
            <v-avatar class="mx-auto text-center" color="accent" size="large">
              <span class="white--text font-weight-bold">{{
        `${user.firstName?.charAt(0)}${user.lastName?.charAt(0)}`
      }}</span>
            </v-avatar>
          </v-btn>
        </template>
        <v-card>
          <v-card-text>
            <div class="mx-auto text-center">
              <v-avatar color="accent">
                <span class="white--text text-h5">{{
          `${user.firstName?.charAt(0)}${user.lastName?.charAt(0)}`
        }}</span>
              </v-avatar>
              <h3>{{ `${user?.firstName} ${user?.lastName}` }}</h3>
              <p class="text-caption mt-1">
                {{ user?.email }}
              </p>
              <v-divider class="my-3"></v-divider>
              <v-btn rounded variant="text" :to="{ name: 'profile' }"> Profile </v-btn>
              <v-divider class="my-3"></v-divider>
              <v-btn rounded variant="text" @click="logout()"> Logout </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-menu>
    </v-app-bar>
  </div>
</template>
