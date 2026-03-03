import axios from 'axios';

/**
 * Instância do Axios configurada.
 * O proxy do Vite redireciona /api para o backend.
 */
const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor: adiciona token JWT em toda requisição
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('@finance:token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor: redireciona para login em caso de 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('@finance:token');
      localStorage.removeItem('@finance:user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export { api };
