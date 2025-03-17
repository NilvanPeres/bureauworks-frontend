<template>
  <v-container>
    <v-card>
      <v-card-title>
        Documentos
        <v-spacer></v-spacer>
        <v-card-title>
          Filters:
          <v-text-field
            v-model="filters.author"
            label="Author"
            single-line
            hide-details
            density="compact"
          ></v-text-field>
          <v-text-field
            v-model="filters.subject"
            label="Subject"
            single-line
            hide-details
            density="compact"
          ></v-text-field>
        </v-card-title>
      </v-card-title>

      <v-data-table-server
        :headers="headers"
        :items="documents"
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
            None file was found.
          </v-alert>
        </template>
      </v-data-table-server> 

      <v-divider></v-divider>
      
      <v-card-actions>
        <v-btn color="primary" @click="openCreateDialog">
          Add document manually
        </v-btn>
        <v-btn color="primary" @click="openCsvDialog">
          Add documents from CSV file
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
        @document-saved="fetchDocuments"
        @cancelPutPost="handleCancelUpdateCreateOperation"
      />
      <attach-file-dialog 
        v-model:dialog="attachFielDialog"
        @document-saved="fetchDocuments"
      />
    </v-card>
  </v-container>
</template>
  
<script lang="ts">

  import { defineComponent, ref, onMounted } from 'vue';
  import axios from 'axios';
  import { documentService } from '../services/DocumentService';
  import type { Document } from '../services/DocumentService';
  import type { DocumentFilter } from '../services/DocumentService';
  import type { ApiErrorResponse } from '../services/DocumentService';
  import DeleteDialog from '../components/DeleteDialog.vue';
  import CreateEditDialog from '../components/CreateEditDialog.vue';
  import AttachFileDialog from '../components/AttachFileDialog.vue';
  import { useToast } from "vue-toastification";
  import { watch } from 'vue';
  
  export default defineComponent({
    name: 'DocumentsView',
    components: {
      DeleteDialog,
      CreateEditDialog,
      AttachFileDialog
    },
    
    setup() {
      const documents = ref<Document[]>([]);
      const errorApiMessage = ref<ApiErrorResponse | null>(null);
      const filters = ref<DocumentFilter>({
        author: '',
        subject: ''
      });
      const loading = ref(false);
      const search = ref('');
      const currentPage = ref(1);
      const page = ref({
        size: 10,
        number: 0,
        totalElements: 0,
        totalPages: 0
      });
      const headers = [
        { title: 'ID', key: 'id', sortable: true },
        { title: 'Author', key: 'author', sortable: true },
        { title: 'Subject', key: 'subject', sortable: true },
        { title: 'Locale', key: 'locale', sortable: true },
        { title: 'Actions', key: 'actions', sortable: false }
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
          await documentService.deleteDocument(id);
          fetchDocuments();
          toast.success("Sucessefully deleted the document!");
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


      watch(filters, () => {
        currentPage.value = 1; 
        fetchDocuments(); 
      }, { deep: true });
  
      const fetchDocuments = async () => {
        loading.value = true;
        try {
          const response = await documentService.fetchDocuments(currentPage.value - 1, page.value.size, filters.value);
          page.value = {
            size: page.value.size,
            number: response.page.number,
            totalElements: response.page.totalElements,
            totalPages: response.page.totalPages
          };
          documents.value = response.content;
        } catch (error) {
          console.error("Erro ao buscar documentos:", error);
        } finally {
          loading.value = false;
        }
      };

      const onItemsPerPageChange = (size: number) => {
        page.value.size = size;
        currentPage.value = 1;
        fetchDocuments();
      };

      const onPageChange = (pageNumber: number) => {
        currentPage.value = pageNumber;
        fetchDocuments();
      };

      onMounted(() => {
        fetchDocuments();
      });
  
      return {
        filters,
        documents,
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
        fetchDocuments,
        onItemsPerPageChange,
        onPageChange,
        openDeleteDialog,
        openEditDialog,
        handleConfirmDelete,
        handleCancelDelete,
        openCreateDialog,
        handleCancelUpdateCreateOperation,
        openCsvDialog
      };
    }
  });
</script>
  
<style scoped>
  .v-data-table {
    width: 100%;
  }
</style>