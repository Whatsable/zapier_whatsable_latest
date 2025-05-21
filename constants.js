const ZAPIER_ENV_URLS = {
    'development': 'http://localhost:3000/api',
    'preview': 'https://preview.whatsable.app/api',
    'production': 'https://dashboard.whatsable.app/api',
  }
  
  exports.API_URL = ZAPIER_ENV_URLS[process.env.ZAPIER_ENV] ?? ZAPIER_ENV_URLS['preview']