import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('plantsense_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 — auto logout
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('plantsense_token');
      localStorage.removeItem('plantsense_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ==================== AUTH ====================
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data)
};

// ==================== PLANTS ====================
export const plantAPI = {
  identify: (formData) => api.post('/plants/identify', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000
  }),
  reidentify: (id, formData) => api.post(`/plants/reidentify/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000
  }),
  getLibrary: () => api.get('/plants/library'),
  addToLibrary: (data) => api.post('/plants/library', data),
  getHistory: () => api.get('/plants/history'),
  getPlant: (id) => api.get(`/plants/${id}`),
  removePlant: (id) => api.delete(`/plants/${id}`)
};

// ==================== DIAGNOSIS ====================
export const diagnosisAPI = {
  analyze: (formData) => api.post('/diagnosis/analyze', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000
  }),
  rediagnose: (plantId, formData) => api.post(`/diagnosis/rediagnose/${plantId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000
  }),
  getPlantDiagnoses: (plantId) => api.get(`/diagnosis/plant/${plantId}`),
  getAllDiagnoses: () => api.get('/diagnosis/history'),
  getDiagnosis: (id) => api.get(`/diagnosis/${id}`),
  saveDiagnosis: (id) => api.put(`/diagnosis/${id}/save`),
  shareDiagnosis: (id) => api.get(`/diagnosis/${id}/share`)
};

export default api;
