import { useApi, usePolling, useGeolocation as _useGeolocation } from './useApi';
import { healthCheck, reportsApi, alertsApi } from '../api';

export const useSystemStatus = () => useApi(healthCheck, []);
export const useReports = () => usePolling(reportsApi.list, 8000);
export const useAlerts = () => usePolling(alertsApi.list, 10000);
export const useReport = (id) => useApi(() => reportsApi.get(id), [id]);
export const useGeolocation = _useGeolocation;

export { useApi, usePolling };
