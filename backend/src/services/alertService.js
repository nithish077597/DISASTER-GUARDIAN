import axios from 'axios';

const GATEWAY_URL = process.env.GATEWAY_URL || 'http://localhost:6000';

export const sendAlert = async (channels, report, message) => {
  const result = { sms: null, voice: null, gateway: null };

  for (const channel of channels) {
    if (channel === 'APP') {
      console.log(`[APP NOTIFICATION] To: reporter ${report.reporter_id} | ${message}`);
    }
    if (channel === 'SMS') {
      if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
        try {
          const twilio = (await import('twilio')).default;
          const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
          const sms = await client.messages.create({ body: message, from: process.env.TWILIO_PHONE_NUMBER, to: report.reporter_id });
          result.sms = { sid: sms.sid, status: sms.status };
        } catch (err) {
          console.error('Twilio SMS failed', err.message);
          result.sms = { status: 'failed', reason: err.message };
        }
      } else {
        console.log(`[SMS WOULD BE SENT] To: ${report.reporter_id} | ${message}`);
        result.sms = { status: 'mock_sent', to: report.reporter_id };
      }
    }
    if (channel === 'VOICE') {
      if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
        try {
          const twilio = (await import('twilio')).default;
          const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
          const call = await client.calls.create({ twiml: `<Response><Say>${message}</Say></Response>`, from: process.env.TWILIO_PHONE_NUMBER, to: report.reporter_id });
          result.voice = { sid: call.sid, status: call.status };
        } catch (err) {
          console.error('Twilio Voice failed', err.message);
          result.voice = { status: 'failed', reason: err.message };
        }
      } else {
        console.log(`[VOICE CALL WOULD BE PLACED] To: ${report.reporter_id} | ${message}`);
        result.voice = { status: 'mock_initiated', to: report.reporter_id };
      }
    }
    if (channel === 'GATEWAY') {
      try {
        const gwRes = await axios.post(`${GATEWAY_URL}/gateway/trigger`, {
          report_id: report.id,
          disaster_type: report.disaster_type,
          severity: report.severity,
          lat: report.lat,
          lng: report.lng,
          message,
        }, { timeout: 3000 });
        result.gateway = gwRes.data;
      } catch (err) {
        console.error('Gateway trigger failed', err.message);
        result.gateway = { status: 'failed', reason: err.message };
      }
    }
  }
  return result;
};
