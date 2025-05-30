// API configuration for different environments
const API_CONFIG = {
  development: 'http://localhost:3000',
  production: 'https://personal-task-manager-backend.onrender.com' // This will be your Render backend URL
};

// Get the current environment
const environment = import.meta.env.MODE || 'development';

// Export the base URL for the current environment
export const API_BASE_URL = API_CONFIG[environment];

// Helper function to create full API URLs
export const createApiUrl = (endpoint) => {
  return `${API_BASE_URL}${endpoint}`;
};

// Common API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register'
  },
  TASKS: {
    BASE: '/tasks',
    BY_ID: (id) => `/tasks/${id}`
  }
}; 