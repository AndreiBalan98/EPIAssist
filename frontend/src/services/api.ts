import axios from 'axios';

const API_BASE_URL = '/api';

interface MarkdownFile {
  filename: string;
  content: string;
}

export const api = {
  // Check if the API is running
  checkStatus: async (): Promise<{ status: string; message: string }> => {
    const response = await axios.get(`${API_BASE_URL}/status`);
    return response.data;
  },

  // List all markdown files
  listMarkdownFiles: async (): Promise<string[]> => {
    const response = await axios.get(`${API_BASE_URL}/markdown-files`);
    return response.data;
  },

  // Get a specific markdown file
  getMarkdownFile: async (filename: string): Promise<MarkdownFile> => {
    const response = await axios.get(`${API_BASE_URL}/markdown/${filename}`);
    return response.data;
  },

  // Send a message (placeholder for future functionality)
  sendMessage: async (message: string): Promise<{ success: boolean }> => {
    // This is a placeholder for future implementation
    console.log('Message sent:', message);
    return { success: true };
  },
};
