import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Logger Interceptor (Dev Mode Only)
if (import.meta.env.DEV) {
  apiClient.interceptors.request.use((config) => {
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, config.data || '');
    return config;
  });
}

/**
 * Universal Error Handler
 */
const handleError = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.detail || error.message || 'An unexpected error occurred';
    throw new Error(message);
  }
  throw error;
};

export const api = {
  // --- SCHEMA ENDPOINTS ---

  async uploadSchema(file: File): Promise<{ name: string; tables: string[] }> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const name = file.name.split('.')[0] + "_" + Date.now();
      const response = await apiClient.post(`/schema/upload?name=${name}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },

  async pasteSchema(text: string, name: string): Promise<{ name: string; tables: string[] }> {
    try {
      const response = await apiClient.post('/schema/paste', { name, text });
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },

  async fetchSchemaTables(name: string): Promise<{ tables: string[]; columns: Record<string, string[]> }> {
    try {
      const response = await apiClient.get(`/schema/tables/${name}`);
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },

  async fetchSchemaRelationships(name: string): Promise<{ foreign_keys: any[] }> {
    try {
      const response = await apiClient.get(`/schema/relationships/${name}`);
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },

  // --- QUERY ENDPOINTS ---

  async generateSQL(question: string, schemaName: string): Promise<{ sql: string; tables_used: string[] }> {
    try {
      const response = await apiClient.post('/query/generate', { question, schema_name: schemaName });
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },

  async validateSQL(sql: string, schemaName: string): Promise<{ valid: boolean; error: string | null }> {
    try {
      const response = await apiClient.post('/query/validate', { sql, schema_name: schemaName });
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },

  async executeSQL(sql: string, schemaName: string): Promise<{ columns: string[]; rows: any[]; total: number; error?: string }> {
    try {
      const response = await apiClient.post('/query/execute', { sql, schema_name: schemaName });
      // Backend returns 'count' instead of 'total', mapping it here
      const data = response.data;
      return {
        ...data,
        total: data.count || 0
      };
    } catch (error) {
      return handleError(error);
    }
  },

  async explainSQL(sql: string, schemaName: string): Promise<{ explanation: string }> {
    try {
      const response = await apiClient.post('/query/explain', { sql, schema_name: schemaName });
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },

  async getQueryCost(sql: string, schemaName: string): Promise<{ cost: "LOW" | "MEDIUM" | "HIGH" }> {
    try {
      const response = await apiClient.post('/query/cost', { sql, schema_name: schemaName });
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  }
};
