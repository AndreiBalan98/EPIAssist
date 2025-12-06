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
    const baseURL = import.meta.env.VITE_API_URL || 
                    (import.meta.env.DEV ? '/api' : 'https://epiassist.onrender.com/api');
    
    console.log('API Service initialized with baseURL:', baseURL);
    
    this.client = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (import.meta.env.DEV) {
      this.client.interceptors.request.use(request => {
        console.log('API Request:', request.method?.toUpperCase(), request.url);
        return request;
      });
    }
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

  // Send chat message - simple prompt, no context
  async sendChatMessage(message: string): Promise<string> {
    const requestData: ChatRequest = { message };
    const { data } = await this.client.post<ChatResponse>('/chat', requestData);
    return data.response;
  }
}

export const api = new ApiService();