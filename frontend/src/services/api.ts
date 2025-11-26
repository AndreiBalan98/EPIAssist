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

interface ChatRequest {
  message: string;
}

interface ChatResponse {
  response: string;
}

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_URL || '/api',
      timeout: 30000, // 30s for AI responses
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

  // Send chat message
  async sendChatMessage(message: string): Promise<string> {
    const { data } = await this.client.post<ChatResponse>('/chat', { message } as ChatRequest);
    return data.response;
  }
}

export const api = new ApiService();