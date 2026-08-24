import axios from 'axios';

const GATEWAY_URL = process.env.GATEWAY_URL || 'http://localhost:6000';

export const sendAlert = async (channels, report, message, recipients = []) => {
  const result = { sms: null, voice: null, gateway: null, push: null };

  for (const channel of channels) {
    if (channel === 'APP') {
      const target = recipients.length > 0 ? recipients.map(r => r.name || r.phone).join(', ') : `reporter ${report.reporter_id}`;
      console.log(`[APP NOTIFICATION] To: ${target} | ${message}`);
      result.app = { status: 'sent', to: target };
    }
    if (channel === 'SMS') {
      const sentTo = [];
      for (const recipient of recipients) {
        if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
          try {
            const twilio = (await import('twilio')).default;
            const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
            const sms = await client.messages.create({ body: message, from: process.env.TWILIO_PHONE_NUMBER, to: recipient.phone });
            sentTo.push({ to: recipient.phone, sid: sms.sid, status: sms.status });
          } catch (err) {
            console.error('Twilio SMS failed', err.message);
            sentTo.push({ to: recipient.phone, status: 'failed', reason: err.message });
          }
        } else {
          console.log(`[SMS WOULD BE SENT] To: ${recipient.phone} | ${message}`);
          sentTo.push({ to: recipient.phone, status: 'mock_sent' });
        }
      }
      result.sms = { status: 'sent', recipients: sentTo };
    }
    if (channel === 'VOICE') {
      const calledTo = [];
      for (const recipient of recipients) {
        if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
          try {
            const twilio = (await import('twilio')).default;
            const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
            const call = await client.calls.create({ twiml: `<Response><Say>${message}</Say></Response>`, from: process.env.TWILIO_PHONE_NUMBER, to: recipient.phone });
            calledTo.push({ to: recipient.phone, sid: call.sid, status: call.status });
          } catch (err) {
            console.error('Twilio Voice failed', err.message);
            calledTo.push({ to: recipient.phone, status: 'failed', reason: err.message });
          }
        } else {
          console.log(`[VOICE CALL WOULD BE PLACED] To: ${recipient.phone} | ${message}`);
          calledTo.push({ to: recipient.phone, status: 'mock_initiated' });
        }
      }
      result.voice = { status: 'sent', recipients: calledTo };
    }
    if (channel === 'PUSH') {
      const pushedTo = [];
      for (const recipient of recipients) {
        console.log(`[PUSH NOTIFICATION] To: ${recipient.name || recipient.phone} | ${message}`);
        pushedTo.push({ to: recipient.phone, status: 'mock_sent' });
      }
      result.push = { status: 'sent', recipients: pushedTo };
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
