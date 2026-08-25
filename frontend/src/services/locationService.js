import { geoService } from './geoService';

export const locationService = {
  async getCurrentPosition() {
    return await geoService.requestPosition();
  },

  async reverseGeocode(lat, lng) {
    return await geoService.reverseGeocode(lat, lng);
  },
};
