import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add CSRF token
api.interceptors.request.use((config) => {
  const csrfToken = document.cookie
    .split('; ')
    .find((row) => row.startsWith('XSRF-TOKEN='))
    ?.split('=')[1];

  if (csrfToken) {
    config.headers['X-CSRF-Token'] = csrfToken;
  }

  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Don't auto-redirect on 401 - let components handle auth errors
    // The auth check (/api/auth/me) and public pages should handle 401 gracefully
    return Promise.reject(error);
  }
);

export default api;
