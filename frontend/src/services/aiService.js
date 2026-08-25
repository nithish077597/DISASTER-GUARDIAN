const AI_API_KEY = import.meta.env.VITE_AI_API_KEY || '';

export const aiService = {
  async processVoiceQuery(queryText, userLocation = 'Sulur, Tamil Nadu', riskScore = 91) {
    const text = queryText.toLowerCase();

    if (text.includes('safe') || text.includes('???????????????????????????') || text.includes('????????????????????????')) {
      return {
        reply: riskScore >= 80
          ? 'Warning! High landslide risk detected near your area. Please move to higher ground immediately.'
          : 'Your current location is outside the active critical danger zone. Stay alert and monitor official updates.',
        intent: 'SAFETY_CHECK',
      };
    }

    if (text.includes('shelter') || text.includes('????????????????????????') || text.includes('?????????')) {
      return {
        reply: 'The nearest safe shelter is Central Relief Camp located 2.4 km away. Route is open via NH-707.',
        intent: 'FIND_SHELTER',
      };
    }

    if (text.includes('route') || text.includes('?????????') || text.includes('??????????????????')) {
      return {
        reply: 'Safe evacuation route activated. Avoiding blocked Village Access Road B. Take National Highway NH-707.',
        intent: 'GET_ROUTE',
      };
    }

    return {
      reply: 'Guardian Emergency Assistant active. I can help you check your safety, find shelters, get evacuation routes, or call emergency helpline 112.',
      intent: 'GENERAL_ASSISTANCE',
    };
  },
};
