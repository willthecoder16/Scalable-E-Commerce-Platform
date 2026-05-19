const logger = require('/shared/logger');

const notifications = [];

async function sendEmail({ to, subject, body }) {
  const mock = process.env.SENDGRID_MOCK !== 'false';
  const record = {
    id: `email_${Date.now()}`,
    type: 'email',
    to,
    subject,
    body,
    status: 'sent',
    sentAt: new Date().toISOString(),
    provider: mock ? 'sendgrid-mock' : 'sendgrid',
  };

  if (mock) {
    logger.info('[SendGrid Mock] Email sent', { to, subject });
  } else {
    // Production: @sendgrid/mail
    throw new Error('SendGrid live mode not configured');
  }

  notifications.push(record);
  return record;
}

async function sendSms({ to, message }) {
  const mock = process.env.TWILIO_MOCK !== 'false';
  const record = {
    id: `sms_${Date.now()}`,
    type: 'sms',
    to,
    message,
    status: 'sent',
    sentAt: new Date().toISOString(),
    provider: mock ? 'twilio-mock' : 'twilio',
  };

  if (mock) {
    logger.info('[Twilio Mock] SMS sent', { to });
  } else {
    throw new Error('Twilio live mode not configured');
  }

  notifications.push(record);
  return record;
}

function getNotifications(limit = 50) {
  return notifications.slice(-limit).reverse();
}

module.exports = { sendEmail, sendSms, getNotifications };
