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

export interface DocumentContext {
  path: string[];
  content: string;
}

interface ChatRequest {
  message: string;
  context?: DocumentContext;
}

interface ChatResponse {
  response: string;
}

class ApiService {
  private client: AxiosInstance;

  constructor() {
    // In production: use full backend URL
    // In development: use proxy (/api)
    const baseURL = import.meta.env.VITE_API_URL || 
                    (import.meta.env.DEV ? '/api' : 'https://epiassist.onrender.com/api');
    
    console.log('API Service initialized with baseURL:', baseURL);
    
    this.client = axios.create({
      baseURL,
      timeout: 30000, // 30s for AI responses
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Log all requests in development
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

  // Send chat message with optional context
  async sendChatMessage(
    message: string, 
    context?: DocumentContext
  ): Promise<string> {
    const requestData: ChatRequest = { message };
    
    if (context) {
      requestData.context = context;
    }

    const { data } = await this.client.post<ChatResponse>('/chat', requestData);
    return data.response;
  }
}

export const api = new ApiService();