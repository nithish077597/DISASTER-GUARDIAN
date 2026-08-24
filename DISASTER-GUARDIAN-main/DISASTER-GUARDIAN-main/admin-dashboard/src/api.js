import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const GW = import.meta.env.VITE_GATEWAY_URL || 'http://localhost:6000';

const api = axios.create({ baseURL: BASE, timeout: 15000, headers: { 'Content-Type': 'application/json' } });
api.interceptors.response.use(
  (res) => res,
  (err) => Promise.reject(new Error(err.response?.data?.error || err.message || 'Unable to reach the Guardian server.'))
);

export const healthCheck = () => api.get('/health').then((r) => r.data);
export const isSystemOperational = async () => { try { const r = await healthCheck(); return r?.status === 'ok'; } catch { return false; } };

export const reportsApi = {
  list: () => api.get('/api/reports').then((r) => r.data),
  get: (id) => api.get(`/api/reports/${id}`).then((r) => r.data),
  create: (payload) => api.post('/api/reports', payload).then((r) => r.data),
  update: (id, payload) => api.patch(`/api/reports/${id}`, payload).then((r) => r.data),
};
export const verificationApi = {
  score: (id) => api.post(`/api/verification/${id}/score`).then((r) => r.data),
  list: () => api.get('/api/verification').then((r) => r.data),
};
export const geoApi = {
  dangerZone: (reportId) => api.get(`/api/geo/danger-zone/${reportId}`).then((r) => r.data),
  safeLocations: (reportId) => api.get(`/api/geo/safe-locations/${reportId}`).then((r) => r.data),
  usersAtRisk: (reportId) => api.get(`/api/geo/users-at-risk/${reportId}`).then((r) => r.data),
};
export const alertsApi = {
  send: (reportId) => api.post(`/api/alerts/send/${reportId}`).then((r) => r.data),
  list: () => api.get('/api/alerts').then((r) => r.data),
};
export const usersApi = {
  list: () => api.get('/api/users').then((r) => r.data),
  get: (id) => api.get(`/api/users/${id}`).then((r) => r.data),
};
export const gatewayApi = {
  health: () => axios.get(`${GW}/health`).then((r) => r.data),
  trigger: (payload) => axios.post(`${GW}/gateway/trigger`, payload, { timeout: 5000 }).then((r) => r.data),
};

export default api;
