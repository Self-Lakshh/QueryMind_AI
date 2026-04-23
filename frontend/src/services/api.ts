import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1';

export const api = {
  // Schema Endpoints
  uploadSchema: async (name: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axios.post(`${API_BASE_URL}/schema/upload?name=${name}`, formData);
    return response.data;
  },

  pasteSchema: async (name: string, text: string) => {
    const response = await axios.post(`${API_BASE_URL}/schema/paste`, { name, text });
    return response.data;
  },

  listSchemas: async () => {
    const response = await axios.get(`${API_BASE_URL}/schema/list`);
    return response.data;
  },

  // Query Endpoints
  generateSQL: async (question: string, schemaName: string) => {
    const response = await axios.post(`${API_BASE_URL}/query/generate`, { question, schema_name: schemaName });
    return response.data;
  },

  validateSQL: async (sql: string, schemaName: string) => {
    const response = await axios.post(`${API_BASE_URL}/query/validate`, { sql, schema_name: schemaName });
    return response.data;
  },

  executeSQL: async (sql: string, schemaName: string) => {
    const response = await axios.post(`${API_BASE_URL}/query/execute`, { sql, schema_name: schemaName });
    return response.data;
  },

  explainSQL: async (sql: string, schemaName: string) => {
    const response = await axios.post(`${API_BASE_URL}/query/explain`, { sql, schema_name: schemaName });
    return response.data;
  }
};
