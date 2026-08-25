import { getDisasterPhoto } from './photoLibrary';

export const DISASTER_TYPES = [
  { id: 'FLOOD', label: 'Flood', color: 'cyan' },
  { id: 'CYCLONE', label: 'Cyclone', color: 'blue' },
  { id: 'EARTHQUAKE', label: 'Earthquake', color: 'amber' },
  { id: 'LANDSLIDE', label: 'Landslide', color: 'red' },
  { id: 'FIRE', label: 'Fire', color: 'rose' },
  { id: 'TSUNAMI', label: 'Tsunami', color: 'cyan' },
  { id: 'EXTREME_HEAT', label: 'Extreme Heat', color: 'orange' },
  { id: 'LIGHTNING', label: 'Lightning', color: 'purple' },
  { id: 'INDUSTRIAL', label: 'Industrial Accident', color: 'slate' },
].map((t) => ({ ...t, photo: getDisasterPhoto(t.id).url, photoAlt: getDisasterPhoto(t.id).alt }));

export const alertService = {
  getDisasterTypes() {
    return DISASTER_TYPES;
  },

  calculateDistanceKm(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return parseFloat((R * c).toFixed(1));
  },
};
