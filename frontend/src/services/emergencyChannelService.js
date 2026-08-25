import { notificationService } from './notificationService';
import { offlineManager } from './offlineManager';
import { alertSoundService } from './alertSoundService';

/* =====================================================
   CATEGORY ESCALATION LADDER
   NORMAL   : app notification only
   HIGH     : app notification + SMS (queued offline when network is down)
   RISK     : app notification + SMS + voice message (speech synthesis)
   CRITICAL : app notification + SMS + voicemail + emergency call simulation
===================================================== */

const SMS_QUEUE_KEY = 'dg_offline_sms_queue';

const smsQueue = {
  all: () => {
    try {
      return JSON.parse(localStorage.getItem(SMS_QUEUE_KEY)) || [];
    } catch {
      return [];
    }
  },
  enqueue: (sms) => {
    const queue = smsQueue.all();
    queue.push({ ...sms, queuedAt: new Date().toISOString() });
    localStorage.setItem(SMS_QUEUE_KEY, JSON.stringify(queue));
    return queue.length;
  },
};

const speak = (text) => {
  if (!('speechSynthesis' in window)) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-IN';
  utterance.rate = 0.95;
  window.speechSynthesis.speak(utterance);
};

export const emergencyChannelService = {
  CATEGORY_META: {
    NORMAL: { label: 'NORMAL', color: 'sky', channels: ['notification'] },
    HIGH: { label: 'HIGH', color: 'amber', channels: ['notification', 'sms'] },
    RISK: { label: 'RISK', color: 'orange', channels: ['notification', 'sms', 'voice'] },
    CRITICAL: { label: 'CRITICAL', color: 'red', channels: ['notification', 'sms', 'voicemail', 'call'] },
  },

  /* Dispatch an emergency message through the right channel ladder */
  dispatch: ({ category = 'NORMAL', title, message, mobile = null, locationName = '' }) => {
    const meta = emergencyChannelService.CATEGORY_META[String(category).toUpperCase()] ||
      emergencyChannelService.CATEGORY_META.NORMAL;
    const delivered = [];

    // 1. APP NOTIFICATION — always sent for every category
    notificationService.sendTargetedAlert(
      `[${meta.label}] ${title}`,
      message
    );
    delivered.push('NOTIFICATION');

    const needsSms = ['HIGH', 'RISK', 'CRITICAL'].includes(meta.label);

    // 2. SMS — HIGH and above; queues offline when there is no network
    if (needsSms) {
      const smsPayload = { to: mobile || 'registered-citizens', body: `[${meta.label}] ${message}` };
      if (!navigator.onLine) {
        smsQueue.enqueue(smsPayload);
        delivered.push('SMS (OFFLINE QUEUED)');
      } else {
        console.log(`[SMS SENT] To: ${smsPayload.to} | ${smsPayload.body}`);
        delivered.push('SMS');
      }
    }

    // 3. VOICE MESSAGE — RISK and above
    if (['RISK', 'CRITICAL'].includes(meta.label)) {
      speak(`Emergency ${meta.label} alert. ${message}`);
      delivered.push('VOICE MESSAGE');
    }

    // 4. VOICEMAIL + EMERGENCY CALL — CRITICAL only
    if (meta.label === 'CRITICAL') {
      console.log(`[VOICE MAIL LEFT] To: ${mobile || 'registered-citizens'} | ${message}`);
      delivered.push('VOICE MAIL');
      setTimeout(() => {
        alertSoundService.playAlertSiren();
        speak('This is an automated emergency call. Evacuate to the nearest safe shelter immediately.');
      }, 1200);
      delivered.push('EMERGENCY CALL');
    }

    return { category: meta.label, channelsDelivered: delivered };
  },
};
