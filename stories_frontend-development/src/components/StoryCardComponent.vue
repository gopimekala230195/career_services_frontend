<script setup>
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import StoriesServices from "../services/StoriesServices";

const router = useRouter();

const showDeleteConf = ref(false);
const user = ref(null);

const props = defineProps({
  story: {
    required: true,
  },
  getUpdatedStories: Function,
  showSnackbar: Function,
  openDeletePopup: Function,
  getStories: Function,
});

onMounted(async () => {
  user.value = JSON.parse(localStorage.getItem("user"));
});

async function deleteStory() {
  await StoriesServices.deleteStory(props.story.id)
    .then((response) => {
      if (response.data.status == "Success") {
        props.showSnackbar("green", response.data.message);
        showDeleteConf.value = false;
        props.getUpdatedStories();
      } else {
        props.showSnackbar("error", response.data.message);
      }
    })
    .catch((error) => {
      console.log(error);
      props.showSnackbar("error", error.message);
    });
}

async function generateSequel() {
  await StoriesServices.generateSequel(props.story.id)
    .then((response) => {
      if (response.data.status == "Success") {
        props.showSnackbar("green", response.data.message);
        props.getUpdatedStories();
      } else {
        props.showSnackbar("error", response.data.message);
      }
    })
    .catch((error) => {
      console.log(error);
      props.showSnackbar("error", error.message);
    });
}

function openDeletePopup(e) {
  e?.stopPropagation();
  showDeleteConf.value = true;
}

function closeDeletePopup() {
  showDeleteConf.value = false;
}
</script>

<template>
  <v-card class="rounded-lg elevation-5 mb-8">
    <v-card-title class="headline">
      <v-row align="center">
        <v-col>
          <b>
            {{ story.title }}</b>
          <v-spacer></v-spacer>Genre :
          {{ story.genre?.genreName }}
          <v-spacer></v-spacer>
          Max length : {{ story.storyLength }}
        </v-col>
        <v-col class="d-flex justify-end">
          <template v-if="user !== null">
            <router-link :to="{ name: 'storyViewById', params: { id: story?.id } }">
              <v-icon class="mr-3" size="small" icon="mdi-eye"></v-icon>
            </router-link>
          </template>
          <template v-if="user !== null">
            <router-link :to="{ name: 'storyEditById', params: { id: story?.id } }">
              <v-icon class="mr-3" size="small" icon="mdi-pencil"></v-icon>
            </router-link>
          </template>
          <template v-if="user !== null">
            <v-icon class="mr-3" size="small" icon="mdi-delete" @click="(e) => openDeletePopup(e)"></v-icon>
          </template>
        </v-col>
      </v-row>
      <v-row align="center" justify="space-between">
        <v-col cols="auto">
          <p class="font-italic text-left">
            Characters:
            <template v-if="props.story?.characters?.length == 0"><span v-bind:style="{
              color: '#707070',
              'font-size': '14px',
            }">No characters available..</span></template>
            <template v-for="(character, cIndex) in story?.characters" :key="{ cIndex }">
              <v-chip class="ma-2">
                {{ character?.name }} - {{ character?.role }}
              </v-chip>
            </template>
          </p>
        </v-col>
        <v-col cols="auto">
          <v-btn color="primary" @click="generateSequel">Generate Sequel</v-btn>
        </v-col>
      </v-row>
    </v-card-title>
  </v-card>
  <v-dialog persistent v-model="showDeleteConf" width="600">
    <v-container>
      <v-card class="rounded-lg elevation-5">
        <div class="pb-2 pl-5 pt-5 pr-5">Are you sure want to delete the story?
          <v-row class="mt-3">
            <v-col class="d-flex justify-end">
              <v-btn class="mr-3" variant="flat" color="secondary" @click="closeDeletePopup()">Cancel</v-btn>
              <v-btn variant="flat" color="primary" @click="deleteStory()">Confirm</v-btn>
            </v-col>
          </v-row>
        </div>
      </v-card>
    </v-container>
  </v-dialog>
</template>