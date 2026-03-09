const normalizeString = (value) => (typeof value === 'string' ? value.trim() : '');

const firstDefined = (...values) => {
  for (const value of values) {
    const normalized = normalizeString(value);
    if (normalized) return normalized;
  }
  return '';
};

const parsePort = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const parseSecure = (value, fallback = false) => {
  const normalized = normalizeString(value).toLowerCase();
  if (!normalized) return fallback;
  return normalized === 'true' || normalized === '1' || normalized === 'yes';
};

const getMailerConfig = (env = process.env) => {
  const user = firstDefined(env.SMTP_USER, env.MAIL_USER);
  const rawPass = firstDefined(env.SMTP_PASS, env.MAIL_PASS);
  const from = firstDefined(env.SMTP_FROM, env.MAIL_FROM, user);
  const service = firstDefined(env.SMTP_SERVICE, env.MAIL_SERVICE);
  const host = firstDefined(env.SMTP_HOST, env.MAIL_HOST);
  const secure = parseSecure(firstDefined(env.SMTP_SECURE, env.MAIL_SECURE), false);
  const defaultPort = secure ? 465 : 587;
  const port = parsePort(firstDefined(env.SMTP_PORT, env.MAIL_PORT), defaultPort);
  const pass = service.toLowerCase() === 'gmail' ? rawPass.replace(/\s+/g, '') : rawPass;

  return { service, host, port, secure, user, pass, from };
};

const createTransporter = (env = process.env) => {
  let nodemailer = null;
  try {
    nodemailer = require('nodemailer');
  } catch (error) {
    return { transporter: null, from: '', error: 'Missing nodemailer dependency. Run: npm install nodemailer (inside admin-backend).' };
  }

  const mailer = getMailerConfig(env);
  const missingAuth = [];
  if (!mailer.user) missingAuth.push('SMTP_USER');
  if (!mailer.pass) missingAuth.push('SMTP_PASS');
  if (!mailer.from) missingAuth.push('SMTP_FROM');

  if (missingAuth.length) {
    return {
      transporter: null,
      from: '',
      error: `SMTP configuration missing: ${missingAuth.join(', ')}.`
    };
  }

  if (!mailer.service && !mailer.host) {
    return {
      transporter: null,
      from: '',
      error: 'SMTP configuration missing: set SMTP_SERVICE (recommended) or SMTP_HOST.'
    };
  }

  const transportOptions = {
    auth: {
      user: mailer.user,
      pass: mailer.pass
    }
  };

  if (mailer.service) {
    transportOptions.service = mailer.service;
  } else {
    transportOptions.host = mailer.host;
    transportOptions.port = mailer.port;
    transportOptions.secure = mailer.secure;
  }

  return {
    transporter: nodemailer.createTransport(transportOptions),
    from: mailer.from,
    error: null
  };
};

module.exports = {
  createTransporter,
  getMailerConfig,
  normalizeString
};
