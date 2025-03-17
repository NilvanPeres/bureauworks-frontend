<template>
  <v-dialog v-model="dialogLocal" max-width="500px">
    <v-card>
      <v-card-title> Load documents via CSV files </v-card-title>

      <v-card-text>
        <p class="mb-4">Choose a CSV file to import documents.</p>
        <p class="text-caption mb-2">The file must:</p>
        <ul class="text-caption mb-4">
          <li>Have csv extesion (.csv)</li>
          <li>Use (;) as separator</li>
          <li>
            The header must be: <strong>subject;content;locale;author</strong>
          </li>
        </ul>

        <v-file-input
          v-model="file"
          label="Choose a CSV file"
          accept=".csv"
          :error-messages="errorMessages"
          prepend-icon="mdi-file-upload"
          show-size
          truncate-length="25"
          @update:model-value="validateFile"
        ></v-file-input>

        <v-alert
          v-if="uploadStatus"
          :type="uploadStatus.type"
          :text="uploadStatus.message"
          class="mt-4"
        ></v-alert>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="grey" text @click="closeDialog">Cancel</v-btn>
        <v-btn
          color="primary"
          @click="uploadFile"
          :loading="loading"
          :disabled="!file || errorMessages.length > 0"
        >
          Import
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch } from "vue";
import { documentService } from "../services/DocumentService";
import { useToast } from "vue-toastification";
import type { ApiErrorResponse } from "../services/DocumentService";
import axios from "axios";

interface UploadStatus {
  type: "success" | "error" | "info";
  message: string;
}

export default defineComponent({
  name: "AttachFileDialog",

  props: {
    dialog: {
      type: Boolean,
      required: true,
    },
  },

  emits: ["update:dialog", "document-saved"],

  setup(props, { emit }) {
    const toast = useToast();
    const file = ref<File | null>(null);
    const loading = ref(false);
    const errorMessages = ref<string[]>([]);
    const uploadStatus = ref<UploadStatus | null>(null);

    const dialogLocal = computed({
      get: () => props.dialog,
      set: (value) => emit("update:dialog", value),
    });

    const validateFile = () => {
      errorMessages.value = [];
      uploadStatus.value = null;

      if (!file.value) {
        return;
      }

      // Verificar extensão do arquivo
      if (!file.value.name.toLowerCase().endsWith(".csv")) {
        errorMessages.value.push("O arquivo deve estar no formato CSV (.csv)");
        return;
      }

      // Verificar tamanho (opcional - limite de 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.value.size > maxSize) {
        errorMessages.value.push("O arquivo não pode ser maior que 5MB");
      }
    };

    const resetForm = () => {
      file.value = null;
      errorMessages.value = [];
      uploadStatus.value = null;
    };

    const closeDialog = () => {
      dialogLocal.value = false;
      resetForm();
    };

    const uploadFile = async () => {
      if (!file.value) {
        return;
      }

      try {
        loading.value = true;
        uploadStatus.value = {
          type: "info",
          message: "Sending file..",
        };

        await documentService.insertBatchDocuments(file.value);

        uploadStatus.value = {
          type: "success",
          message: "Document import successful!",
        };

        toast.success("Document create succesfuly!");
        emit("document-saved");

        setTimeout(() => {
          closeDialog();
        }, 1500);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          const errorData = error.response.data as ApiErrorResponse;
          uploadStatus.value = {
            type: "error",
            message: `Erro: ${errorData.message}`,
          };
          toast.error(`Erro: ${errorData.message}`);
        } else {
          uploadStatus.value = {
            type: "error",
            message: "Ocorreu um erro inesperado durante o upload.",
          };
          toast.error("Ocorreu um erro inesperado durante o upload.");
        }
      } finally {
        loading.value = false;
      }
    };

    watch(
      () => props.dialog,
      (newVal) => {
        if (newVal) {
          resetForm();
        }
      },
    );

    return {
      file,
      dialogLocal,
      loading,
      errorMessages,
      uploadStatus,
      validateFile,
      closeDialog,
      uploadFile,
    };
  },
});
</script>
