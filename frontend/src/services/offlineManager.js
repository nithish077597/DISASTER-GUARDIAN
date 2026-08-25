const QUEUE_KEY = 'disaster_offline_report_queue';

export const offlineManager = {
  getPendingReports: () => {
    try {
      const data = localStorage.getItem(QUEUE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  enqueueReport: (report) => {
    const pending = offlineManager.getPendingReports();
    pending.push({ ...report, queuedAt: new Date().toISOString() });
    localStorage.setItem(QUEUE_KEY, JSON.stringify(pending));
  },

  clearQueue: () => {
    localStorage.removeItem(QUEUE_KEY);
  },

  syncPending: async (submitFn) => {
    const pending = offlineManager.getPendingReports();
    if (pending.length === 0) return 0;

    let synced = 0;
    for (const report of pending) {
      try {
        await submitFn(report);
        synced++;
      } catch {
        // Keep in queue
      }
    }
    offlineManager.clearQueue();
    return synced;
  },
};
