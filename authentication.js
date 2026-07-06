'use strict';

const { validateApiKey } = require('./whatsableApi');

const test = (z, bundle) =>
  validateApiKey(z, bundle).then((result) => ({
    ...result,
    email: result.email || result.user_email || result.userId || result.user_id || result.product,
  }));

module.exports = {
  type: 'custom',
  fields: [
    {
      key: 'apiKey',
      label: 'API Key',
      required: true,
      helpText:
        'Paste your API key from [WhatsAble Dashboard](https://dashboard.whatsable.app/). Works with WhatsAble, Notifier by WhatsAble, or Notifyer System — the app is detected automatically.',
    },
  ],

  // The test method allows Zapier to verify that the credentials a user provides
  // are valid. We'll execute this method whenever a user connects their account for
  // the first time.
  test,
  connectionLabel: 'WhatsAble {{ bundle.inputData.product }} API Key',
};