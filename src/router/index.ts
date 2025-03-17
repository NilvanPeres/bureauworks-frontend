import { createRouter, createWebHistory } from "vue-router";
import Document from "@/views/DocumentView.vue";
import Translator from "@/views/TranslatorView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "document",
      component: Document,
    },
    {
      path: "/translator",
      name: "translator",
      component: Translator,
    },
  ],
});

export default router;
