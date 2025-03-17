import type { LangCountryEnum } from "@/commons/LangEnum";
import axios from "axios";

const route = "translator";

export interface Translator {
  id: number;
  name: string;
  email: string;
  sourceLanguage: LangCountryEnum | null;
  targetLanguage: LangCountryEnum | null;
}

export interface TranslatorCreate {
  name: string;
  email: string;
  sourceLanguage: LangCountryEnum | null;
  targetLanguage: LangCountryEnum | null;
}

export interface ApiErrorResponse {
  error: number;
  message: string;
  timestamp: string;
}

export interface TransaltorFilter {
  name?: string;
  email?: string;
}

export interface TransaltorPageResponse {
  content: Translator[];
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
}

export const translatorService = {
  async fetchTranslators(page: number, size: number, searchString: TransaltorFilter): Promise<TransaltorPageResponse> {
    const response = await axios.get<TransaltorPageResponse>(`${route}`, {
      params: { page, size, ...searchString },
    });
    return response.data;
  },

  async fetchTranslator(id: number): Promise<Translator> {
    const response = await axios.get<Translator>(`${route}/${id}`);
    return response.data;
  },

  async createTranslator(Translator: TranslatorCreate): Promise<Translator> {
    const response = await axios.post<Translator>(`${route}`, Translator);
    return response.data;
  },

  async updateTranslator(TranslatorId: number, Translator: TranslatorCreate): Promise<TranslatorCreate> {
    const response = await axios.put<TranslatorCreate>(`${route}/${TranslatorId}`, Translator);
    return response.data;
  },

  async deleteTranslator(id: number): Promise<void> {
    await axios.delete(`${route}/${id}`);
  },
};

