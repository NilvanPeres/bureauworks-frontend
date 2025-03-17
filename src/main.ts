import { createApp } from "vue";
import "vuetify/styles"; // Ensure styles are imported
import { createVuetify } from "vuetify";
import { aliases, mdi } from "vuetify/iconsets/mdi";
import "@mdi/font/css/materialdesignicons.css";
import App from "./App.vue";
import router from "./router";
import axios from "axios";
import Toast from "vue-toastification";
import type { PluginOptions } from "vue-toastification";
import { POSITION } from "vue-toastification";
import "vue-toastification/dist/index.css";

// Create Vuetify instance
const vuetify = createVuetify({
  theme: {
    defaultTheme: "light",
  },
  icons: {
    defaultSet: "mdi",
    aliases,
    sets: { mdi },
  },
});

axios.defaults.baseURL = "http://localhost:8080/api/v1/";

const toastOptions: PluginOptions = {
  position: POSITION.TOP_RIGHT,
  timeout: 3000,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  showCloseButtonOnHover: true,
};

const app = createApp(App);

// Use Vuetify and Router
app.use(vuetify);
app.use(Toast, toastOptions);
app.use(router);

app.mount("#app");
