export const alertSoundService = {
  playAlertSiren: () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      
      // Dual-frequency siren pulse modulation (800Hz to 1000Hz)
      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.5);
      osc.frequency.exponentialRampToValueAtTime(800, now + 1.0);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 1.5);
      osc.frequency.exponentialRampToValueAtTime(800, now + 2.0);

      // Volume envelope (2 seconds duration)
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 2.0);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 2.0);
    } catch {
      // AudioContext fallback
    }
  },
};
