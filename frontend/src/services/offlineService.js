import { offlineManager } from './offlineManager';

export const offlineService = {
  isOnline() {
    return navigator.onLine;
  },

  enqueueReport(report) {
    return offlineManager.saveReportLocally(report);
  },

  getQueuedReports() {
    return offlineManager.getOfflineReports();
  },

  clearQueue() {
    offlineManager.clearOfflineReports();
  },
};
