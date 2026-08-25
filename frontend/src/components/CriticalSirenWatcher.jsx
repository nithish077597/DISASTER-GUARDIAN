import { useEffect, useRef } from 'react';
import { useRealtime } from '../context/RealtimeContext';
import { alertSoundService } from '../services/alertSoundService';

/* =====================================================
   SOFTWARE SIREN WATCHER
   Activates ONLY when an emergency message reaches the
   CRITICAL stage: loops the siren tone and opens the
   Critical Emergency Alert modal. Any other category
   (NORMAL / HIGH / RISK) never triggers it. Siren stops
   as soon as the critical modal is dismissed.
===================================================== */
export default function CriticalSirenWatcher() {
  const { emergencyMessages, criticalModalOpen, setCriticalModalOpen } = useRealtime();
  const sirenIntervalRef = useRef(null);
  const handledIdsRef = useRef(new Set());

  const stopSiren = () => {
    if (sirenIntervalRef.current) {
      clearInterval(sirenIntervalRef.current);
      sirenIntervalRef.current = null;
    }
    try {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    } catch {
      // ignore
    }
  };

  // Watch for new CRITICAL-stage messages only
  useEffect(() => {
    const criticalMsg = emergencyMessages.find(
      (m) => String(m.category).toUpperCase() === 'CRITICAL' && !handledIdsRef.current.has(m.id)
    );

    if (criticalMsg) {
      handledIdsRef.current.add(criticalMsg.id);
      setCriticalModalOpen(true);

      stopSiren();
      alertSoundService.playAlertSiren();
      sirenIntervalRef.current = setInterval(() => alertSoundService.playAlertSiren(), 2200);
    }
  }, [emergencyMessages, setCriticalModalOpen]);

  // Stop the siren whenever the critical modal is dismissed
  useEffect(() => {
    if (!criticalModalOpen) stopSiren();
  }, [criticalModalOpen]);

  useEffect(() => stopSiren, []);

  return null;
}
