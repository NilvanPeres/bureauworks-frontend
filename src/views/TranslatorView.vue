<template>
  <v-container>
    <v-card>
      <v-card-title class="d-flex align-center flex-wrap">
        <span class="text-h6 mr-4">Translators</span>
        <v-spacer></v-spacer>

        <div class="filter-container d-flex align-center flex-wrap">
          <span class="text-subtitle-2 mr-3">Filters:</span>
          <v-text-field
            v-model="filters.name"
            label="Name"
            prepend-inner-icon="mdi-account"
            class="filter-field mx-2"
            hide-details
            clearable
            variant="outlined"
          ></v-text-field>
          <v-text-field
            v-model="filters.email"
            label="Email"
            prepend-inner-icon="mdi-email"
            class="filter-field mx-2"
            hide-details
            clearable
            variant="outlined"
          ></v-text-field>
        </div>
      </v-card-title>

      <v-data-table-server
        class="mt-4"
        :headers="headers"
        :items="translators"
        :loading="loading"
        :items-per-page="page.size"
        :items-length="page.totalElements"
        :page="currentPage"
        :items-per-page-options="[5, 10, 20]"
        @update:page="onPageChange"
        @update:items-per-page="onItemsPerPageChange"
      >
        <template v-slot:item.actions="{ item }">
          <v-icon size="small" class="me-2" @click="openEditDialog(item.id)">
            mdi-pencil
          </v-icon>
          <v-icon size="small" class="me-2" @click="openDeleteDialog(item.id)">
            mdi-delete
          </v-icon>
        </template>

        <template v-slot:no-data>
          <v-alert type="info" class="ma-4">
            None translator was found.
          </v-alert>
        </template>
      </v-data-table-server>

      <v-divider></v-divider>

      <v-card-actions>
        <v-btn color="primary" @click="openCreateDialog">
          Add translator manually
        </v-btn>
      </v-card-actions>
      <delete-dialog
        :dialog="deleteDialog"
        :item-id="selectedItemId"
        @confirm="handleConfirmDelete"
        @cancel="handleCancelDelete"
      />
      <create-edit-dialog
        :dialog="createEditDialog"
        :item-id="selectedItemId"
        @translator-saved="fetchTranslator"
        @cancelPutPost="handleCancelUpdateCreateOperation"
      />
      <attach-file-dialog
        v-model:dialog="attachFielDialog"
        @translator-saved="fetchTranslator"
      />
    </v-card>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from "vue";
import axios from "axios";
import { translatorService } from "../services/TranslatorService";
import type { Translator } from "../services/TranslatorService";
import type { TransaltorFilter } from "../services/TranslatorService";
import type { ApiErrorResponse } from "../services/TranslatorService";
import DeleteDialog from "../components/DeleteDialog.vue";
import CreateEditDialog from "../components/CreateEditTranslatorDialog.vue";
import AttachFileDialog from "../components/AttachFileDialog.vue";
import { useToast } from "vue-toastification";
import { watch } from "vue";

export default defineComponent({
  name: "TranslatorsView",
  components: {
    DeleteDialog,
    CreateEditDialog,
    AttachFileDialog,
  },

  setup() {
    const translators = ref<Translator[]>([]);
    const errorApiMessage = ref<ApiErrorResponse | null>(null);
    const filters = ref<TransaltorFilter>({
      name: "",
      email: "",
    });
    const loading = ref(false);
    const search = ref("");
    const currentPage = ref(1);
    const page = ref({
      size: 10,
      number: 0,
      totalElements: 0,
      totalPages: 0,
    });
    const headers = [
      { title: "ID", key: "id" },
      { title: "Name", key: "name" },
      { title: "Email", key: "email" },
      { title: "Source language", key: "sourceLanguage" },
      { title: "Target language", key: "targetLanguage" },
      { title: "Actions", key: "actions" },
    ];
    const toast = useToast();
    const deleteDialog = ref(false);
    const createEditDialog = ref(false);
    const attachFielDialog = ref(false);
    const selectedItemId = ref<number | undefined>(undefined);

    const openDeleteDialog = (id: number) => {
      selectedItemId.value = id;
      deleteDialog.value = true;
    };

    const openEditDialog = (item: number) => {
      selectedItemId.value = item;
      createEditDialog.value = true;
    };

    const openCreateDialog = () => {
      selectedItemId.value = undefined;
      createEditDialog.value = true;
    };

    const openCsvDialog = () => {
      attachFielDialog.value = true;
    };

    const handleConfirmDelete = async (id: number) => {
      try {
        await translatorService.deleteTranslator(id);
        fetchTranslator();
        toast.success("Sucessefully deleted the translator!");
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          const errorData = error.response.data as ApiErrorResponse;
          toast.error(`Error: ${errorData.message}`);
        } else {
          toast.error("An unexpected error occurred.");
        }
      } finally {
        deleteDialog.value = false;
      }
    };

    const handleCancelDelete = () => {
      deleteDialog.value = false;
    };

    const handleCancelUpdateCreateOperation = () => {
      createEditDialog.value = false;
    };

    watch(
      filters,
      () => {
        currentPage.value = 1;
        fetchTranslator();
      },
      { deep: true },
    );

    const fetchTranslator = async () => {
      loading.value = true;
      try {
        const response = await translatorService.fetchTranslators(
          currentPage.value - 1,
          page.value.size,
          filters.value,
        );
        page.value = {
          size: page.value.size,
          number: response.page.number,
          totalElements: response.page.totalElements,
          totalPages: response.page.totalPages,
        };
        translators.value = response.content;
      } catch (error) {
        console.error("Failed to find translators:", error);
      } finally {
        loading.value = false;
      }
    };

    const onItemsPerPageChange = (size: number) => {
      page.value.size = size;
      currentPage.value = 1;
      fetchTranslator();
    };

    const onPageChange = (pageNumber: number) => {
      currentPage.value = pageNumber;
      fetchTranslator();
    };

    onMounted(() => {
      fetchTranslator();
    });

    return {
      filters,
      translators,
      loading,
      search,
      headers,
      page,
      currentPage,
      deleteDialog,
      selectedItemId,
      errorApiMessage,
      createEditDialog,
      attachFielDialog,
      fetchTranslator,
      onItemsPerPageChange,
      onPageChange,
      openDeleteDialog,
      openEditDialog,
      handleConfirmDelete,
      handleCancelDelete,
      openCreateDialog,
      handleCancelUpdateCreateOperation,
      openCsvDialog,
    };
  },
});
</script>

<style scoped>
.filter-container {
  margin-top: 8px;
  width: 100%;
}

.filter-field {
  max-width: 300px;
  min-width: 250px;
  height: 48px;
}

@media (max-width: 960px) {
  .filter-container {
    margin-top: 12px;
    width: 100%;
  }

  .filter-field {
    max-width: 100%;
    min-width: unset;
    margin-bottom: 8px;
  }
}
</style>
