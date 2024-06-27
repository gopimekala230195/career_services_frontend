<script setup>
import { onMounted } from "vue";
import { ref } from "vue";
import StoryCardComponent from "../components/StoryCardComponent.vue";
import StoriesServices from "../services/StoriesServices.js";
import EditStory from "../components/EditStory.vue";

const stories = ref([]);
const constStories = ref([]);
const filterStories = ref("");
const isAdd = ref(false);
const user = ref({
  email: "",
  firstName: "",
  lastName: "",
  id: null,
  token: "",
});
const snackbar = ref({
  value: false,
  color: "",
  text: "",
});

onMounted(async () => {
  user.value = JSON.parse(localStorage.getItem("user"));
  await getStories();
});

async function getStories() {
  isAdd.value = false;
  if (user.value !== null && user.value.id !== null) {
    await StoriesServices.getStoriesByUserId(user.value.id)
      .then((response) => {
        stories.value = response.data?.data;
        constStories.value = response.data?.data;
      })
      .catch((error) => {
        console.log(error);
        snackbar.value.value = true;
        snackbar.value.color = "error";
        snackbar.value.text = error.response.data.message;
      });
  }
}

function openAdd() {
  isAdd.value = true;
}

function closeAdd() {
  isAdd.value = false;
}

function closeSnackBar() {
  snackbar.value.value = false;
}

const showSnackbar = (color, msg) => {
  snackbar.value.value = true;
  snackbar.value.color = color;
  snackbar.value.text = msg;
};

const onFilterChange = () => {
  if (filterStories.value) {
    let tempFilteredStories = [];
    tempFilteredStories = constStories.value.filter(
      (item) =>
        item?.title?.toLowerCase()?.includes(filterStories.value?.toLowerCase()) ||
        item?.genre?.genreName
          ?.toLowerCase()
          ?.includes(filterStories.value?.toLowerCase())
    );
    stories.value = tempFilteredStories;
  } else {
    stories.value = constStories.value;
  }
};
</script>

<template>
  <v-container>
    <div id="body">
      <v-row align="center" class="mb-4">
        <v-col cols="10"><v-card-title class="pl-0 text-h4 font-weight-bold">Stories
          </v-card-title>
        </v-col>
        <v-col class="d-flex justify-end" cols="2">
          <v-btn color="accent" @click="openAdd()">Generate Story</v-btn>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-text-field v-if="constStories.length > 0" v-model="filterStories" append-icon="mdi-magnify" v-bind:style="{
            marginBottom: '10px',
            backgroundColor: 'rgba(186, 186, 203, 0.82)',
          }" label="Search by story heading / genre name..." @input="onFilterChange" single-line
            hide-details></v-text-field>
        </v-col>
      </v-row>
      <template v-if="stories?.length > 0">
        <StoryCardComponent v-for="story in stories" :key="story.id" :story="story" :getUpdatedStories="getStories"
          :showSnackbar="showSnackbar" />
      </template>
      <template v-else>
        <p class="font-italic text-center">No Stories found...</p>
      </template>

      <v-dialog persistent v-model="isAdd" width="1080">
        <v-card color="#232323" class="rounded-lg elevation-5">
          <EditStory :userId="user?.id" :getUpdatedStories="getStories" :closePopupEvent="closeAdd"
            :showSnackbar="showSnackbar">
          </EditStory>
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
