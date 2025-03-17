<template>
  <v-dialog v-model="dialogLocal" max-width="600px">
    <v-card>
      <v-card-title class="text-h6">
        {{ itemId ? "Edit translator" : "Add translator" }}
      </v-card-title>
      <v-card-text>
        <v-form ref="form" v-model="valid">
          <v-text-field
            v-model="translator.name"
            label="Name"
            :rules="[rules.required]"
            required
            hide-details
            clearable
            variant="outlined"
            class="mb-4"
          ></v-text-field>

          <v-text-field
            v-model="translator.email"
            label="Email"
            :rules="[rules.required]"
            required
            hide-details
            clearable
            variant="outlined"
            class="mb-4"
          ></v-text-field>

          <v-select
            v-model="translator.sourceLanguage"
            :items="localeOptions"
            required
            label="Source Language"
            variant="outlined"
            class="mb-4"
          ></v-select>

          <v-select
            v-model="translator.targetLanguage"
            :items="localeOptions"
            label="Target Language"
            required
            variant="outlined"
            class="mb-4"
          ></v-select>
        </v-form>
      </v-card-text>
      <v-card-actions class="justify-end">
        <v-btn color="grey" text @click="closeDialog">Cancelar</v-btn>
        <v-btn color="primary" @click="saveTranslator" :loading="loading"
          >Salvar</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch } from "vue";
import { LangCountryEnum } from "../commons/LangEnum";
import { translatorService } from "../services/TranslatorService";
import type { TranslatorCreate } from "../services/TranslatorService";
import type { ApiErrorResponse } from "../services/TranslatorService";
import { useToast } from "vue-toastification";
import axios from "axios";

export default defineComponent({
  name: "CreateEditTranslatorDialog",

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

  emits: ["update:dialog", "translator-saved", "cancelPutPost"],

  setup(props, { emit }) {
    const toast = useToast();
    const form = ref(null);
    const valid = ref(false);
    const loading = ref(false);

    const translator = ref<TranslatorCreate>({
      name: "",
      email: "",
      sourceLanguage: null,
      targetLanguage: null,
    });

    const rules = {
      required: (v: string) => !!v || "Field is required",
    };

    const dialogLocal = computed({
      get: () => props.dialog,
      set: (value) => emit("update:dialog", value),
    });

    const fetchTranslator = async (id: number) => {
      try {
        loading.value = true;
        translator.value = await translatorService.fetchTranslator(id);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          const errorData = error.response.data as ApiErrorResponse;
          toast.error(`Erro to find translator: ${errorData.message}`);
        } else {
          toast.error("Unexpected error to find translator.");
        }
      } finally {
        loading.value = false;
      }
    };

    const resetForm = () => {
      translator.value = {
        name: "",
        email: "",
        sourceLanguage: null,
        targetLanguage: null,
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

    const saveTranslator = async () => {
      // @ts-ignore
      if (!form.value?.validate()) {
        return;
      }

      try {
        loading.value = true;
        let response;

        if (props.itemId) {
          response = await translatorService.updateTranslator(
            props.itemId,
            translator.value,
          );
          toast.success("Translator updated!");
        } else {
          response = await translatorService.createTranslator(translator.value);
          toast.success("Translatoro created!");
        }

        emit("translator-saved", response);
        closeDialog();
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          const errorData = error.response.data as ApiErrorResponse;
          toast.error(`Err: ${errorData.message}`);
        } else {
          toast.error("Unexpected error. Try again later.");
        }
      } finally {
        loading.value = false;
      }
    };

    watch(
      () => props.itemId,
      (newVal) => {
        if (newVal) {
          fetchTranslator(newVal);
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
      translator,
      dialogLocal,
      loading,
      localeOptions,
      rules,
      closeDialog,
      saveTranslator,
      fetchTranslator,
    };
  },
});
</script>
