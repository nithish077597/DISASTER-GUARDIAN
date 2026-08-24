import { getDb, persist } from '../config/db.js';
import { sendAlert } from './alertService.js';
import { buildAlertMessage, formatAlertForVoice } from './messageFormatter.js';

export const escalateAlert = async (alertId, alert, report) => {
  const db = await getDb();
  
  const escalationResult = db.exec(`SELECT * FROM alert_escalations WHERE alert_id = ${alertId} ORDER BY triggered_at DESC`);
  const currentEscalation = escalationResult[0]?.values[0];
  const currentLevel = currentEscalation ? currentEscalation[3] : 0;

  const higherMembers = db.exec(`SELECT * FROM team_members WHERE escalation_level > ${currentLevel} AND is_active = 1 ORDER BY escalation_level ASC LIMIT 5`);
  const memberCols = higherMembers[0]?.columns;
  const members = (higherMembers[0]?.values || []).map(row => {
    const obj = Object.fromEntries(memberCols.map((c, i) => [c, row[i]]));
    return obj;
  });

  if (members.length === 0) {
    return { escalated: false, reason: 'No higher-level team members available' };
  }

  const newLevel = Math.max(...members.map(m => m.escalation_level));
  const message = buildAlertMessage(report, alert.severity);
  const voiceMessage = formatAlertForVoice(message);
  const escalationMessage = `ESCALATION: ${message}`;
  const escalationVoiceMessage = formatAlertForVoice(escalationMessage);

  const channels = ['VOICE', 'SMS', 'PUSH'];
  const voiceChannels = ['VOICE'];
  const smsChannels = ['SMS'];
  const pushChannels = ['PUSH'];

  const result = await sendAlert(channels, report, escalationMessage, members);
  await sendAlert(voiceChannels, report, escalationVoiceMessage, members);

  const now = new Date().toISOString();
  db.run(`INSERT INTO alert_escalations (alert_id, from_level, to_level, triggered_at, reason) VALUES (${alertId}, ${currentLevel}, ${newLevel}, '${now}', 'Not acknowledged within escalation window')`);
  persist();

  return { escalated: true, to_level: newLevel, members_notified: members.length, result };
};

export const checkPendingEscalations = async () => {
  const db = await getDb();
  
  const alertsResult = db.exec(`SELECT * FROM alerts ORDER BY sent_at DESC LIMIT 50`);
  const alertCols = alertsResult[0]?.columns;
  const alerts = (alertsResult[0]?.values || []).map(row => Object.fromEntries(alertCols.map((c, i) => [c, row[i]])));

  const escalated = [];
  for (const alert of alerts) {
    if (alert.severity !== 'CRITICAL' && alert.severity !== 'HIGH_RISK') continue;

    const ruleResult = db.exec(`SELECT * FROM alert_rules WHERE severity = '${alert.severity.replace(/'/g, "''")}' AND is_active = 1 LIMIT 1`);
    if (!ruleResult[0]?.values[0]) continue;

    const ruleCols = ruleResult[0]?.columns;
    const rule = Object.fromEntries(ruleCols.map((c, i) => [c, ruleResult[0].values[0][i]]));
    const delayMinutes = rule.escalation_delay_minutes || 15;
    const sentAt = new Date(alert.sent_at);
    const now = new Date();
    const elapsedMinutes = (now - sentAt) / 60000;

    if (elapsedMinutes < delayMinutes) continue;

    const ackResult = db.exec(`SELECT COUNT(*) as count FROM alert_acknowledgments WHERE alert_id = ${alert.id}`);
    const ackCount = ackResult[0]?.values[0]?.[0] || 0;

    if (ackCount === 0) {
      const reportResult = db.exec(`SELECT * FROM reports WHERE id = ${alert.report_id}`);
      const reportCols = reportResult[0]?.columns;
      const reportRow = reportResult[0]?.values[0];
      const report = reportRow ? Object.fromEntries(reportCols.map((c, i) => [c, reportRow[i]])) : null;

      if (report) {
        const escalationResult = await escalateAlert(alert.id, alert, report);
        escalated.push({ alert_id: alert.id, ...escalationResult });
      }
    }
  }

  return escalated;
};
