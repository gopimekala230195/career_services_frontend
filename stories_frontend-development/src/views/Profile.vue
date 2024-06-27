<script setup>
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import UserServices from "../services/UserServices.js";

const router = useRouter();

const isEditProfile = ref(false);
const showDeleteConf = ref(false);
const emailInValid = ref(false);
const user = ref({
    id: "",
    firstName: "",
    lastName: "",
    email: "",
});

const snackbar = ref({
    value: false,
    color: "",
    text: "",
});

onMounted(async () => {
    const loggedInUser = JSON.parse(localStorage.getItem("user"));
    await getUser(loggedInUser?.id);
});

async function getUser(userId) {
    await UserServices.getUserById(userId)
        .then((response) => {
            emailInValid.value = false;
            isEditProfile.value = false;
            user.value = {
                firstName: response?.data?.firstName,
                lastName: response?.data?.lastName,
                email: response?.data?.email,
                id: response?.data?.id,
            }
        })
        .catch((error) => {
            console.log(error);
            snackbar.value.value = true;
            snackbar.value.color = "error";
            snackbar.value.text = error.response.data.message;
        });
}

async function deactiveAccount() {
    await UserServices.deactivateUser(user.value?.id)
        .then((response) => {
            if (response.data.status === "Success") {
                showDeleteConf.value = false;
                showSnackbar("green", response.data.message);
                setTimeout(() => {
                    localStorage.removeItem("user");
                    user.value = null;
                    router.push({ name: "login" });
                }, 2000);
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

async function updateUser() {
    await UserServices.updateUser(user?.value?.id, user.value)
        .then((response) => {
            if (response.data.status === "Success") {
                let storedUser = JSON.parse(localStorage.getItem("user"));
                storedUser.firstName = user?.value?.firstName;
                storedUser.lastName = user?.value?.lastName;
                storedUser.email = user?.value?.email;
                window.localStorage.setItem("user", JSON.stringify(storedUser));
                showSnackbar("green", response.data.message);
                getUser(user.value?.id);
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

function closeSnackBar() {
    snackbar.value.value = false;
}

const showSnackbar = (color, msg) => {
    snackbar.value.value = true;
    snackbar.value.color = color;
    snackbar.value.text = msg;
};

function openEditProfile() {
    emailInValid.value = false;
    isEditProfile.value = true;
}

function closeEditProfile() {
    emailInValid.value = false;
    isEditProfile.value = false;
    getUser(user.value?.id);
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

function openDeletePopup(e) {
    e?.stopPropagation();
    showDeleteConf.value = true;
}

function closeDeletePopup() {
    showDeleteConf.value = false;
}

</script>
<template>
    <v-container>
        <v-card class="rounded-lg elevation-5" color="#232323" dark>
            <v-card-title>
                <v-row align="center" justify="space-between">
                    <v-col cols="auto">
                        <span>Profile</span>
                    </v-col>
                    <v-col cols="auto">
                        <v-btn class="mr-3" variant="flat" color="secondary" :to="{ name: 'stories' }">Back</v-btn>
                        <v-btn color="primary" @click="openEditProfile">Edit</v-btn>
                    </v-col>
                </v-row>
            </v-card-title>
            <v-card-text>
                <v-row align="center" justify="center">
                    <v-col cols="auto">
                        <p><b>First Name: </b>{{ user.firstName }}</p>
                    </v-col>
                </v-row>
                <v-row align="center" justify="center">
                    <v-col cols="auto">
                        <p><b>Last Name: </b>{{ user.lastName }}</p>
                    </v-col>
                </v-row>
                <v-row align="center" justify="center">
                    <v-col cols="auto">
                        <p><b>Email: </b>{{ user.email }}</p>
                    </v-col>
                </v-row>
            </v-card-text>
            <v-card-actions>
                <v-row align="center" justify="center">
                    <v-col cols="auto">
                        <v-btn variant="flat" color="red" @click="(e) => openDeletePopup(e)"
                            :disabled="!user?.id">Deactivate
                            Account</v-btn>
                    </v-col>
                </v-row>
            </v-card-actions>
        </v-card>
    </v-container>
    <v-dialog persistent v-model="isEditProfile" width="700">
        <v-card color="#232323" class="rounded-lg elevation-5">
            <v-card-title class="headline mb-2">Edit Profile</v-card-title>
            <v-card-text>
                <v-text-field v-model="user.firstName" label="First Name*" required></v-text-field>

                <v-text-field v-model="user.lastName" label="Last Name*" required></v-text-field>

                <v-text-field v-model="user.email" label="Email*" :hint="emailInValid && 'Please enter valid email'"
                    @input="onEmailChange" required></v-text-field>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn @click="closeEditProfile()">Close</v-btn>
                <v-btn variant="outlined" :disabled="emailInValid ||
                            !user.email ||
                            !user.firstName ||
                            !user.lastName" @click="updateUser()">Update Profile</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
    <v-dialog persistent v-model="showDeleteConf" width="600">
        <v-container>
            <v-card class="rounded-lg elevation-5">
                <div class="pb-2 pl-5 pt-5 pr-5">Are you sure want to deactivate the user?
                    <v-row class="mt-3">
                        <v-col class="d-flex justify-end">
                            <v-btn class="mr-3" variant="flat" color="secondary"
                                @click="closeDeletePopup()">Cancel</v-btn>
                            <v-btn variant="flat" color="primary" @click="deactiveAccount()">Confirm</v-btn>
                        </v-col>
                    </v-row>
                </div>
            </v-card>
        </v-container>
    </v-dialog>
    <v-snackbar v-model="snackbar.value" rounded="pill">
        {{ snackbar.text }}

        <template v-slot:actions>
            <v-btn :color="snackbar.color" variant="text" @click="closeSnackBar()">
                Close
            </v-btn>
        </template>
    </v-snackbar>
</template>