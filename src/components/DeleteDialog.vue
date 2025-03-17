<template>
  <v-dialog v-model="dialog" max-width="500">
    <v-card>
      <v-card-title class="headline">Confirm Deletion</v-card-title>
      <v-card-text>
        Are you sure you want to <strong>delete</strong> this item ? This action
        cannot be undone.
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="red" text @click="confirmDelete"> Yes, Delete </v-btn>
        <v-btn color="grey" text @click="closeDialog"> Cancel </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "DeleteDialog",
  props: {
    dialog: {
      type: Boolean,
      required: true,
    },
    itemId: {
      type: Number,
      required: false,
    },
  },
  emits: ["confirm", "cancel"],

  setup(props, { emit }) {
    const closeDialog = () => {
      emit("cancel");
    };

    const confirmDelete = () => {
      emit("confirm", props.itemId);
    };

    return {
      closeDialog,
      confirmDelete,
    };
  },
});
</script>
