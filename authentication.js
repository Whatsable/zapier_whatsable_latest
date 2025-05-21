'use strict';

const { API_URL } = require("./constants");

const test = (z, bundle) =>
  z.request({ url: `${API_URL}/auth/me` }).then((response) => {
    response.throwForStatus()
    const results = response.json
    return results
  });

module.exports = {
  type: 'custom',
  fields: [{ key: 'apiKey', label: 'API Key', required: true, helpText: 'Found in your [WhatsAble Dashboard](https://dashboard.whatsable.app/keys/).' }],

  // The test method allows Zapier to verify that the credentials a user provides
  // are valid. We'll execute this method whenever a user connects their account for
  // the first time.
  test,
  connectionLabel: 'WhatsAble API Key ({{ bundle.inputData.email }})',
};