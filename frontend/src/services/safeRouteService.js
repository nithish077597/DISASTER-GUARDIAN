export const safeRouteService = {
  getRecommendedShelter: (shelters) => {
    // Capacity aware shelter recommendation bypassing full shelters
    const openShelters = shelters.filter((s) => s.status === 'OPEN');
    if (openShelters.length > 0) {
      return openShelters[0];
    }
    return shelters[0] || { name: 'Government Relief Centre', lat: 28.625, lng: 77.215, distance_km: 2.4 };
  },

  getGoogleMapsDirectionsUrl: (originLat = 28.618, originLng = 77.208, destLat = 28.625, destLng = 77.215) => {
    return `https://www.google.com/maps/dir/${originLat},${originLng}/${destLat},${destLng}/@${destLat},${destLng},14z`;
  },

  openSafeNavigation: (originLat = 28.618, originLng = 77.208, destLat = 28.625, destLng = 77.215) => {
    const url = safeRouteService.getGoogleMapsDirectionsUrl(originLat, originLng, destLat, destLng);
    window.open(url, '_blank');
  },
};
