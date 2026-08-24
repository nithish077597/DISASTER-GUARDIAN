import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const REMOTE_ZONES = [
  { id: 'gz1', name: 'Remote Village Alpha', lat: 28.72, lng: 77.05 },
  { id: 'gz2', name: 'Remote Village Beta', lat: 28.58, lng: 77.28 },
];

const isRemoteZone = (lat, lng) => {
  return REMOTE_ZONES.some(z => {
    const R = 6371;
    const dLat = ((z.lat - lat) * Math.PI) / 180;
    const dLon = ((z.lng - lng) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat * Math.PI / 180) * Math.cos(z.lat * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
    const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return dist <= 5;
  });
};

app.get('/health', (req, res) => res.json({ status: 'ok', zones: REMOTE_ZONES }));

app.post('/gateway/trigger', (req, res) => {
  const { report_id, disaster_type, severity, lat, lng, message } = req.body;
  const remote = isRemoteZone(lat, lng);
  if (!remote) {
    return res.json({ status: 'skipped', reason: 'Not a remote zone' });
  }

  console.log('='.repeat(60));
  console.log(`[GATEWAY TRIGGER] ${new Date().toISOString()}`);
  console.log(`Zone: Remote (ESP32/Pi simulation)`);
  console.log(`Report: ${report_id} | ${disaster_type} | ${severity}`);
  console.log(`Location: ${lat}, ${lng}`);
  console.log(`Message: ${message}`);
  console.log(`[HARDWARE ACTION] Playing siren + voice warning on ESP32/Pi speaker`);
  console.log('='.repeat(60));

  res.json({ status: 'triggered', gateway_id: 'esp32_primary', zone: 'remote', action: 'siren_voice_played' });
});

const PORT = process.env.PORT || 6000;
app.listen(PORT, () => console.log(`Gateway running on http://localhost:${PORT}`));
