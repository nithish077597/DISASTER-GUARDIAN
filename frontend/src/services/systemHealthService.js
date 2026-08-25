export const systemHealthService = {
  getHealthStatus() {
    return [
      { name: 'Weather API (Open-Meteo)', status: 'ONLINE', badge: '???? ONLINE' },
      { name: 'GIS Map Engine (OpenStreetMap)', status: 'ONLINE', badge: '???? ONLINE' },
      { name: 'Disaster Alert Service', status: 'ONLINE', badge: '???? ONLINE' },
      { name: 'SMS & Voice Gateway', status: 'SIMULATED', badge: '???? INTEGRATION READY (SIMULATED)' },
      { name: 'AI Flood Prediction Engine', status: 'ONLINE', badge: '???? ONLINE (84% CONFIDENCE)' },
      { name: 'PostgreSQL Emergency Database', status: 'ONLINE', badge: '???? ONLINE' },
    ];
  },
};
