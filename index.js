const fetchNumbersTrigger = require('./triggers/fetchNumbers');
const createMessage = require('./creates/createMessage');
const authentication = require('./authentication');
const incomingMessageWebhook = require('./triggers/incomingMessage');

require('dotenv').config();

const handleHTTPError = (response, z) => {
  if (response.status >= 400) {
    throw new Error(`Unexpected status code ${response.status}`);
  }
  return response;
};

const handleBadResponses = (response, z, bundle) => {
  if (response.status === 401) {
    throw new z.errors.Error(
      // This message is surfaced to the user
      'The API Key you supplied is incorrect',
      'AuthenticationError',
      response.status
    );
  }

  return response;
};

// This function runs before every outbound request. You can have as many as you
// need. They'll need to each be registered in your index.js file.
const includeApiKey = (request, z, bundle) => {
  if (bundle.authData.apiKey) {
    request.headers.Authorization = bundle.authData.apiKey;
  }

  return request;
};

const App = {
  // This is just shorthand to reference the installed dependencies you have. Zapier will
  // need to know these before we can upload
  version: require('./package.json').version,
  platformVersion: require('zapier-platform-core').version,
  authentication: authentication,

  // beforeRequest & afterResponse are optional hooks into the provided HTTP client
  beforeRequest: [
    includeApiKey
  ],

  afterResponse: [
    handleHTTPError,
    handleBadResponses
  ],

  // If you want to define optional resources to simplify creation of triggers, searches, creates - do that here!
  resources: {
  },

  // If you want your trigger to show up, you better include it here!
  triggers: {
    [fetchNumbersTrigger.key]: fetchNumbersTrigger,
    [incomingMessageWebhook.key]: incomingMessageWebhook,
  },

  // If you want your searches to show up, you better include it here!
  searches: {
  },

  // If you want your creates to show up, you better include it here!
  creates: {
    [createMessage.key]: createMessage,
  }
};

// Finally, export the app.
module.exports = App;