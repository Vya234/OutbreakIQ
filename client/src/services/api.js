import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 60000,
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err.response?.data?.message || err.message || 'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

export const outbreakApi = {
  list: (params) => api.get('/outbreaks', { params }).then((r) => r.data),
  get: (id) => api.get(`/outbreaks/${id}`).then((r) => r.data),
  create: (data) => api.post('/outbreaks', data).then((r) => r.data),
  update: (id, data) => api.put(`/outbreaks/${id}`, data).then((r) => r.data),
  remove: (id) => api.delete(`/outbreaks/${id}`).then((r) => r.data),
  stats: () => api.get('/outbreaks/stats').then((r) => r.data),
  downloadPdf: (params) =>
    api.get('/outbreaks/report/pdf', { params, responseType: 'blob' }),
};

export const aiApi = {
  chat: (message, outbreakId) =>
    api.post('/ai/chat', { message, outbreakId }).then((r) => r.data),
  recommendations: (payload) =>
    api.post('/ai/recommendations', payload).then((r) => r.data),
};

export default api;
