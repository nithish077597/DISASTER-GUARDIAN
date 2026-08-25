import express from 'express';
import { getDb, persist } from '../config/db.js';
import { sendAlert } from '../services/alertService.js';
import { CATEGORY_CHANNELS, normalizeCategory } from '../services/emergencyService.js';

const router = express.Router();

const INSTRUCTIONS = {
  FLOOD: {
    DO: ['Move to higher ground immediately', 'Avoid walking or driving through flood waters', 'Listen to emergency broadcasts'],
    DONT: ['Do not walk through moving water', 'Do not touch electrical equipment if wet', 'Do not stay in low-lying areas'],
  },
  LANDSLIDE: {
    DO: ['Move away from the slide path quickly', 'Listen for unusual sounds', 'Evacuate if directed'],
    DONT: ['Do not stay near steep slopes', 'Do not re-enter damaged buildings', 'Do not ignore evacuation orders'],
  },
};

const rowToObj = (cols, row) => Object.fromEntries(cols.map((c, i) => [c, row[i]]));

router.post('/send/:reportId', async (req, res) => {
  const db = await getDb();
  const result = db.exec(`SELECT * FROM reports WHERE id = ${req.params.reportId}`);
  const cols = result[0]?.columns;
  const row = result[0]?.values[0];
  const report = row ? rowToObj(cols, row) : null;
  if (!report) return res.status(404).json({ error: 'Report not found' });

  // Category escalation ladder:
  // NORMAL -> notification | HIGH -> +offline SMS | RISK -> +voice message
  // CRITICAL -> all (notification, SMS, voicemail, call, gateway siren)
  const category = normalizeCategory(report.severity);
  const channels = CATEGORY_CHANNELS[category] || ['APP'];

  const instr = INSTRUCTIONS[report.disaster_type] || { DO: [], DONT: [] };
  const message = `DISASTER ALERT [${category}] - ${report.disaster_type} near (${report.lat}, ${report.lng}). DO: ${instr.DO.join(', ')}. DON'T: ${instr.DONT.join(', ')}.`;

  const sentAt = new Date().toISOString();
  const alertResult = await sendAlert(channels, report, message);

  const channelsJson = JSON.stringify(channels).replace(/'/g, "''");
  db.run(`INSERT INTO alerts (report_id, severity, channels, message, sent_at) VALUES (${report.id}, '${category.replace(/'/g, "''")}', '${channelsJson}', '${message.replace(/'/g, "''")}', '${sentAt.replace(/'/g, "''")}')`);
  persist();

  const lastIdResult = db.exec('SELECT last_insert_rowid() as id');
  const alertId = lastIdResult[0]?.values[0]?.[0] || 0;

  res.json({
    alert_id: alertId,
    report_id: report.id,
    severity: report.severity,
    category,
    channels,
    message,
    sent_at: sentAt,
    ...alertResult,
  });
});

router.get('/', async (req, res) => {
  const db = await getDb();
  const result = db.exec('SELECT * FROM alerts ORDER BY sent_at DESC');
  const cols = result[0]?.columns;
  const alerts = (result[0]?.values || []).map(row => rowToObj(cols, row));
  res.json(alerts);
});

router.post('/', async (req, res) => {
  const db = await getDb();
  const { report_id, severity, channels, message } = req.body;
  if (!severity || !message) {
    return res.status(400).json({ error: 'severity and message are required' });
  }

  const reportId = report_id || 0;
  const channelList = channels && Array.isArray(channels) ? channels : ['APP'];
  const sentAt = new Date().toISOString();
  const channelsJson = JSON.stringify(channelList).replace(/'/g, "''");
  const msgEscaped = message.replace(/'/g, "''");
  const sevEscaped = severity.replace(/'/g, "''");

  db.run(`INSERT INTO alerts (report_id, severity, channels, message, sent_at) VALUES (${reportId}, '${sevEscaped}', '${channelsJson}', '${msgEscaped}', '${sentAt}')`);
  persist();

  const lastIdResult = db.exec('SELECT last_insert_rowid() as id');
  const alertId = lastIdResult[0]?.values[0]?.[0] || 0;

  res.status(201).json({
    id: alertId,
    report_id: reportId,
    severity,
    channels: channelList,
    message,
    sent_at: sentAt,
  });
});

export default router;
