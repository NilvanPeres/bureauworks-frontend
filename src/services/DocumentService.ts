import axios from "axios";
import type { LangCountryEnum } from "@/commons/LangEnum";

const route = "document";

export interface Document {
  id: number;
  author: string;
  subject: string;
  locale: string;
}

export interface DocumentAllFields {
  author: string;
  subject: string;
  content: string;
  locale: LangCountryEnum | null;
}

export interface ApiErrorResponse {
  error: number;
  message: string;
  timestamp: string;
}

export interface DocumentFilter {
  author?: string;
  subject?: string;
}

export interface DocumentResponse {
  content: Document[];
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
}

export const documentService = {
  async fetchDocuments(
    page: number,
    size: number,
    searchString: DocumentFilter,
  ): Promise<DocumentResponse> {
    const response = await axios.get<DocumentResponse>(`${route}`, {
      params: { page, size, ...searchString },
    });
    return response.data;
  },

  async fetchDocument(id: number): Promise<DocumentAllFields> {
    const response = await axios.get<DocumentAllFields>(`${route}/${id}`);
    return response.data;
  },

  async createDocument(
    document: DocumentAllFields,
  ): Promise<DocumentAllFields> {
    const response = await axios.post<DocumentAllFields>(`${route}`, document);
    return response.data;
  },

  async updateDocument(
    documentId: number,
    document: DocumentAllFields,
  ): Promise<DocumentAllFields> {
    const response = await axios.put<DocumentAllFields>(
      `${route}/${documentId}`,
      document,
    );
    return response.data;
  },

  async deleteDocument(id: number): Promise<void> {
    await axios.delete(`${route}/${id}`);
  },

  async insertBatchDocuments(file: File): Promise<void> {
    const formData = new FormData();
    formData.append("file", file);

    await axios.post(`${route}/file`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};
