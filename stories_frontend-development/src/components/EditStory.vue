<script setup>
import { onMounted, ref } from "vue";
import StoriesServices from "../services/StoriesServices.js";

const props = defineProps({
  userId: null,
  getUpdatedStories: Function,
  closePopupEvent: Function,
  showSnackbar: Function,
});

const storyDetails = ref({
  storyId: null,
  title: "",
  genre: "",
  storyLength: 100,
  content: "",
  characters: [],
  storyTheme: "",
  storyLaguage: "English",
  updatedDate: null,
});

const characterInfo = ref({
  id: null,
  name: "",
  role: "",
});

const previousCharacters = ref([]);
const selectedPeople = ref([]);

const snackbar = ref({
  value: false,
  color: "",
  text: "",
});

const themes = ref([]);
const genres = ref([]);
const languages = ref([]);

onMounted(async () => {
  await getStoryProperties();
  await getCharacterSuggestions();
});

async function getStoryProperties() {
  await StoriesServices.getStoryProperties()
    .then((response) => {
      let tempTheme = [];
      response.data?.data?.settings?.map(item => {
        tempTheme.push(item?.settingName);
      })
      themes.value = tempTheme;
      let tempGenre = [];
      response.data?.data?.genres?.map(item => {
        tempGenre.push(item?.genreName);
      })
      genres.value = tempGenre;
      let tempLanguages = [];
      response.data?.data?.languages?.map(item => {
        tempLanguages.push(item?.languageName);
      })
      languages.value = tempLanguages;
    })
    .catch((error) => {
      console.log(error);
    });
}

async function getCharacterSuggestions() {
  await StoriesServices.characterSuggestions(props?.userId)
    .then((response) => {
      previousCharacters.value = response.data?.data;
    })
    .catch((error) => {
      console.log(error);
    });
}

async function addStory() {
  let payload = {
    userId: JSON.parse(localStorage.getItem("user")).id,
    genreName: storyDetails.value?.genre,
    languageName: storyDetails.value?.storyLaguage,
    settingName: storyDetails.value?.storyTheme,
    ...storyDetails.value,
    characters: [...storyDetails.value.characters, ...selectedPeople.value]
  };
  await StoriesServices.addStory(payload)
    .then((response) => {
      props.showSnackbar("green", response.data.message);
      if (response.data.status == "Success") {
        props.getUpdatedStories();
      }
    })
    .catch((error) => {
      console.log(error);
      props.showSnackbar("error", error.message);
    });
}

function removeCharacter(removeItem) {
}

const closeParentPopup = () => {
  props.closePopupEvent();
};

function closeSnackBar() {
  snackbar.value.value = false;
}

const addCharacterClick = (char) => {
  if (char.name?.length > 0 && char.role?.length > 0) {
    const newChar = { ...char };
    storyDetails.value.characters.push(newChar);
    char.name = "";
    char.role = "";
  }
}
</script>



<template>
  <v-container>
    <v-row align="center">
      <v-col cols="10">
        <v-card-title class="pl-0 text-h4 font-weight-bold">Add Story</v-card-title>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-card color="#232323" class="rounded-lg elevation-5 d-flex align-center">
          <v-card-text>
            <v-row align="center">
              <v-col cols="4">
                <v-text-field class="w-100" v-model="storyDetails.title" label="Story Title*" required></v-text-field>
              </v-col>
              <v-col cols="4">
                <v-select class="my-select" :items="themes" label="Theme*" v-model="storyDetails.storyTheme"
                  required></v-select>
              </v-col>
              <v-col cols="4">
                <v-select :items="genres" label="Genre*" v-model="storyDetails.genre" required></v-select>
              </v-col>
              <v-col cols="4">
                <v-select :items="languages" label="Language*" v-model="storyDetails.storyLaguage" required></v-select>
              </v-col>
              <v-col cols="4">
                <v-text-field class="w-100" v-model.number="storyDetails.storyLength" label="Max length*" type="number"
                  required></v-text-field>
              </v-col>
              <v-col cols="12">
                <p class="font-italic text-left">
                  New Characters:
                  <template v-if="storyDetails.characters.length == 0">
                    <span v-bind:style="{ color: '#707070', 'font-size': '14px' }">
                      Please enter character role and name below and click on add to list them..
                    </span>
                  </template>
                  <template v-for="(character, cIndex) in storyDetails.characters" :key="cIndex">
                    <v-chip class="ma-2" closable @click:close="removeCharacter(character)">
                      {{ character?.name }}(<b>{{ character?.role }}</b>)
                    </v-chip>
                  </template>
                </p>
                <v-row>
                  <v-col cols="4" class="d-flex justify-start">
                    <v-responsive max-width="350">
                      <v-text-field v-model="characterInfo.name" v-on:keyup.enter="addCharacterClick(characterInfo)"
                        label="Enter character name.." clearable></v-text-field>
                    </v-responsive>
                  </v-col>
                  <v-col cols="4" class="d-flex justify-start">
                    <v-responsive max-width="350">
                      <v-text-field v-model="characterInfo.role" v-on:keyup.enter="addCharacterClick(characterInfo)"
                        label="Enter role name.." clearable></v-text-field>
                    </v-responsive>
                  </v-col>
                  <v-col cols="1" class="d-flex mt-3">
                    <div @click="addCharacterClick(characterInfo)">
                      <v-icon size="x-large" icon="mdi-plus-circle-outline"
                        v-bind:style="{ cursor: 'pointer' }"></v-icon>
                    </div>
                  </v-col>
                </v-row>
              </v-col>
              <v-col cols="12">
                <p class="font-italic text-left">
                  Previous Characters:
                  <template v-if="previousCharacters.length == 0">
                    <span v-bind:style="{ color: '#707070', 'font-size': '14px' }">
                      No previous characters found...
                    </span>
                  </template>
                  <template v-else>
                    <span v-bind:style="{ color: '#707070', 'font-size': '14px' }">
                      Select characters from previous stories which you used...
                    </span>
                  </template>
                </p>
                <v-row>
                  <v-col cols="auto">
                    <v-checkbox v-for="person in previousCharacters" :value="person" v-model="selectedPeople"
                      :key="person.id">
                      <template v-slot:label>
                        <span>{{ person.name }}<b>({{ person.role }})</b></span>
                      </template>
                    </v-checkbox>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <v-row>
      <v-col class="d-flex flex-row-reverse">
        <div>
          <v-btn class="mr-3" variant="flat" color="secondary" @click="closeParentPopup()">Cancel</v-btn>
          <v-btn variant="flat" color="primary" @click="addStory()"
            :disabled="!storyDetails?.title || !storyDetails?.genre || !storyDetails?.storyTheme || !storyDetails?.storyLaguage || !storyDetails?.storyLength">Add
            Story</v-btn>
        </div>
      </v-col>
    </v-row>
    <v-snackbar v-model="snackbar.value" rounded="pill">
      {{ snackbar.text }}
      <template v-slot:actions>
        <v-btn :color="snackbar.color" variant="text" @click="closeSnackBar()">Close</v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>
