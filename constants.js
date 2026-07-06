const ZAPIER_ENV_URLS = {
    'development': 'http://localhost:3000/api',
    'preview': 'https://preview.whatsable.app/api',
    'production': 'https://dashboard.whatsable.app/api',
  }
  
const BASE_DOMAIN = 'https://api.insightssystem.com';
const WHATSABLE_BASE_DOMAIN = 'https://wh.whatsable.app';
const WHATSABLE_DASHBOARD_BASE_DOMAIN = 'https://dashboard.whatsable.app';

const BASE_URLS = {
  VALIDATION: `${BASE_DOMAIN}/api:gncnl2D6`,
  NOTIFIER: `${BASE_DOMAIN}/api:gncnl2D6`,
  NOTIFYER: `${BASE_DOMAIN}/api:ErOQ8pSj`,
  WHATSABLE: `${BASE_DOMAIN}/api:gncnl2D6`,
};

const TRIGGER_URLS = {
  whatsableTrigger: `${BASE_DOMAIN}/api:qmqX26wO/zapier/webhook`,
  notifier: `${BASE_DOMAIN}/api:-GWQv5aM/zapier/notifier/webhook`,
  notifyer: `${BASE_DOMAIN}/api:hFrjh8a1/zapier/webhook/incoming`,
  notifyerSystemAll: `${BASE_DOMAIN}/api:hFrjh8a1/zapier/webhook/io`,
};

const ACTION_URLS = {
  MESSAGE_STATUS: `${BASE_DOMAIN}/api:5l-RgW1B/conversation`,
};

exports.API_URL = ZAPIER_ENV_URLS[process.env.ZAPIER_ENV] ?? ZAPIER_ENV_URLS['preview'];
exports.BASE_DOMAIN = BASE_DOMAIN;
exports.BASE_URLS = BASE_URLS;
exports.TRIGGER_URLS = TRIGGER_URLS;
exports.ACTION_URLS = ACTION_URLS;
exports.WHATSABLE_BASE_DOMAIN = WHATSABLE_BASE_DOMAIN;
exports.WHATSABLE_DASHBOARD_BASE_DOMAIN = WHATSABLE_DASHBOARD_BASE_DOMAIN;