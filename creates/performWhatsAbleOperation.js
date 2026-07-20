const { WHATSAPP_TIMEZONES } = require('../timezones');
const { ACTION_URLS, BASE_URLS, WHATSABLE_DASHBOARD_BASE_DOMAIN } = require('../constants');
const {
  LABEL_CONDITIONS,
  MESSAGE_TYPES,
  REPLY_CONDITIONS,
  TIME_UNITS,
  TIME_VALUES,
  buildNonTemplateMessageBody,
  buildNotifyerScheduleParams,
  buildScheduledNonTemplateMessageBody,
  buildUpdateContactLabelsPayload,
  getTemplateDynamicFieldsFromApi,
  getTemplatePreviewInfoField,
  getTemplateVariableFields,
  getTemplateVariables,
  getReplyConditionDescription,
  parseList,
  parseTemplate,
  request,
  validateApiKey,
} = require('../whatsableApi');

const NOTE_FIELD_HELP_TEXT =
  'Optional: Add a note to this conversation, such as context about this lead based on previous Zapier steps (e.g. Answers from a form). This gives context to our AI about the person.';

const defaultActionSample = {
  success: true,
  message: 'Operation completed successfully',
};

const defaultActionOutputFields = [
  { key: 'success', label: 'Success', type: 'boolean' },
  { key: 'message', label: 'Message', type: 'string' },
];

const SEND_CONFIGURATION_CHOICES = {
  sendNotifyerTemplate: 'Send WhatsApp Template (to start conversation)',
  sendNonTemplateMessage: 'Send a non-template message (person must write to you first)',
};

const SCHEDULE_CONFIGURATION_CHOICES = {
  sendNotifyerTemplate: 'Schedule WhatsApp Template (to start conversation)',
  sendNonTemplateMessage: 'Schedule a non-template message (person must write to you first)',
};

const configurationField = (choices) => ({
  key: 'configuration',
  label: 'Configuration',
  type: 'string',
  choices,
  default: Object.keys(choices)[0],
  required: true,
  altersDynamicFields: true,
});

const messageStatusSample = {
  phone_number: 971568381668,
  system_user:
    'In order to maintain a healthy ecosystem engagement, the message failed to be delivered.. Error code is 131049',
  message_id: 'wamid.HBgMOTcxNTY4MzgxNjY4FQIAERgSNDg0QkYxMTg3NjIxRTlGQzhDAA==',
  delivered_time: null,
  read_time: null,
  status: 'failed',
  send_by: '',
  send_time: 1781087611602,
};

const messageStatusOutputFields = [
  { key: 'phone_number', label: 'Phone Number', type: 'integer' },
  { key: 'system_user', label: 'System User', type: 'string' },
  { key: 'message_id', label: 'Message ID', type: 'string' },
  { key: 'delivered_time', label: 'Delivered Time', type: 'integer' },
  { key: 'read_time', label: 'Read Time', type: 'integer' },
  { key: 'status', label: 'Status', type: 'string' },
  { key: 'send_by', label: 'Send By', type: 'string' },
  { key: 'send_time', label: 'Send Time', type: 'integer' },
];

const choicesFromOptions = (options) =>
  options.reduce((choices, option) => {
    choices[option.id] = option.name;
    return choices;
  }, {});

const optionField = (key, label, dynamic, helpText, extra = {}) => ({
  key,
  label,
  type: 'string',
  dynamic,
  required: true,
  helpText,
  ...extra,
});

const textField = (key, label, helpText, required = true, extra = {}) => ({
  key,
  label,
  type: 'text',
  required,
  helpText,
  ...extra,
});

const stringField = (key, label, helpText, required = true, extra = {}) => ({
  key,
  label,
  type: 'string',
  required,
  helpText,
  ...extra,
});

const SCHEDULE_DATETIME_INFO = `**Schedule date and time**

Use the **Scheduled Date and Time** field to pick or map a date/time. Zapier sends ISO 8601 (for example, \`2026-06-08T17:20:00+02:00\`), which is converted to \`2026-06-08T17:20:00.000Z\` before sending to WhatsAble.

Then select your **Timezone** below (for example, Europe/Berlin).`;

const RELATIVE_SCHEDULE_INFO = `**Send after a delay (relative schedule)**

With **Schedule Type** turned off, the message sends after a delay instead of at a fixed date.

Choose a **Unit of Time** (days, hours, or minutes) and a **Number** — for example, **2** + **hours** sends the message 2 hours after the Zap runs.`;

const LABEL_CONDITION_INFO =
  'Send the scheduled message only if the recipient labels match this condition.';

const copyField = (key, label, helpText) => ({
  key,
  label,
  type: 'copy',
  helpText,
  required: false,
  list: false,
  altersDynamicFields: false,
});

const scheduleDatetimeField = (key) => ({
  key,
  label: 'Scheduled Date and Time',
  type: 'datetime',
  required: true,
  helpText:
    'Pick or map a date and time. Zapier passes ISO 8601 (e.g. 2026-06-08T17:20:00+02:00), sent to the API as 2026-06-08T17:20:00.000Z. Choose the matching Timezone below.',
});

const timezoneField = (key, helpText) => ({
  key,
  label: 'Timezone',
  type: 'string',
  choices: choicesFromOptions(WHATSAPP_TIMEZONES),
  required: true,
  helpText:
    helpText ||
    'Required. Choose the timezone for the scheduled date and time above (e.g. Europe/Berlin). This is sent to WhatsAble as time_zone.',
});

const appendNotifyerScheduleFields = (fields, bundle) => {
  fields.push({
    key: 'notifyerScheduleTypeSpecific',
    label: 'Schedule Type : Relative or Specific',
    type: 'boolean',
    required: false,
    default: 'false',
    altersDynamicFields: true,
    helpText:
      'Off = send after a delay (e.g. 2 hours from now). On = send at a specific date and time you enter below.',
  });

  if (bundle.inputData.notifyerScheduleTypeSpecific === true || bundle.inputData.notifyerScheduleTypeSpecific === 'true') {
    fields.push(
      copyField('templateScheduleDatetimeInfo', 'How to Enter Schedule Date & Time', SCHEDULE_DATETIME_INFO),
      scheduleDatetimeField('templateScheduledDateTime'),
      timezoneField('templateTimezone')
    );
  } else {
    fields.push(
      copyField('templateRelativeScheduleInfo', 'How Relative Schedule Works', RELATIVE_SCHEDULE_INFO),
      {
        key: 'notifyerUnitOfTime',
        label: 'Unit of Time',
        type: 'string',
        choices: choicesFromOptions(TIME_UNITS),
        required: true,
        helpText: 'Delay unit: days, hours, or minutes after the Zap runs.',
      },
      {
        key: 'notifyerUnitOfTimeValue',
        label: 'Number',
        type: 'integer',
        choices: choicesFromOptions(TIME_VALUES),
        required: true,
        helpText: 'How many units to wait — e.g. 2 hours or 30 minutes.',
      }
    );
  }

  fields.push({
    key: 'notifyerRecipientReplyCondition',
    label: 'Recipient Reply Status : Send Only If',
    type: 'string',
    choices: choicesFromOptions(REPLY_CONDITIONS),
    required: false,
    altersDynamicFields: true,
    helpText: 'Optional. Leave empty to send regardless of reply status.',
  });

  const replyConditionDescription = getReplyConditionDescription(
    bundle.inputData.notifyerRecipientReplyCondition
  );
  if (replyConditionDescription) {
    fields.push(
      copyField('notifyerRecipientReplyConditionInfo', 'How this condition works', replyConditionDescription)
    );
  }

  fields.push(
    copyField('notifyerLabelConditionInfo', 'Label Condition', LABEL_CONDITION_INFO),
    {
      key: 'notifyerLabelConditionStatus',
      label: 'Label Status : Include or Exclude',
      type: 'string',
      choices: choicesFromOptions(LABEL_CONDITIONS),
      required: false,
      helpText: 'How selected labels apply to the condition.',
    },
    {
      key: 'notifyerConditionTwoLabels',
      label: 'Label Names or IDs',
      type: 'string',
      dynamic: 'fetchNotifyerLabels.id.name',
      list: true,
      required: false,
    }
  );
};

const notifyerTemplateFields = async (z, bundle, isSchedule) => {
  const fields = [
    stringField('notifyerRecipient', 'Phone Number', 'The phone number of the recipient in international format.'),
    optionField(
      'notifyerTemplate',
      'Template Name or ID',
      'fetchNotifyerTemplates.id.name',
      'The template to use.',
      { altersDynamicFields: true }
    ),
  ];

  let templateVariableFields = [];
  if (bundle.inputData.notifyerTemplate) {
    const templateApiData = await getTemplateDynamicFieldsFromApi(z, bundle, bundle.inputData.notifyerTemplate);
    const previewField = await getTemplatePreviewInfoField(
      z,
      bundle,
      bundle.inputData.notifyerTemplate,
      templateApiData
    );
    if (previewField) {
      fields.push(previewField);
    }

    templateVariableFields = await getTemplateVariableFields(
      z,
      bundle,
      bundle.inputData.notifyerTemplate,
      templateApiData
    );
  }

  fields.push(...templateVariableFields.filter((field) => field.key !== 'template_info'));
  fields.push(
    textField('templateNote', 'Note', NOTE_FIELD_HELP_TEXT, false),
    {
      key: 'templateLabels',
      label: 'Label Names or IDs',
      type: 'string',
      dynamic: 'fetchNotifyerLabels.id.name',
      list: true,
      required: false,
      helpText: 'Labels to attach to the conversation with this person.',
    }
  );

  if (!isSchedule) {
    return fields;
  }

  appendNotifyerScheduleFields(fields, bundle);

  return fields;
};

const updateContactFields = () => [
  stringField(
    'updateContactPhoneNumber',
    'Phone Number',
    'The phone number of the contact in international format.'
  ),
  stringField(
    'updateContactDisplayName',
    'Display Name',
    'The display name to show for this contact in the chat interface.',
    false
  ),
  textField('updateContactNote', 'Add a Note', NOTE_FIELD_HELP_TEXT, false),
  {
    key: 'updateContactLabels',
    label: 'Add Label Names or IDs',
    type: 'string',
    dynamic: 'fetchNotifyerLabels.id.name',
    list: true,
    required: false,
    helpText: 'Label names to add to this contact.',
  },
  {
    key: 'selectRemoveLabels',
    label: 'Remove Label Names or IDs',
    type: 'string',
    dynamic: 'fetchNotifyerRemoveContactLabels.id.name',
    list: true,
    required: false,
    helpText: 'Label names to remove from this contact. Use "Remove All" to clear all labels.',
  },
];

const sendUpdateContact = (z, bundle, input) => {
  const body = {
    phone_number: input.updateContactPhoneNumber,
    ...buildUpdateContactLabelsPayload(input.updateContactLabels, input.selectRemoveLabels),
  };

  if (input.updateContactNote) {
    body.note = input.updateContactNote;
  }

  if (input.updateContactDisplayName) {
    body.display_name = input.updateContactDisplayName;
  }

  return request(z, bundle, {
    method: 'PUT',
    url: 'https://api.insightssystem.com/api:hFrjh8a1/zapier/recipient/details/update',
    body,
  });
};

const nonTemplateFields = (bundle, isSchedule = false) => {
  const messageType = bundle.inputData.messageType || 'text';
  const fields = [
    stringField('nonTemplateRecipient', 'Recipient Phone Number', 'The phone number of the recipient in international format.'),
    {
      key: 'messageType',
      label: 'Message Type',
      type: 'string',
      choices: choicesFromOptions(MESSAGE_TYPES),
      default: 'text',
      required: true,
      altersDynamicFields: true,
    },
  ];

  if (messageType === 'text') {
    fields.push(
      {
        key: 'enableLinkPreview',
        label: 'Enable Link Preview',
        type: 'boolean',
        required: false,
        default: 'false',
      },
      textField('messageContent', 'Message Content', 'The text message content.')
    );
  } else if (messageType === 'document') {
    fields.push(
      stringField('documentUrl', 'Document URL', 'URL of the document to send.'),
      textField('documentCaption', 'Caption', 'Document caption.', false),
      stringField('documentFilename', 'Filename', 'Filename for the document.')
    );
  } else if (messageType === 'image') {
    fields.push(
      stringField('imageUrl', 'Image URL', 'URL of the image to send.'),
      textField('imageCaption', 'Caption', 'Image caption.', false)
    );
  } else if (messageType === 'video') {
    fields.push(
      stringField('videoUrl', 'Video URL', 'URL of the video to send.'),
      textField('videoCaption', 'Caption', 'Video caption.', false)
    );
  } else if (messageType === 'audio') {
    fields.push(
      stringField('audioUrl', 'Audio URL', 'URL of the audio to send.')
    );
  }

  fields.push({
    key: 'nonTemplateLabels',
    label: 'Label Names or IDs',
    type: 'string',
    dynamic: 'fetchNotifyerLabels.id.name',
    list: true,
    required: false,
    helpText: 'Labels to attach to the conversation with this person.',
  });

  fields.push(
    textField('nonTemplateNote', 'Note', NOTE_FIELD_HELP_TEXT, false)
  );

  if (isSchedule) {
    appendNotifyerScheduleFields(fields, bundle);
  }

  return fields;
};

const notifierSendFields = () => [
  stringField('recipient', 'Phone Number', 'The phone number of the recipient in international format.'),
  textField('message', 'Message', 'The text message to send.'),
  stringField('attachment', 'Attachment URL', 'URL of an attachment to send (optional).', false),
  stringField('filename', 'Filename', 'Filename for the attachment (optional).', false),
];

const whatsableSendFields = () => [
  optionField('whatsableTo', 'Recipient Name or ID', 'fetchWhatsAbleNumbersV2.id.name', 'Select a WhatsApp number to send from.'),
  textField('whatsableText', 'Text', 'Message text content.'),
  stringField('whatsableAttachment', 'Attachment URL', 'URL of an attachment to send.', false),
  stringField('whatsableFilename', 'Filename', 'Filename for the attachment.', false),
];

const groupMessageFields = () => [
  optionField('whatsableGroup', 'Group Name or ID', 'fetchWhatsAbleGroupsV2.id.name', 'Select a group to send message to.'),
  textField('whatsableGroupMessage', 'Message', 'Message text content.'),
];

const sendWhatsAppMessageFields = async (z, bundle) => {
  const validation = await validateApiKey(z, bundle);

  if (validation.product === 'notifyer') {
    const fields = [configurationField(SEND_CONFIGURATION_CHOICES)];
    const configuration = bundle.inputData.configuration || 'sendNotifyerTemplate';

    if (configuration === 'sendNotifyerTemplate') {
      fields.push(...(await notifyerTemplateFields(z, bundle, false)));
    } else if (configuration === 'sendNonTemplateMessage') {
      fields.push(...nonTemplateFields(bundle, false));
    }

    return fields;
  }

  if (validation.product === 'notifier') {
    return notifierSendFields();
  }

  if (validation.product === 'whatsable') {
    return whatsableSendFields();
  }

  throw new z.errors.Error(`Unsupported product type: ${validation.product}`, 'Error');
};

const scheduleFollowUpMessageFields = async (z, bundle) => {
  const validation = await validateApiKey(z, bundle);

  if (validation.product !== 'notifyer') {
    throw new z.errors.Error('Schedule a follow-up Message is only available for Notifyer System API keys.', 'Error');
  }

  const fields = [configurationField(SCHEDULE_CONFIGURATION_CHOICES)];
  const configuration = bundle.inputData.configuration || 'sendNotifyerTemplate';

  if (configuration === 'sendNotifyerTemplate') {
    fields.push(...(await notifyerTemplateFields(z, bundle, true)));
  } else if (configuration === 'sendNonTemplateMessage') {
    fields.push(...nonTemplateFields(bundle, true));
  }

  return fields;
};

const sendGroupMessageFields = async (z, bundle) => {
  const validation = await validateApiKey(z, bundle);

  if (validation.product !== 'whatsable') {
    throw new z.errors.Error('Send WhatsApp message to a group is only available for WhatsAble API keys.', 'Error');
  }

  return groupMessageFields();
};

const updateContactActionFields = async (z, bundle) => {
  const validation = await validateApiKey(z, bundle);

  if (validation.product !== 'notifyer') {
    throw new z.errors.Error('Update a Contact is only available for Notifyer System API keys.', 'Error');
  }

  return updateContactFields();
};

const getMessageDeliveryStatusFields = () => [
  stringField(
    'messageId',
    'Message ID',
    'WhatsApp message ID returned when the message was sent (e.g. wamid.HBgN...).'
  ),
];

const sendNotifyerTemplate = (z, bundle, isSchedule) => {
  const input = bundle.inputData;
  const templateData = parseTemplate(input.notifyerTemplate) || {};
  const body = {
    templateId: templateData.template_id || input.notifyerTemplate,
    variables: getTemplateVariables(input.notifyerTemplate, input),
    phone_number: input.notifyerRecipient,
    note: input.templateNote || '',
    labels: parseList(input.templateLabels),
  };

  if (isSchedule) {
    Object.assign(body, buildNotifyerScheduleParams(input));
  }

  return request(z, bundle, {
    method: 'POST',
    url: 'https://api.insightssystem.com/api:hFrjh8a1/zapier/messages/template/send',
    body,
  });
};

const resolveProductOperation = async (z, bundle, operation) => {
  const input = bundle.inputData;

  if (input.configuration) {
    return input.configuration;
  }

  const validation = await validateApiKey(z, bundle);

  if (operation === 'sendWhatsAppMessage') {
    if (validation.product === 'notifier') return 'sendMessage';
    if (validation.product === 'whatsable') return 'sendWhatsableMessage';
  }

  if (operation === 'sendWhatsAppMessageToGroup') return 'sendWhatsableGroupMessage';
  if (operation === 'manageContact') return 'updateContact';
  if (operation === 'messageStatus') return 'getMessageStatus';

  throw new z.errors.Error(`Unsupported product type: ${validation.product}`, 'Error');
};

const withFixedOperation = (operation, bundle) => ({
  ...bundle,
  inputData: {
    ...bundle.inputData,
    operation,
  },
});

const perform = async (z, bundle) => {
  await validateApiKey(z, bundle);

  const input = bundle.inputData;
  const operation = input.operation;
  const productOperation = await resolveProductOperation(z, bundle, operation);

  if (operation === 'sendWhatsAppMessage') {
    if (productOperation === 'sendMessage') {
      return request(z, bundle, {
        method: 'POST',
        url: 'https://api.insightssystem.com/api:-GWQv5aM/zapier/send-message',
        body: {
          phone: input.recipient,
          text: input.message,
          attachment: input.attachment || '',
          filename: input.filename || '',
        },
      });
    }

    if (productOperation === 'sendNotifyerTemplate') {
      return sendNotifyerTemplate(z, bundle, false);
    }

    if (productOperation === 'sendNonTemplateMessage') {
      return request(z, bundle, {
        method: 'POST',
        url: 'https://api.insightssystem.com/api:hFrjh8a1/zapier/messages/non-template/send',
        body: buildNonTemplateMessageBody(input),
      });
    }

    if (productOperation === 'updateContact') {
      return sendUpdateContact(z, bundle, input);
    }

    if (productOperation === 'sendWhatsableMessage') {
      return request(z, bundle, {
        method: 'POST',
        url: `${BASE_URLS.WHATSABLE}/whatsable-send-message`,
        body: {
          to: input.whatsableTo,
          text: input.whatsableText,
          attachment: input.whatsableAttachment || '',
          filename: input.whatsableFilename || '',
        },
      });
    }

    throw new z.errors.Error(`Product operation ${productOperation} is not supported`, 'Error');
  }

  if (operation === 'scheduleWhatsAppMessage') {
    if (productOperation === 'sendNotifyerTemplate') {
      return sendNotifyerTemplate(z, bundle, true);
    }

    if (productOperation === 'sendNonTemplateMessage') {
      return request(z, bundle, {
        method: 'POST',
        url: 'https://api.insightssystem.com/api:hFrjh8a1/zapier/messages/non-template/send',
        body: buildScheduledNonTemplateMessageBody(input),
      });
    }

    throw new z.errors.Error(`Configuration ${productOperation} is not supported for scheduling`, 'Error');
  }

  if (operation === 'manageContact') {
    if (productOperation === 'updateContact') {
      return sendUpdateContact(z, bundle, input);
    }

    throw new z.errors.Error(`Product operation ${productOperation} is not supported for manage contact`, 'Error');
  }

  if (operation === 'sendWhatsAppMessageToGroup') {
    if (productOperation === 'sendWhatsableGroupMessage') {
      const group = JSON.parse(input.whatsableGroup);

      return request(z, bundle, {
        method: 'POST',
        url: `${WHATSABLE_DASHBOARD_BASE_DOMAIN}/api/whatsapp/messages/v2.0.0/group-send`,
        body: {
          groupId: group.group_id,
          message: input.whatsableGroupMessage,
          session: group.session_id,
        },
      });
    }

    throw new z.errors.Error(`Product operation ${productOperation} is not supported for group messages`, 'Error');
  }

  if (operation === 'messageStatus') {
    if (productOperation === 'getMessageStatus') {
      const messageId = (input.messageId || '').trim();
      if (!messageId) {
        throw new z.errors.Error('Message ID is required.', 'Error');
      }

      return request(z, bundle, {
        method: 'GET',
        url: `${ACTION_URLS.MESSAGE_STATUS}/${encodeURIComponent(messageId)}`,
      });
    }

    throw new z.errors.Error(`Product operation ${productOperation} is not supported for message status`, 'Error');
  }

  throw new z.errors.Error(`Operation ${operation} is not supported`, 'Error');
};

const buildActionCreate = ({
  key,
  noun,
  label,
  description,
  operation,
  getInputFields,
  sample = defaultActionSample,
  outputFields = defaultActionOutputFields,
}) => ({
  key,
  noun,
  display: {
    label,
    description,
    hidden: false,
  },
  operation: {
    inputFields: [getInputFields],
    perform: async (z, bundle) => perform(z, withFixedOperation(operation, bundle)),
    sample,
    outputFields,
  },
});

const sendWhatsAppMessage = buildActionCreate({
  key: 'send_whatsapp_message',
  noun: 'WhatsApp Message',
  label: 'Send WhatsApp Message',
  description:
    'Send WhatsApp Messages using the official WhatsApp API. You can add labels to a WhatsApp conversation and also write notes about the lead that will appear in WhatsAble\'s chat interface.',
  operation: 'sendWhatsAppMessage',
  getInputFields: sendWhatsAppMessageFields,
});

const scheduleFollowUpMessage = buildActionCreate({
  key: 'schedule_follow_up_message',
  noun: 'Scheduled Message',
  label: 'Schedule a Follow-Up Message',
  description:
    'Schedule a follow-up to get sent later and add conditions so it only gets sent if the lead did not reply to you.',
  operation: 'scheduleWhatsAppMessage',
  getInputFields: scheduleFollowUpMessageFields,
});

const sendWhatsAppMessageToGroup = buildActionCreate({
  key: 'send_whatsapp_message_to_group',
  noun: 'Group Message',
  label: 'Send WhatsApp Message to a Group (Beta)',
  description:
    'Send a WhatsApp message to a group. This is not with the official API and is a separate offering.',
  operation: 'sendWhatsAppMessageToGroup',
  getInputFields: sendGroupMessageFields,
});

const updateContact = buildActionCreate({
  key: 'update_contact',
  noun: 'Contact',
  label: 'Update a Contact',
  description:
    'Assign conversation to someone in your team, Add information in the notes, add/remove labels. Simply put the phone number and what information you want to change. This appears in the chat interface of our system.',
  operation: 'manageContact',
  getInputFields: updateContactActionFields,
});

const getMessageDeliveryStatus = buildActionCreate({
  key: 'get_message_delivery_status',
  noun: 'Message Status',
  label: 'Get Delivery Status of a Message',
  description:
    'Check if the message was delivered or not.  Use this if you\'re not sure the number is correct and want to check if it was delivered and want to send a fallback email.',
  operation: 'messageStatus',
  getInputFields: getMessageDeliveryStatusFields,
  sample: messageStatusSample,
  outputFields: messageStatusOutputFields,
});

module.exports = {
  sendWhatsAppMessage,
  scheduleFollowUpMessage,
  sendWhatsAppMessageToGroup,
  updateContact,
  getMessageDeliveryStatus,
};
