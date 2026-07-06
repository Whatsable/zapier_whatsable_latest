const { TRIGGER_URLS } = require('../constants');
const { getErrorMessage, request } = require('../whatsableApi');

const TRIGGER_SETUP_INFO = `**How to set up this trigger**

1. Select the correct **Credential Type** for your API key.
2. Click **Test trigger** to load sample fields for mapping (Zapier does not register the webhook on this step).
3. Set up your action step.
4. **Turn the Zap ON** — WhatsAble registers the webhook automatically (POST to the Zapier webhook API).
5. Send a **real WhatsApp message** to test live data.

Live webhook registration only happens when the Zap is turned ON, not during the editor Test step.`;

const SHARED_LEAD_NOTE =
  'This is where you store context about a lead. The AI reads this field to personalize conversations and qualify smarter. Populate it from your intake form, CRM, or manually.\nemail: carlos.mendez@example.com [account email] | Name: Carlos Test [used to address the lead] | Language: Spanish [bot replies in this language]\nLooking for: 2-3BR single-family home, $400k-$500k budget (flexible to $520k), north side of city, needs garage, has large dog, no HOA above $300/mo\nTimeline: close before Sep 2026 | Pre-approved: $480k via First National Bank | Status: renting, lease ends Aug 31 | Best time to contact: evenings after 6pm';

const EXAMPLE_UUID_USER_ID = 'a8f3c2d1-4b6e-4890-9c7a-2f1e8d56b3c4';
const EXAMPLE_NOTIFYER_IO_USER_ID = '71dcbf9b-7f9c-43c8-ae9d-a2c379074e6e';
const EXAMPLE_NOTIFIER_USER_ID = 'f4e8d2c1-6a3b-4c9d-8e7f-5a2b1c0d9e8f';

const NOTIFYER_INCOMING_LAST_MESSAGES =
  '[{"type":"user","content":"We are looking somewhere between 400k and 500k, ideally in the north side of the city","timestamp":"2026-06-15T15:30:00.000Z","content_type":"text"},{"type":"bot","content":"Great Carlos! And what is your approximate budget range and preferred area?","timestamp":"2026-06-15T15:28:00.000Z","content_type":"text"},{"type":"user","content":"[Audio transcription]: Yes so basically we need at least two bedrooms, my wife prefers three, and we really need a garage because we have a big dog. We are hoping to close before September if possible.","timestamp":"2026-06-15T15:25:00.000Z","content_type":"audio"},{"type":"bot","content":"Hi Carlos! I saw you requested info about available properties. Could you tell me a bit about what you are looking for?","timestamp":"2026-06-15T15:20:00.000Z","content_type":"text"}]';

const NOTIFYER_IO_INCOMING_LAST_MESSAGES =
  '[{"type":"user","content":"We are looking somewhere between 400k and 500k, ideally in the north side of the city","timestamp":"2026-06-15T15:30:00.000Z","content_type":"text"},{"type":"bot","content":"Great Carlos! Based on your budget and preferences, I have flagged 3 matching listings on the north side. A property specialist will reach out before 6pm today.","timestamp":"2026-06-15T15:28:00.000Z","content_type":"text"},{"type":"user","content":"[Audio transcription]: Yes so basically we need at least two bedrooms, my wife prefers three, and we really need a garage because we have a big dog. We are hoping to close before September if possible.","timestamp":"2026-06-15T15:25:00.000Z","content_type":"audio"}]';

const whatsableIncomingSample = {
  last_messages:
    '[{"type":"user","content":"Hi, I saw your listing on the north side and I am interested in scheduling a viewing. We are a family of 4 looking for at least 3 bedrooms.","timestamp":"2026-06-15T10:31:00.000Z","content_type":"text"}]',
  conversation_paragraph:
    'The full conversation in readable format. Only one message here because this is the very first contact from this lead, the bot has not replied yet. User (10:31:00 AM): Hi, I saw your listing on the north side and I am interested in scheduling a viewing. We are a family of 4 looking for at least 3 bedrooms.',
  phone_number: '+14155550187',
  user_id: EXAMPLE_UUID_USER_ID,
  last_message_of_user:
    'The first message sent by this lead. This is what triggered the automation. No prior conversation exists for this contact.\nHi, I saw your listing on the north side and I am interested in scheduling a viewing. We are a family of 4 looking for at least 3 bedrooms.',
  last_message_of_bot: '',
  message_type: 'text [type of message received: text, audio, image, document]',
  user_last_message_time: 1781051460,
  bot_last_message_time: null,
};

const notifyerIncomingSample = {
  note: SHARED_LEAD_NOTE,
  labels: 'active, Pipedrive, Hot Lead, Notifyer Product',
  user_id: EXAMPLE_UUID_USER_ID,
  message_type: 'text',
  phone_number: '14155550187',
  last_messages: NOTIFYER_INCOMING_LAST_MESSAGES,
  attachment_url:
    'https://example.com/listings/test-property-brochure-northside.pdf [file the lead sent or that was shared with them, empty if none]',
  recipient_name: 'Carlos Test [first name used by the AI to address the lead in conversation]',
  note_automation:
    'Instructions the AI follows automatically based on what happens in the conversation. If budget confirmed and timeline under 6 months, notify assigned agent within 1 hour and add to Hot Leads pipeline in Pipedrive',
  scheduled_messages:
    'Messages queued to be sent to this lead at a future time or trigger. Message 1: "Thanks Carlos! Based on your preferences, I found 3 properties that match. A property specialist will contact you within the next 2 hours."',
  incoming_message: true,
  last_message_of_bot:
    'The last message your business sent to this lead. Used by the AI to know where the conversation left off and avoid repeating itself.\nGreat Carlos! And what is your approximate budget range and preferred area?',
  last_message_of_user:
    'The most recent message received from the lead. This is what triggered the current automation run.\nWe are looking somewhere between 400k and 500k, ideally in the north side of the city',
  bot_last_message_time: 1781051280,
  conversation_paragraph:
    'A flattened, readable version of the conversation history. Used by the AI as quick context without parsing the full last_messages array. Bot (3:20:00 PM): Hi Carlos! I saw you requested info about available properties. Could you tell me a bit about what you are looking for? ; User (3:25:00 PM): [Audio transcription]: Yes so basically we need at least two bedrooms, my wife prefers three, and we really need a garage because we have a big dog. We are hoping to close before September if possible. ; Bot (3:28:00 PM): Great Carlos! And what is your approximate budget range and preferred area? ; User (3:30:00 PM): We are looking somewhere between 400k and 500k, ideally in the north side of the city',
  user_last_message_time: 1781052600,
  is_scheduled: false,
};

const notifierIncomingSample = {
  last_messages:
    '[{"type":"user","content":"We are looking somewhere between 400k and 500k, ideally in the north side of the city","timestamp":"2026-06-15T10:15:22.000Z","content_type":"text"},{"type":"bot","content":"Great Carlos! And what is your approximate budget range and preferred area?","timestamp":"2026-06-15T10:14:05.000Z","content_type":"text"},{"type":"user","content":"[Audio transcription]: Yes so basically we need at least two bedrooms, my wife prefers three, and we really need a garage because we have a big dog. We are hoping to close before September if possible.","timestamp":"2026-06-15T10:13:48.000Z","content_type":"audio"}]',
  conversation_paragraph:
    'A flattened readable version of the conversation history. Used by the AI as quick context without parsing the full last_messages array. User (10:13:48 AM): [Audio transcription]: Yes so basically we need at least two bedrooms, my wife prefers three, and we really need a garage because we have a big dog. We are hoping to close before September if possible. ; Bot (10:14:05 AM): Great Carlos! And what is your approximate budget range and preferred area? ; User (10:15:22 AM): We are looking somewhere between 400k and 500k, ideally in the north side of the city',
  phone_number: '+14155550187',
  user_id: EXAMPLE_NOTIFIER_USER_ID,
  business_info:
    'Sunrise Realty Group [the business account running this bot. Used by the AI to identify itself and personalize responses on behalf of the right brand]',
  last_message_of_user:
    'The most recent message received from the lead. This is what triggered the current automation run.\nWe are looking somewhere between 400k and 500k, ideally in the north side of the city',
  last_message_of_bot:
    'The last message your business sent to this lead. Used by the AI to know where the conversation left off and avoid repeating itself.\nGreat Carlos! And what is your approximate budget range and preferred area?',
  message_type: 'text [type of message received: text, audio, image, document]',
};

const notifyerIncomingOutgoingSample = {
  note: SHARED_LEAD_NOTE,
  labels: 'urgent, Hot Lead, Buyer Qualified [comma-separated tags used to categorize this contact in the chat app and trigger label-based automations]',
  user_id: EXAMPLE_NOTIFYER_IO_USER_ID,
  attachment_url: null,
  recipient_name: 'Carlos Test [first name or full name used by the AI to address the lead in conversation]',
  note_automation:
    'Instructions the AI follows automatically based on what happens in the conversation. If budget confirmed and timeline under 6 months, notify assigned agent within 1 hour and add to Hot Leads pipeline in Pipedrive',
  incoming_message: true,
  last_message_of_bot:
    'The last message your business sent to this lead. Used by the AI to know where the conversation left off and avoid repeating itself.\nGreat Carlos! Based on your budget and preferences, I have flagged 3 matching listings on the north side. A property specialist will reach out before 6pm today.',
  last_message_of_user:
    'The most recent message received from the lead. This is what triggered the current automation run.\nWe are looking somewhere between 400k and 500k, ideally in the north side of the city',
  bot_last_message_time: 1781051280,
  conversation_paragraph:
    'A flattened readable version of the conversation history. Used by the AI as quick context without parsing the full last_messages array. User (3:25:00 PM): [Audio transcription]: Yes so basically we need at least two bedrooms, my wife prefers three, and we really need a garage because we have a big dog. We are hoping to close before September if possible. ; Bot (3:28:00 PM): Great Carlos! Based on your budget and preferences, I have flagged 3 matching listings on the north side. A property specialist will reach out before 6pm today. ; User (3:30:00 PM): We are looking somewhere between 400k and 500k, ideally in the north side of the city',
  user_last_message_time: 1781052600,
  is_scheduled: false,
};

const samplesByCredentialType = {
  whatsableTrigger: whatsableIncomingSample,
  notifier: notifierIncomingSample,
  notifyer: notifyerIncomingSample,
  notifyerSystemAll: notifyerIncomingOutgoingSample,
};

const triggerOutputFields = [
  { key: 'note', label: 'Note', type: 'string' },
  { key: 'labels', label: 'Labels', type: 'string' },
  { key: 'user_id', label: 'User ID', type: 'string' },
  { key: 'business_info', label: 'Business Info', type: 'string' },
  { key: 'message_type', label: 'Message Type', type: 'string' },
  { key: 'phone_number', label: 'Phone Number', type: 'string' },
  { key: 'last_messages', label: 'Last Messages', type: 'string' },
  { key: 'attachment_url', label: 'Attachment URL', type: 'string' },
  { key: 'recipient_name', label: 'Recipient Name', type: 'string' },
  { key: 'note_automation', label: 'Note Automation', type: 'string' },
  { key: 'scheduled_messages', label: 'Scheduled Messages', type: 'string' },
  { key: 'incoming_message', label: 'Incoming Message', type: 'boolean' },
  {
    key: 'is_scheduled',
    label: 'Is Scheduled',
    type: 'boolean',
  },
  { key: 'last_message_of_bot', label: 'Last Message of Bot', type: 'string' },
  { key: 'last_message_of_user', label: 'Last Message of User', type: 'string' },
  { key: 'bot_last_message_time', label: 'Bot Last Message Time', type: 'integer' },
  { key: 'conversation_paragraph', label: 'Conversation Paragraph', type: 'string' },
  { key: 'user_last_message_time', label: 'User Last Message Time', type: 'integer' },
];

const getWebhookPayload = (bundle) => {
  const requestData = bundle.cleanedRequest || bundle.rawRequest || {};
  if (requestData && typeof requestData === 'object' && requestData.body && typeof requestData.body === 'object') {
    return requestData.body;
  }
  return requestData;
};

const DEFAULT_CREDENTIAL_TYPE = 'notifyer';

const credentialTypeChoices = {
  notifyer: 'Notifyer System Incoming Message',
  notifyerSystemAll: 'Notifyer System Incoming & Outgoing Message',
  whatsableTrigger: 'WhatsAble Incoming Message',
  notifier: 'Notifier Incoming Message',
};

const registerWebhook = async (z, bundle) => {
  if (!bundle.targetUrl) {
    throw new z.errors.Error(
      'Zapier did not provide a webhook URL (targetUrl). Turn the Zap ON to register the webhook.',
      'Error'
    );
  }

  const credentialType = bundle.inputData.credentialType || DEFAULT_CREDENTIAL_TYPE;
  const registerUrl = TRIGGER_URLS[credentialType];

  if (!registerUrl) {
    throw new z.errors.Error(`Unknown credential type: ${credentialType}`, 'Error');
  }

  const body =
    credentialType === 'notifyer' ? { hookUrl: bundle.targetUrl } : { url: bundle.targetUrl };

  z.console.log('WhatsAble trigger subscribe:', {
    credentialType,
    registerUrl,
    zapierTargetUrl: bundle.targetUrl,
    body,
  });

  const response = await request(z, bundle, {
    method: 'POST',
    url: registerUrl,
    body,
  });

  if (response && (response.success === false || response.code)) {
    throw new z.errors.Error(getErrorMessage(response) || 'Webhook registration failed.', 'Error');
  }

  return {
    id: response.id || response.hook_id || bundle.targetUrl,
    credentialType,
    zapierTargetUrl: bundle.targetUrl,
  };
};

const subscribeHook = async (z, bundle) => {
  z.console.log('WhatsAble trigger performSubscribe:', {
    credentialType: bundle.inputData.credentialType,
    hasTargetUrl: Boolean(bundle.targetUrl),
  });

  return registerWebhook(z, bundle);
};

const unsubscribeHook = async (z, bundle) => {
  z.console.log('WhatsAble trigger unsubscribe:', bundle.subscribeData);
  return { success: true };
};

// Zapier editor "Test trigger" calls performList only — targetUrl is not available there.
// Webhook registration happens in performSubscribe when the Zap is turned ON.
const performList = async (z, bundle) => {
  z.console.log('WhatsAble trigger performList:', {
    credentialType: bundle.inputData.credentialType,
    hasTargetUrl: Boolean(bundle.targetUrl),
    isLoadingSample: bundle.meta?.isLoadingSample,
  });

  if (bundle.targetUrl) {
    await registerWebhook(z, bundle);
  }

  const credentialType = bundle.inputData.credentialType || DEFAULT_CREDENTIAL_TYPE;
  const sample = samplesByCredentialType[credentialType];
  if (sample) {
    return [sample];
  }

  return [];
};

const perform = async (z, bundle) => [getWebhookPayload(bundle)];

module.exports = {
  key: 'whatsable_message_trigger',
  noun: 'Message',
  display: {
    label: 'New Incoming or Outgoing WhatsApp Message',
    description:
      'When you receive or send a WhatsApp message. You can choose to only trigger this when you send or receive a message, or both.',
    hidden: false,
  },
  operation: {
    inputFields: [
      {
        key: 'triggerSetupInfo',
        label: 'How to Map Trigger Data',
        type: 'copy',
        helpText: TRIGGER_SETUP_INFO,
      },
      {
        key: 'credentialType',
        label: 'Credential Type',
        type: 'string',
        choices: credentialTypeChoices,
        default: DEFAULT_CREDENTIAL_TYPE,
        required: true,
        helpText:
          'Choose which WhatsAble API to use for this trigger. If you\'re not sure which one you should use contact team@whatsable.app',
      },
    ],
    type: 'hook',
    cleanInputData: false,
    perform,
    performSubscribe: subscribeHook,
    performUnsubscribe: unsubscribeHook,
    performList,
    sample: notifyerIncomingSample,
    outputFields: triggerOutputFields,
  },
};
