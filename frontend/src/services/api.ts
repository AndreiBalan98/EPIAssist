/**
 * API service for backend communication.
 * Works automatically in both development (localhost) and production (Vercel+Render).
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
    // Development: use proxy to localhost:8000 via Vite
    // Production: use full backend URL directly
    const isDev = import.meta.env.DEV;
    const baseURL = isDev 
      ? '/api'  // Proxied by Vite to localhost:8000
      : 'https://epiassist.onrender.com/api';  // Direct in production
    
    console.log('🚀 API Service initialized');
    console.log('   Environment:', isDev ? 'development' : 'production');
    console.log('   Base URL:', baseURL);
    
    this.client = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor for debugging (development only)
    if (isDev) {
      this.client.interceptors.request.use(request => {
        console.log('📤 API Request:', request.method?.toUpperCase(), request.url);
        return request;
      });

      this.client.interceptors.response.use(
        response => {
          console.log('📥 API Response:', response.status, response.config.url);
          return response;
        },
        error => {
          console.error('❌ API Error:', error.message);
          if (error.response) {
            console.error('   Status:', error.response.status);
            console.error('   Data:', error.response.data);
          }
          return Promise.reject(error);
        }
      );
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