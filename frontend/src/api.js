import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err.response?.data?.error ||
      err.message ||
      'Unable to reach the Guardian server.';
    return Promise.reject(new Error(message));
  }
);

export const healthCheck = () => api.get('/health');
export const isSystemOperational = async () => {
  try {
    const res = await healthCheck();
    return res.data?.status === 'ok';
  } catch {
    return false;
  }
};

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
  create: (payload) => api.post('/api/alerts', payload).then((r) => r.data),
};

export const usersApi = {
  list: () => api.get('/api/users').then((r) => r.data),
  login: (payload) => api.post('/api/users/login', payload).then((r) => r.data),
  updateLocation: (payload) => api.put('/api/users/location', payload).then((r) => r.data),
  get: (id) => api.get(`/api/users/${id}`).then((r) => r.data),
  logout: (id) => api.delete(`/api/users/${id}`).then((r) => r.data),
};

export const gatewayApi = {
  health: () =>
    axios
      .get(`${import.meta.env.VITE_GATEWAY_URL || 'http://localhost:6000'}/health`)
      .then((r) => r.data),
  trigger: (payload) =>
    axios
      .post(`${import.meta.env.VITE_GATEWAY_URL || 'http://localhost:6000'}/gateway/trigger`, payload, { timeout: 5000 })
      .then((r) => r.data),
};

export const weatherApi = {
  getForecast: async (lat = 28.6139, lng = 77.2090) => {
    try {
      const url = `https://api.open-meteo.com/api/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,weather_code&hourly=precipitation,temperature_2m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto`;
      const res = await axios.get(url);
      return res.data;
    } catch (err) {
      console.error('Weather API fetch error:', err);
      // Fallback mock telemetry if offline
      return {
        current: {
          temperature_2m: 29.4,
          relative_humidity_2m: 88,
          precipitation: 68.5,
          wind_speed_10m: 34.2,
          weather_code: 63,
        },
        hourly: {
          time: Array.from({ length: 24 }, (_, i) => `${i}:00`),
          precipitation: [2, 4, 8, 14, 25, 42, 68, 55, 30, 18, 10, 5, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          temperature_2m: [26, 26, 25, 25, 26, 27, 28, 29, 30, 31, 30, 29, 28, 28, 27, 27, 26, 26, 25, 25, 25, 25, 25, 25],
        },
        daily: {
          time: ['Today', 'Tomorrow', 'Day 3', 'Day 4', 'Day 5'],
          precipitation_sum: [68.5, 25.0, 5.2, 0.0, 1.2],
          temperature_2m_max: [31, 30, 32, 33, 34],
          temperature_2m_min: [25, 24, 25, 26, 26],
          weather_code: [63, 61, 3, 1, 2],
        },
      };
    }
  },
};

export default api;
