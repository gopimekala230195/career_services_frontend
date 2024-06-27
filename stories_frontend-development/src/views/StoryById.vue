<script setup>
import { onMounted, ref } from "vue";
import StoriesServices from "../services/StoriesServices";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";

const router = useRoute();
const route = useRouter();

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

const longStringContent = ref(``);

const accessType = ref("");
const story = ref({
    id: null,
    title: "",
    genre: null,
    storyLength: null,
    content: "",
    characters: [],
    storyTheme: null,
    storyLaguage: null,
    updatedDate: null,
});

onMounted(async () => {
    const pathName = router.path;
    accessType.value = pathName.startsWith("/Story/view/") ? "view" : "edit";
    user.value = JSON.parse(localStorage.getItem("user"));
    await getStory(router?.params?.id);
});

async function getStory(storyId) {
    await StoriesServices.getStoryByStoryId(storyId)
        .then((response) => {
            story.value = response?.data?.data;
        })
        .catch((error) => {
            console.log(error);
            snackbar.value.value = true;
            snackbar.value.color = "error";
            snackbar.value.text = error.response.data.message;
        });
}

async function updateStory() {
    await StoriesServices.updateStory(story?.value?.id, story.value)
        .then((response) => {
            if (response.data.status === "Success") {
                showSnackbar("green", response.data.message);
                route.push({ name: "stories" });
            } else {
                showSnackbar("error", response.data.message);
            }
        })
        .catch((error) => {
            console.log(error);
            snackbar.value.value = true;
            snackbar.value.color = "error";
            snackbar.value.text = error.response.data.message;
        });
}

async function generatePDF() {
    let baseurl = "";
    if (process.env.NODE_ENV === "development") {
        baseurl = "http://localhost/storiesapi/";
    } else {
        baseurl = "/storiesapi/";
    }
    try {
        const response = await axios.get(`${baseurl}stories/generatePDF/${story.value.id}`, {
            responseType: 'blob',
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${story.value.title}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
    } catch (error) {
        console.log(error);
        showSnackbar('error', 'Failed to generate PDF');
    }
}

function closeSnackBar() {
    snackbar.value.value = false;
}

const showSnackbar = (color, msg) => {
    snackbar.value.value = true;
    snackbar.value.color = color;
    snackbar.value.text = msg;
};
</script>
<template>
    <v-container>
        <v-card class="rounded-lg elevation-5" color="#232323" dark>
            <v-card-title>
                <v-row align="center" justify="space-between">
                    <v-col cols="auto">
                        <span>{{ story.title }}</span>
                    </v-col>
                    <v-col cols="auto">
                        <v-btn color="primary" @click="generatePDF">Generate PDF</v-btn>
                    </v-col>
                </v-row>
            </v-card-title>
            <v-card-subtitle>{{ story.genre?.genreName }}</v-card-subtitle>
            <v-card-text>
                <template v-if="accessType === 'edit'">
                    <v-textarea v-model="story.content" label="Content" rows="10" outlined></v-textarea>
                </template>
                <template v-else>
                    <div class="long-content">{{ story?.content }}</div>
                </template>
            </v-card-text>
            <v-card-actions>
                <v-btn class="mr-3" variant="flat" color="secondary" :to="{ name: 'stories' }">Back</v-btn>
                <v-btn v-if="accessType === 'edit'" variant="flat" color="primary" @click="updateStory()"
                    :disabled="!story?.content">Update Content</v-btn>
            </v-card-actions>
        </v-card>
    </v-container>
    <v-snackbar v-model="snackbar.value" rounded="pill">
        {{ snackbar.text }}

        <template v-slot:actions>
            <v-btn :color="snackbar.color" variant="text" @click="closeSnackBar()">
                Close
            </v-btn>
        </template>
    </v-snackbar>
</template>

<style scoped>
.long-content {
    white-space: pre-line;
    /* CSS to handle new lines */
    color: #fff;
    margin-top: 20px;
}
</style>