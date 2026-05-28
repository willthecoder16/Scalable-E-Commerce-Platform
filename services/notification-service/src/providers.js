const logger = require('/shared/logger');

const notifications = [];

async function sendEmail({ to, subject, body, html, userId, eventType, orderId }) {
  const mock = process.env.SENDGRID_MOCK !== 'false';
  const apiKey = process.env.SENDGRID_API_KEY;
  const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'orders@shopflow.demo';

  if (!mock && apiKey) {
    try {
      const sgMail = require('@sendgrid/mail');
      sgMail.setApiKey(apiKey);
      await sgMail.send({
        to,
        from: fromEmail,
        subject,
        text: body,
        html: html || body,
      });
    } catch (err) {
      logger.error('SendGrid error', { error: err.message });
      throw err;
    }
  } else {
    logger.info('[SendGrid Mock] Email sent', { to, subject, eventType });
  }

  const record = {
    id: `email_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    type: 'email',
    to,
    subject,
    body,
    userId: userId || null,
    orderId: orderId || null,
    eventType: eventType || 'manual',
    status: 'sent',
    sentAt: new Date().toISOString(),
    provider: mock ? 'sendgrid-mock' : 'sendgrid',
  };

  notifications.push(record);
  return record;
}

async function sendSms({ to, message, userId, eventType, orderId }) {
  const mock = process.env.TWILIO_MOCK !== 'false';
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;

  if (!mock && accountSid && authToken && fromNumber) {
    try {
      const twilio = require('twilio')(accountSid, authToken);
      await twilio.messages.create({ body: message, from: fromNumber, to });
    } catch (err) {
      logger.error('Twilio error', { error: err.message });
      throw err;
    }
  } else {
    logger.info('[Twilio Mock] SMS sent', { to, eventType });
  }

  const record = {
    id: `sms_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    type: 'sms',
    to,
    message,
    userId: userId || null,
    orderId: orderId || null,
    eventType: eventType || 'manual',
    status: 'sent',
    sentAt: new Date().toISOString(),
    provider: mock ? 'twilio-mock' : 'twilio',
  };

  notifications.push(record);
  return record;
}

function getNotifications({ userId, email, limit = 50 } = {}) {
  let list = [...notifications];
  if (userId || email) {
    list = list.filter(
      (n) => (userId && n.userId === userId) || (email && n.to === email)
    );
  }
  return list.slice(-limit).reverse();
}

module.exports = { sendEmail, sendSms, getNotifications };
