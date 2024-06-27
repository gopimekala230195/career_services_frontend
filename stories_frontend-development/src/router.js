import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/Login",
      name: "login",
      component: () => import("./views/Login.vue"),
    },
    {
      path: "/Stories",
      name: "stories",
      component: () => import("./views/Stories.vue"),
    },
    {
      path: "/Story/view/:id",
      name: "storyViewById",
      component: () => import("./views/StoryById.vue"),
    },
    {
      path: "/Story/edit/:id",
      name: "storyEditById",
      component: () => import("./views/StoryById.vue"),
    },
    {
      path: "/Profile",
      name: "profile",
      component: () => import("./views/Profile.vue"),
    },
  ],
});

export default router;
