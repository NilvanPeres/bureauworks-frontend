<script setup lang="ts">
import { ref, watch } from "vue";
import { useRouter } from "vue-router"; // Import useRouter to enable redirection

const router = useRouter(); // Initialize router for navigation

const items = [
  {
    title: "Document",
    value: "document",
    route: "/",
  },
  {
    title: "Translator",
    value: "translator",
    route: "/translator",
  },
];

const drawer = ref(false);
const group = ref(null);

watch(group, () => {
  drawer.value = false;
});

const navigateTo = (route: string) => {
  router.push(route); // Use Vue Router to navigate
};
</script>

<template>
  <v-card>
    <v-layout>
      <v-app-bar color="primary">
        <v-app-bar-nav-icon
          variant="text"
          @click.stop="drawer = !drawer"
        ></v-app-bar-nav-icon>
        <v-toolbar-title>Menu</v-toolbar-title>
        <v-spacer></v-spacer>
      </v-app-bar>

      <v-navigation-drawer
        v-model="drawer"
        :location="$vuetify.display.mobile ? 'bottom' : undefined"
        temporary
      >
        <v-list>
          <v-list-item
            v-for="item in items"
            :key="item.value"
            :title="item.title"
            @click="navigateTo(item.route)"
          >
          </v-list-item>
        </v-list>
      </v-navigation-drawer>
    </v-layout>
  </v-card>
</template>
