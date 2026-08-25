export const buildAlertMessage = (report, severity) => {
  const disasterLabel = report.disaster_type || 'Unknown Disaster';
  const riskLevel = severity || report.severity || 'LOW_CONFIDENCE';
  const issue = report.description || 'No details provided';
  const time = report.timestamp ? new Date(report.timestamp).toLocaleString() : new Date().toLocaleString();
  const location = `(${report.lat}, ${report.lng})`;

  return `DISASTER ALERT [${riskLevel}] ??? ${disasterLabel} at ${location}. Issue: ${issue}. Time: ${time}. Immediate action required.`;
};

export const formatAlertForVoice = (message) => {
  return message.replace(/DISASTER ALERT \[([^\]]+)\]/, 'Emergency Alert, $1').replace(/\. /g, '. ');
};

export const formatAlertForSMS = (message) => {
  return message;
};
