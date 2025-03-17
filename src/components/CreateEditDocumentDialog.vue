<template>
  <v-dialog v-model="dialogLocal" max-width="600px">
    <v-card>
      <v-card-title class="text-h6">
        {{ itemId ? "Edit document" : "Add document" }}
      </v-card-title>
      <v-card-text>
        <v-form ref="form" v-model="valid">
          <v-text-field
            v-model="document.subject"
            label="Subject"
            :rules="[rules.required]"
            required
            hide-details
            clearable
            variant="outlined"
            class="mb-4"
          ></v-text-field>

          <v-textarea
            v-model="document.content"
            label="Content"
            :rules="[rules.required]"
            required
            auto-grow
            hide-details
            clearable
            variant="outlined"
            class="mb-4"
          ></v-textarea>

          <v-select
            v-model="document.locale"
            :items="localeOptions"
            label="Locale"
            variant="outlined"
            class="mb-4"
          ></v-select>

          <v-text-field
            v-model="document.author"
            label="Author"
            hide-details
            clearable
            variant="outlined"
            class="mb-4"
          ></v-text-field>
        </v-form>
      </v-card-text>
      <v-card-actions class="justify-end">
        <v-btn color="grey" text @click="closeDialog">Cancelar</v-btn>
        <v-btn color="primary" @click="saveDocument" :loading="loading"
          >Salvar</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch } from "vue";
import { documentService } from "../services/DocumentService";
import type { DocumentAllFields } from "../services/DocumentService";
import type { ApiErrorResponse } from "../services/DocumentService";
import { LangCountryEnum } from "../commons/LangEnum";
import { useToast } from "vue-toastification";
import axios from "axios";

export default defineComponent({
  name: "CreateEditDocumentDialog",

  props: {
    dialog: {
      type: Boolean,
      required: true,
    },
    itemId: {
      type: Number,
      default: null,
    },
  },

  emits: ["update:dialog", "document-saved", "cancelPutPost"],

  setup(props, { emit }) {
    const toast = useToast();
    const form = ref(null);
    const valid = ref(false);
    const loading = ref(false);

    const document = ref<DocumentAllFields>({
      subject: "",
      content: "",
      locale: null,
      author: "",
    });

    const rules = {
      required: (v: string) => !!v || "Field is required",
    };

    const dialogLocal = computed({
      get: () => props.dialog,
      set: (value) => emit("update:dialog", value),
    });

    const fetchDocument = async (id: number) => {
      try {
        loading.value = true;
        document.value = await documentService.fetchDocument(id);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          const errorData = error.response.data as ApiErrorResponse;
          toast.error(`Erro ao buscar documento: ${errorData.message}`);
        } else {
          toast.error("Ocorreu um erro inesperado ao buscar o documento.");
        }
      } finally {
        loading.value = false;
      }
    };

    const resetForm = () => {
      document.value = {
        subject: "",
        content: "",
        locale: null,
        author: "",
      };
      if (form.value) {
        // @ts-ignore
        form.value.resetValidation();
      }
    };

    const closeDialog = () => {
      emit("cancelPutPost");
      dialogLocal.value = false;
    };

    const saveDocument = async () => {
      // @ts-ignore
      if (!form.value?.validate()) {
        return;
      }

      try {
        loading.value = true;
        let response;

        if (props.itemId) {
          response = await documentService.updateDocument(
            props.itemId,
            document.value,
          );
          toast.success("Documento atualizado com sucesso!");
        } else {
          response = await documentService.createDocument(document.value);
          toast.success("Documento criado com sucesso!");
        }

        emit("document-saved", response);
        closeDialog();
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          const errorData = error.response.data as ApiErrorResponse;
          toast.error(`Erro: ${errorData.message}`);
        } else {
          toast.error("Ocorreu um erro inesperado.");
        }
      } finally {
        loading.value = false;
      }
    };

    watch(
      () => props.itemId,
      (newVal) => {
        if (newVal) {
          fetchDocument(newVal);
        } else {
          resetForm();
        }
      },
    );

    watch(
      () => props.dialog,
      (newVal) => {
        if (newVal && !props.itemId) {
          resetForm();
        }
      },
    );

    const localeOptions = Object.values(LangCountryEnum);

    return {
      form,
      valid,
      document,
      dialogLocal,
      loading,
      localeOptions,
      rules,
      closeDialog,
      saveDocument,
    };
  },
});
</script>
