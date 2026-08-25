import { healthCheck, reportsApi, alertsApi, gatewayApi } from '../api';
import { useApi, usePolling } from './useApi';

export const useSystemStatus = () => useApi(healthCheck, []);
export const useReports = () => usePolling(reportsApi.list, 8000);
export const useReport = (id) => useApi(() => reportsApi.get(id), [id]);
export const useAlerts = () => usePolling(alertsApi.list, 10000);
export const useGatewayHealth = () => usePolling(gatewayApi.health, 5000);

export { useApi, usePolling };
