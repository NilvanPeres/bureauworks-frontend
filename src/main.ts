import { createApp } from 'vue';
import 'vuetify/styles'; // Ensure styles are imported
import { createVuetify } from 'vuetify';
import { aliases, mdi } from 'vuetify/iconsets/mdi';
import '@mdi/font/css/materialdesignicons.css';
import App from './App.vue';
import router from './router';

// Create Vuetify instance
const vuetify = createVuetify({
  theme: {
    defaultTheme: 'light',
  },
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: { mdi },
  },
});

const app = createApp(App);

// Use Vuetify and Router
app.use(vuetify);
app.use(router);

app.mount('#app');
