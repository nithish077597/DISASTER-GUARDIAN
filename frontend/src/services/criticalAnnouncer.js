// Critical News & Alert Voice Announcer
// Speaks critical emergency messages aloud using Web Speech Synthesis,
// with multilingual support matching the app's voice languages.

const LANG_CODES = {
  English: 'en-US',
  Tamil: 'ta-IN',
  Hindi: 'hi-IN',
  Telugu: 'te-IN',
  Kannada: 'kn-IN',
  Malayalam: 'ml-IN',
};

const OPENERS = {
  English: 'Critical alert.',
  Tamil: 'அவசர எச்சரிக்கை.',
  Hindi: 'आपातकालीन चेतावनी।',
};

let muted = false;

try {
  muted = localStorage.getItem('dg_critical_announcer_muted') === 'true';
} catch {}

export const criticalAnnouncer = {
  isMuted: () => muted,

  setMuted(value) {
    muted = !!value;
    try {
      localStorage.setItem('dg_critical_announcer_muted', String(muted));
    } catch {}
    if (muted && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  },

  /** Speak any text in the given voice language. */
  speak(text, language = 'English') {
    if (muted || !text || !('speechSynthesis' in window)) return;
    // Cancel only pending announcements, keep it short & non-blocking
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = LANG_CODES[language] || 'en-US';
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Prefer a natural voice for the chosen language if available
    const voices = window.speechSynthesis.getVoices();
    const match = voices.find((v) => v.lang === utterance.lang);
    if (match) utterance.voice = match;

    window.speechSynthesis.speak(utterance);
    return utterance;
  },

  stop() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  },

  /**
   * Announce a critical news item aloud.
   * item: { category, disaster_type, description, location_name?, timestamp }
   */
  announceCriticalNews(item, locationName = '', language = 'English') {
    const type = (item.disaster_type || 'emergency').replace(/_/g, ' ').toLowerCase();
    const where = item.location_name || locationName || 'your area';
    const detail = item.description ? ` ${item.description}` : '';
    const opener = OPENERS[language] || OPENERS.English;
    this.speak(`${opener} ${type} reported near ${where}.${detail}`, language);
  },
};
