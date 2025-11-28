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
    // VITE_API_URL should be set via environment variables
    // Development: /api (uses Vite proxy)
    // Production: https://epiassist.onrender.com/api (direct to backend)
    const baseURL = import.meta.env.VITE_API_URL || '/api';

    console.log('API Service initialized with baseURL:', baseURL);
    console.log('Environment:', import.meta.env.MODE);
    
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

  // Send chat message and receive streaming response
  async sendChatMessageStream(
    message: string,
    context?: DocumentContext,
    onChunk: (chunk: string) => void,
    onComplete: () => void,
    onError: (error: string) => void
  ): Promise<void> {
    const requestData: ChatRequest = { message };

    if (context) {
      requestData.context = context;
    }

    try {
      const response = await fetch(
        `${this.client.defaults.baseURL}/chat/stream`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestData),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('Response body is not readable');
      }

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          onComplete();
          break;
        }

        // Decode the chunk
        const chunk = decoder.decode(value, { stream: true });

        // Process SSE format: "data: {content}\n\n"
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6); // Remove "data: " prefix

            if (data === '[DONE]') {
              onComplete();
              return;
            }

            if (data.startsWith('[ERROR]')) {
              onError(data.slice(8)); // Remove "[ERROR] " prefix
              return;
            }

            if (data.trim()) {
              onChunk(data);
            }
          }
        }
      }
    } catch (error) {
      console.error('Streaming error:', error);
      onError(error instanceof Error ? error.message : 'Unknown error');
    }
  }
}

export const api = new ApiService();