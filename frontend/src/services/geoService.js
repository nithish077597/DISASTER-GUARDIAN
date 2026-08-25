import axios from 'axios';

export const geoService = {
  requestPosition: () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser.'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          resolve({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          });
        },
        (err) => {
          reject(err);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
      );
    });
  },

  reverseGeocode: async (lat, lng) => {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14`;
      const response = await axios.get(url, { headers: { 'User-Agent': 'DisasterManagementAI/1.0' } });
      if (response.data && response.data.display_name) {
        const parts = response.data.display_name.split(',');
        const mainName = parts[0]?.trim();
        const subName = parts[1]?.trim() || parts[2]?.trim() || '';
        return `${mainName}${subName ? `, ${subName}` : ''}`;
      }
    } catch {
      // Fallback reverse geocoding for offline / demo mode
    }
    // Default location string if geocoding service is offline or rate limited
    return 'Sulur, Coimbatore';
  },
};
