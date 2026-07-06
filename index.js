const fetchNumbersTrigger = require('./triggers/fetchNumbers');
const fetchGroupsTrigger = require('./triggers/fetchGroups');
const whatsAbleActions = require('./creates/performWhatsAbleOperation');
const authentication = require('./authentication');
const whatsAbleMessageTrigger = require('./triggers/whatsAbleMessageTrigger');
const n8nOptionTriggers = require('./triggers/n8nOptions');
const { getErrorMessage } = require('./whatsableApi');

require('dotenv').config();

const handleHTTPError = (response, z) => {
  if (response.status >= 400) {
    const message = getErrorMessage(response);
    const type = response.status === 401 || response.status === 403 ? 'AuthenticationError' : 'Error';
    throw new z.errors.Error(message, type, response.status);
  }
  return response;
};

const handleBadResponses = (response, z, bundle) => {
  if (response.status === 401) {
    throw new z.errors.Error(
      // This message is surfaced to the user
      getErrorMessage(response) || 'Invalid API key',
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
  flags: {
    cleanInputData: false,
  },
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
    [fetchGroupsTrigger.key]: fetchGroupsTrigger,
    [whatsAbleMessageTrigger.key]: whatsAbleMessageTrigger,
    [n8nOptionTriggers.productOperations.key]: n8nOptionTriggers.productOperations,
    [n8nOptionTriggers.templates.key]: n8nOptionTriggers.templates,
    [n8nOptionTriggers.labels.key]: n8nOptionTriggers.labels,
    [n8nOptionTriggers.removeContactLabels.key]: n8nOptionTriggers.removeContactLabels,
    [n8nOptionTriggers.phoneNumbers.key]: n8nOptionTriggers.phoneNumbers,
    [n8nOptionTriggers.whatsAppNumbers.key]: n8nOptionTriggers.whatsAppNumbers,
    [n8nOptionTriggers.groups.key]: n8nOptionTriggers.groups,
  },

  // If you want your creates to show up, you better include it here!
  creates: {
    [whatsAbleActions.sendWhatsAppMessage.key]: whatsAbleActions.sendWhatsAppMessage,
    [whatsAbleActions.scheduleFollowUpMessage.key]: whatsAbleActions.scheduleFollowUpMessage,
    [whatsAbleActions.sendWhatsAppMessageToGroup.key]: whatsAbleActions.sendWhatsAppMessageToGroup,
    [whatsAbleActions.updateContact.key]: whatsAbleActions.updateContact,
    [whatsAbleActions.getMessageDeliveryStatus.key]: whatsAbleActions.getMessageDeliveryStatus,
  },
};

// Finally, export the app.
module.exports = App;