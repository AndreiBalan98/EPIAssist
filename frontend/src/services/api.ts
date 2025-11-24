/**
 * API service for backend communication.
 */
import axios, { AxiosInstance } from 'axios';

interface StatusResponse {
  status: string;
  message: string;
}

interface DocumentResponse {
  filename: string;
  content: string;
}

interface DocumentListResponse {
  documents: string[];
}

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_URL || '/api',
      timeout: 10000,
    });
  }

  // Health check
  async getStatus(): Promise<StatusResponse> {
    const { data } = await this.client.get<StatusResponse>('/status');
    return data;
  }

  // List all documents
  async listDocuments(): Promise<string[]> {
    const { data } = await this.client.get<DocumentListResponse>('/documents');
    return data.documents;
  }

  // Get specific document
  async getDocument(filename: string): Promise<DocumentResponse> {
    const { data } = await this.client.get<DocumentResponse>(`/documents/${filename}`);
    return data;
  }
}

export const api = new ApiService();