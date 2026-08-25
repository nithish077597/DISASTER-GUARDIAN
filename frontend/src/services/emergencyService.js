export const emergencyService = {
  formatEmergencyMessage(userLocation, lat = 28.618, lng = 77.208, disasterType = 'LANDSLIDE') {
    const timestamp = new Date().toLocaleString();
    return `???? EMERGENCY SOS ALERT!\nLocation: ${userLocation} (${lat}, ${lng})\nDisaster: ${disasterType}\nTime: ${timestamp}\nUser needs immediate assistance. Please send emergency rescue team.`;
  },

  getEmergencyContacts() {
    return [
      { name: 'National Emergency Response Helpline', number: '112', type: 'PRIMARY' },
      { name: 'NDRF Disaster Control Room', number: '1078', type: 'DISASTER' },
      { name: 'State Disaster Management Authority', number: '1070', type: 'GOVT' },
      { name: 'Fire & Rescue Services', number: '101', type: 'RESCUE' },
      { name: 'Ambulance Medical Services', number: '108', type: 'MEDICAL' },
    ];
  },
};
