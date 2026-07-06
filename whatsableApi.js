const { BASE_URLS, WHATSABLE_DASHBOARD_BASE_DOMAIN } = require('./constants');

const PRODUCT_OPERATIONS = {
  whatsable: {
    sendWhatsAppMessage: [
      {
        id: 'sendWhatsableMessage',
        name: 'Send Message Via Whatsable',
        description: 'Send WhatsApp messages via WhatsAble platform',
      },
    ],
    sendWhatsAppMessageToGroup: [
      {
        id: 'sendWhatsableGroupMessage',
        name: 'Send WhatsApp message to a group (beta)',
        description: 'Send a WhatsApp message to a group. This is not with the official API.',
      },
    ],
  },
  notifier: {
    sendWhatsAppMessage: [
      {
        id: 'sendMessage',
        name: 'Send Message Via Notifier',
        description: 'Send WhatsApp messages with optional attachments',
      },
    ],
  },
  notifyer: {
    sendWhatsAppMessage: [
      {
        id: 'sendNotifyerTemplate',
        name: 'Send WhatsApp Template (to start conversation)',
        description: 'Send a WhatsApp template message to start a conversation',
      },
      {
        id: 'sendNonTemplateMessage',
        name: 'Send a non-template message (person must write to you first)',
        description: 'Send a non-template message after the person has messaged you first',
      },
    ],
    manageContact: [
      {
        id: 'updateContact',
        name: 'Update a Contact',
        description: 'Update notes, labels, and contact details in the chat interface',
      },
    ],
    scheduleWhatsAppMessage: [
      {
        id: 'sendNotifyerTemplate',
        name: 'Schedule WhatsApp Template (to start conversation)',
        description: 'Schedule a template message to start a conversation later',
      },
      {
        id: 'sendNonTemplateMessage',
        name: 'Schedule a non-template message (person must write to you first)',
        description: 'Schedule a non-template message after the person has messaged you first',
      },
    ],
    messageStatus: [
      {
        id: 'getMessageStatus',
        name: 'Get delivery status of a message',
        description: 'Check whether a message was delivered, read, or failed',
      },
    ],
  },
};

const MESSAGE_TYPES = [
  { id: 'audio', name: 'Audio Message' },
  { id: 'document', name: 'Document Message' },
  { id: 'image', name: 'Image Message' },
  { id: 'text', name: 'Text Message' },
  { id: 'video', name: 'Video Message' },
];

const REPLY_CONDITIONS = [
  {
    id: 'never',
    name: 'Recipient did not reply after my last message',
    description:
      'Send the scheduled message at the schedule time only if the recipient has not replied since my most recent message.',
  },
  {
    id: 'never-replied',
    name: 'Recipient never replied to any of my messages',
    description:
      'Send the scheduled message at the schedule time only if the recipient has never replied to any of my messages.',
  },
  {
    id: '20m',
    name: 'Recipient did not reply within 20 minutes after my last message',
    description:
      'Send the scheduled message at the schedule time only if the recipient did not reply within 20 minutes after my last message.',
  },
  {
    id: '45m',
    name: 'Recipient did not reply within 45 minutes after my last message',
    description:
      'Send the scheduled message at the schedule time only if the recipient did not reply within 45 minutes after my last message.',
  },
  {
    id: '3h',
    name: 'Recipient did not reply within 3 hours after my last message',
    description:
      'Send the scheduled message at the schedule time only if the recipient did not reply within 3 hours after my last message.',
  },
  {
    id: '6h',
    name: 'Recipient did not reply within 6 hours after my last message',
    description:
      'Send the scheduled message at the schedule time only if the recipient did not reply within 6 hours after my last message.',
  },
  {
    id: '12h',
    name: 'Recipient did not reply within 12 hours after my last message',
    description:
      'Send the scheduled message at the schedule time only if the recipient did not reply within 12 hours after my last message.',
  },
  {
    id: '24h',
    name: 'Recipient did not reply within 24 hours after my last message',
    description:
      'Send the scheduled message at the schedule time only if the recipient did not reply within 24 hours after my last message.',
  },
  {
    id: '48h',
    name: 'Recipient did not reply within 48 hours after my last message',
    description:
      'Send the scheduled message at the schedule time only if the recipient did not reply within 48 hours after my last message.',
  },
  {
    id: '72h',
    name: 'Recipient did not reply within 72 hours after my last message',
    description:
      'Send the scheduled message at the schedule time only if the recipient did not reply within 72 hours after my last message.',
  },
];

const getReplyConditionDescription = (conditionId) => {
  const condition = REPLY_CONDITIONS.find((item) => item.id === conditionId);
  return condition ? condition.description : null;
};

const LABEL_CONDITIONS = [
  { id: 'include', name: 'Include' },
  { id: 'not', name: 'Does Not Include' },
];

const TIME_UNITS = [
  { id: 'days', name: 'Days' },
  { id: 'hours', name: 'Hours' },
  { id: 'min', name: 'Minutes' },
];

const TIME_VALUES = [1, 2, 3, 4, 5, 10, 15, 20, 30, 60, 90, 120].map((value) => ({
  id: value,
  name: String(value),
}));

const getApiKey = (bundle) => bundle.authData && bundle.authData.apiKey;

const extractJson = (response) => response.json || response.data || {};

const parseErrorBody = (body) => {
  if (body == null || body === '') {
    return {};
  }

  if (typeof body === 'string') {
    const trimmed = body.trim();
    if (!trimmed) {
      return {};
    }

    try {
      return JSON.parse(trimmed);
    } catch (error) {
      return { message: trimmed };
    }
  }

  return body;
};

const formatApiErrorMessage = (body) => {
  const parsed = parseErrorBody(body);

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return null;
  }

  const message = parsed.message || parsed.description || parsed.error;
  const code = parsed.code || parsed.error_code;

  if (message) {
    return String(message).trim();
  }

  if (code) {
    return String(code).trim();
  }

  if (typeof parsed.payload === 'string' && parsed.payload.trim()) {
    return parsed.payload.trim();
  }

  return null;
};

const isApiErrorPayload = (data) =>
  data &&
  typeof data === 'object' &&
  !Array.isArray(data) &&
  (data.success === false || (data.code && String(data.code).startsWith('ERROR_CODE_')));

const getErrorMessage = (errorOrResponse) => {
  if (!errorOrResponse) {
    return 'Unexpected error';
  }

  if (
    errorOrResponse.code ||
    errorOrResponse.message ||
    errorOrResponse.description ||
    errorOrResponse.success === false
  ) {
    const direct = formatApiErrorMessage(errorOrResponse);
    if (direct) {
      return direct;
    }
  }

  const response = errorOrResponse.response || errorOrResponse;
  const bodySources = [
    response && response.json,
    response && response.data,
    response && response.body,
    response && response.content,
    errorOrResponse.json,
    errorOrResponse.content,
  ];

  for (const source of bodySources) {
    const formatted = formatApiErrorMessage(source);
    if (formatted) {
      return formatted;
    }
  }

  if (errorOrResponse.message) {
    const fromMessage = formatApiErrorMessage(errorOrResponse.message);
    if (fromMessage) {
      return fromMessage;
    }

    const fallback = String(errorOrResponse.message).trim();
    if (fallback && !fallback.startsWith('{')) {
      return fallback;
    }
  }

  return 'Unexpected error';
};

const throwZapierError = (z, message, type = 'Error', status) => {
  throw new z.errors.Error(message, type, status);
};

const handleApiResponse = (response, z) => {
  if (response.status >= 400) {
    const message = getErrorMessage(response);
    const type = response.status === 401 || response.status === 403 ? 'AuthenticationError' : 'Error';
    throwZapierError(z, message, type, response.status);
  }

  const data = extractJson(response);

  if (isApiErrorPayload(data)) {
    const message = getErrorMessage(data) || 'Request failed';
    throwZapierError(z, message, 'Error', response.status);
  }

  return data;
};

const request = async (z, bundle, options) => {
  const apiKey = getApiKey(bundle);
  const headers = {
    Accept: 'application/json',
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...(apiKey ? { Authorization: apiKey } : {}),
    ...(options.headers || {}),
  };

  const response = await z.request({
    ...options,
    headers,
  });

  return handleApiResponse(response, z);
};

const validateApiKey = async (z, bundle) => {
  try {
    const response = await request(z, bundle, {
      method: 'GET',
      url: `${BASE_URLS.VALIDATION}/check-api-key-across-projects`,
    });

    if (!response.success) {
      throwZapierError(z, `API key validation failed: ${response.message}`, 'AuthenticationError');
    }

    return response;
  } catch (error) {
    if (error.name === 'Error' || error.name === 'AuthenticationError') {
      throw error;
    }

    throwZapierError(z, `API key validation failed: ${getErrorMessage(error)}`, 'AuthenticationError');
  }
};

const getProductOperations = async (z, bundle) => {
  try {
    const validation = await validateApiKey(z, bundle);
    const operation = bundle.inputData.operation || 'sendWhatsAppMessage';
    const operations = (PRODUCT_OPERATIONS[validation.product] && PRODUCT_OPERATIONS[validation.product][operation]) || [];

    if (operations.length) {
      return operations;
    }

    return [
      {
        id: 'unknown',
        name: 'Unknown Product Type',
        description: 'Product type not recognized',
      },
    ];
  } catch (error) {
    return [
      {
        id: 'error',
        name: `Error: ${getErrorMessage(error)}`,
        description: 'Failed to load product operations',
      },
    ];
  }
};

const formatTextForZapierDisplay = (text) =>
  String(text)
    .replace(/\{\{/g, '&#123;&#123;')
    .replace(/\}\}/g, '&#125;&#125;');

const truncateTemplateBody = (body, maxLength = 220) => {
  const normalized = String(body || '').trim();
  if (!normalized) {
    return '';
  }

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength - 3)}...`;
};

const normalizeTemplates = (response) => {
  const templates = Array.isArray(response) ? response : response && Array.isArray(response.templates) ? response.templates : [];

  return templates
    .map((template) => {
      const templateId = template && (template.template_id || template.id);
      if (!templateId) {
        return null;
      }

      const bodyPreview = truncateTemplateBody(template.body);

      return {
        id: String(templateId),
        name: template.name_with_details || template.name || templateId,
        description: bodyPreview
          ? formatTextForZapierDisplay(bodyPreview)
          : template.type
            ? `Type: ${template.type}, Language: ${template.language || 'Unknown'}, Variables: ${template.variable_counts || 0}`
            : '',
      };
    })
    .filter(Boolean);
};

const getTemplates = async (z, bundle) => {
  const templateUrls = [
    'https://api.insightssystem.com/api:AFRA_QCy/templates',
    `${BASE_URLS.NOTIFYER}/n8n-templates`,
  ];

  try {
    for (const url of templateUrls) {
      try {
        const response = await request(z, bundle, {
          method: 'GET',
          url,
        });

        const templates = normalizeTemplates(response);
        if (templates.length) {
          return templates;
        }
      } catch (error) {
        // Try next endpoint fallback.
      }
    }

    return [{ id: 'notfound', name: 'No templates found', description: 'No templates were found for this user' }];
  } catch (error) {
    return [{ id: 'error', name: `Error: ${getErrorMessage(error)}`, description: 'Failed to load templates' }];
  }
};

const normalizeLabels = (response) => {
  if (Array.isArray(response)) {
    return response
      .map((label) => {
        if (typeof label === 'string') {
          return { id: label, name: label, description: 'Label' };
        }

        if (label && (label.label || label.name || label.value)) {
          const value = label.value || label.label || label.name;
          const name = label.label || label.name || label.value;
          return { id: String(value), name: String(name), description: 'Label' };
        }

        return null;
      })
      .filter(Boolean);
  }

  if (response && response.result && Array.isArray(response.result.options)) {
    return response.result.options
      .map((option) => {
        const value = option && (option.value || option.label);
        const name = option && (option.label || option.value);
        return value && name ? { id: String(value), name: String(name), description: 'Label' } : null;
      })
      .filter(Boolean);
  }

  return [];
};

const getLabels = async (z, bundle) => {
  const labelUrls = [
    'https://api.insightssystem.com/api:5kFCwVpE/labels/get_labels',
    `${BASE_URLS.NOTIFYER}/n8n/label`,
  ];

  try {
    for (const url of labelUrls) {
      try {
        const response = await request(z, bundle, {
          method: 'GET',
          url,
        });
        const labels = normalizeLabels(response);
        if (labels.length) {
          // Keep legacy get_labels.js output behavior stable and predictable
          // by returning unique labels in API order.
          const seen = new Set();
          return labels.filter((label) => {
            const key = `${label.id}::${label.name}`;
            if (seen.has(key)) {
              return false;
            }
            seen.add(key);
            return true;
          });
        }
      } catch (error) {
        // Try next endpoint fallback.
      }
    }

    return [{ id: 'notfound', name: 'No labels found', description: 'No labels were found for this user' }];
  } catch (error) {
    return [{ id: 'error', name: `Error: ${getErrorMessage(error)}`, description: 'Failed to load labels' }];
  }
};

const getLabelsForRemoveContact = async (z, bundle) => {
  const labels = await getLabels(z, bundle);
  return [
    { id: '__REMOVE_ALL__', name: 'Remove All', description: 'Remove all labels from the contact' },
    ...labels.filter((label) => label.id !== 'error' && label.id !== 'notfound'),
  ];
};

const buildUpdateContactLabelsPayload = (labels, selectedRemoveLabels) => {
  const addLabels = parseList(labels);
  const removeLabels = parseList(selectedRemoveLabels);

  if (removeLabels.includes('__REMOVE_ALL__')) {
    return { labels: [], selected_labels: ['__REMOVE_ALL__'] };
  }

  return {
    labels: addLabels.length > 0 ? addLabels : [],
    selected_labels: removeLabels.length > 0 ? removeLabels : [],
  };
};

const getPhoneNumbers = async (z, bundle) => {
  try {
    const response = await request(z, bundle, {
      method: 'GET',
      url: 'https://api.insightssystem.com/api:hFrjh8a1/zapier/phone/number/list',
    });

    if (!Array.isArray(response)) {
      return [{ id: 'notfound', name: 'No phone numbers found', description: 'No phone numbers were found for this user' }];
    }

    return response
      .filter((phoneNumber) => phoneNumber.phone_number_value)
      .map((phoneNumber) => ({
        id: phoneNumber.phone_number_value,
        name: phoneNumber.phone_number_label || phoneNumber.phone_number_value,
        description: 'Phone number',
      }));
  } catch (error) {
    return [{ id: 'error', name: `Error: ${getErrorMessage(error)}`, description: 'Failed to load phone numbers' }];
  }
};

const getWhatsAppNumbers = async (z, bundle) => {
  try {
    const response = await request(z, bundle, {
      method: 'GET',
      url: `${BASE_URLS.VALIDATION}/get-whatsable-numbers`,
    });

    if (!Array.isArray(response)) {
      return [{ id: 'notfound', name: 'No numbers found', description: 'No WhatsApp numbers were found for this user' }];
    }

    return response
      .filter((number) => number.phone_number)
      .map((number) => ({ id: number.phone_number, name: number.phone_number, description: 'WhatsApp number' }));
  } catch (error) {
    return [{ id: 'error', name: `Error: ${getErrorMessage(error)}`, description: 'Failed to load WhatsApp numbers' }];
  }
};

const getGroups = async (z, bundle) => {
  try {
    const response = await request(z, bundle, {
      method: 'GET',
      url: `${WHATSABLE_DASHBOARD_BASE_DOMAIN}/api/groups/automation/groups`,
    });

    if (!response.groups || !Array.isArray(response.groups)) {
      return [{ id: 'notfound', name: 'No groups found', description: 'No groups were found for this user' }];
    }

    return response.groups
      .filter((group) => group.label_name && group.value_for)
      .map((group) => ({
        id: JSON.stringify({ group_id: group.value_for, session_id: group.session_id }),
        name: group.label_name,
        description: `Group ID: ${group.value_for}`,
      }));
  } catch (error) {
    return [{ id: 'error', name: `Error: ${getErrorMessage(error)}`, description: 'Failed to load groups' }];
  }
};

const parseTemplate = (templateValue) => {
  if (!templateValue || templateValue === 'notfound' || templateValue === 'error') {
    return null;
  }

  try {
    return JSON.parse(templateValue);
  } catch (error) {
    return { template_id: String(templateValue) };
  }
};

const getTemplateFormatFields = (templateData) => {
  const fields = [];
  const format = templateData && templateData.template_formate;

  if (typeof format !== 'string' || !format.trim()) {
    return fields;
  }

  const tokens = [...format.matchAll(/\[([a-zA-Z]+):(\d+)\]/g)];
  let bodyCount = 0;
  let hasVisitWebsite = false;

  tokens.forEach(([, tokenTypeRaw, countRaw]) => {
    const tokenType = tokenTypeRaw.toLowerCase();
    const count = Number(countRaw) || 0;

    if (tokenType === 'b') {
      bodyCount += count;
    }

    if (tokenType === 'u' && count > 0) {
      hasVisitWebsite = true;
    }
  });

  for (let index = 1; index <= bodyCount; index += 1) {
    fields.push({
      key: `body${index}`,
      label: `Body ${index}`,
      type: 'string',
      required: true,
    });
  }

  if (hasVisitWebsite) {
    fields.push({
      key: 'visit_website',
      label: 'Visit Website URL',
      type: 'string',
      required: true,
    });
  }

  return fields;
};

const getTemplateFromTemplatesApi = async (z, bundle, templateValue) => {
  const parsedTemplate = parseTemplate(templateValue);
  const templateId = (parsedTemplate && (parsedTemplate.template_id || parsedTemplate.id)) || templateValue;

  if (
    parsedTemplate &&
    (parsedTemplate.components || parsedTemplate.template_formate || parsedTemplate.variable_counts)
  ) {
    return parsedTemplate;
  }

  const templateUrls = [
    'https://api.insightssystem.com/api:AFRA_QCy/templates',
    `${BASE_URLS.NOTIFYER}/n8n-templates`,
  ];

  for (const url of templateUrls) {
    try {
      const response = await request(z, bundle, {
        method: 'GET',
        url,
      });
      const templates = Array.isArray(response) ? response : response && Array.isArray(response.templates) ? response.templates : [];
      const match = templates.find(
        (template) => String(template.template_id || template.id) === String(templateId)
      );

      if (match) {
        return {
          ...match,
          template_id: match.template_id || match.id || templateId,
        };
      }
    } catch (error) {
      // Try next endpoint fallback.
    }
  }

  return parsedTemplate || { template_id: String(templateId) };
};

const getTemplateBodyFromTemplatesApi = async (z, bundle, templateValue) => {
  const template = await getTemplateFromTemplatesApi(z, bundle, templateValue);
  return template && template.body && String(template.body).trim() ? String(template.body).trim() : '';
};

const getTemplateDynamicFieldsFromApi = async (z, bundle, templateValue) => {
  if (!z || !bundle || !templateValue) {
    return { template_info: '', dynamic_input_fields: [] };
  }

  const parsedTemplate = parseTemplate(templateValue);
  const templateParam =
    (parsedTemplate && (parsedTemplate.template_id || parsedTemplate.id)) || templateValue;

  const dynamicFieldUrls = [
    'https://api.insightssystem.com/api:AFRA_QCy/zapier_dynamic_fields_template_details',
  ];

  for (const url of dynamicFieldUrls) {
    try {
      const response = await request(z, bundle, {
        method: 'GET',
        url,
        params: { template: templateParam },
      });

      if (
        response &&
        (response.template_info ||
          (Array.isArray(response.dynamic_input_fields) && response.dynamic_input_fields.length))
      ) {
        return {
          template_info: response.template_info || '',
          dynamic_input_fields: Array.isArray(response.dynamic_input_fields)
            ? response.dynamic_input_fields
            : [],
        };
      }
    } catch (error) {
      // Try next URL fallback.
    }
  }

  return { template_info: '', dynamic_input_fields: [] };
};

const parseVariableExamplesFromHelpText = (helpText) => {
  const examples = {};
  const matches = String(helpText || '').matchAll(/\{\{(\d+)\}\}\s*=\s*([^\n,]+)/g);

  for (const [, variableNumber, exampleValue] of matches) {
    examples[variableNumber] = exampleValue.trim();
  }

  return examples;
};

const getDynamicFieldVariableIndex = (key, examples) => {
  if (!key) {
    return null;
  }

  const bodyMatch = String(key).match(/^body(\d+)?$/i);
  if (bodyMatch) {
    if (bodyMatch[1]) {
      return Number(bodyMatch[1]);
    }

    const exampleNumbers = Object.keys(examples);
    if (exampleNumbers.length === 1) {
      return Number(exampleNumbers[0]);
    }

    return 1;
  }

  return null;
};

const normalizeBodyFieldLabel = (baseLabel, variableIndex) => {
  if (variableIndex && /^body(\s*\d+)?$/i.test(String(baseLabel).trim())) {
    return `Body ${variableIndex}`;
  }

  return baseLabel;
};

const isMediaDynamicField = (field) => {
  const key = String(field.key || '').toLowerCase();
  const label = String(field.label || '').toLowerCase();

  return key === 'media' || label.startsWith('media');
};

const buildDynamicFieldLabel = (field) => {
  if (isMediaDynamicField(field)) {
    return 'Media: See above Template Preview';
  }

  const baseLabel = field.label || field.key || 'Field';
  const examples = parseVariableExamplesFromHelpText(field.helpText);
  const variableIndex = getDynamicFieldVariableIndex(field.key, examples);
  const labelPrefix = normalizeBodyFieldLabel(baseLabel, variableIndex);

  if (variableIndex && examples[String(variableIndex)]) {
    return `${labelPrefix} — Example: ${examples[String(variableIndex)]}`;
  }

  const simpleExampleMatch = String(field.helpText || '').match(/Example[s]?:\s*([^\n]+)/i);
  if (simpleExampleMatch) {
    const exampleText = simpleExampleMatch[1]
      .replace(/\{\{\d+\}\}\s*=\s*/g, '')
      .replace(/\s*,\s*\{\{\d+\}\}\s*=\s*/g, ', ')
      .trim();

    if (exampleText) {
      return `${labelPrefix} — Example: ${exampleText}`;
    }
  }

  return baseLabel;
};

const buildDynamicFieldHelpText = (field) => {
  const helpText = String(field.helpText || '').trim();
  if (!helpText) {
    return helpText;
  }

  const withoutExampleLine = helpText
    .replace(/\n*Example[s]?:[^\n]*$/im, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return formatTextForZapierDisplay(withoutExampleLine || helpText);
};

const normalizeDynamicInputFields = (fields) =>
  fields.map((field) => ({
    type: 'string',
    list: false,
    altersDynamicFields: false,
    ...field,
    label: buildDynamicFieldLabel(field),
    helpText: field.helpText ? buildDynamicFieldHelpText(field) : field.helpText,
  }));

const getTemplatePreviewInfoField = async (z, bundle, templateValue, apiData = null) => {
  if (!templateValue || templateValue === 'notfound' || templateValue === 'error') {
    return null;
  }

  const dynamicApiData =
    apiData || (z && bundle ? await getTemplateDynamicFieldsFromApi(z, bundle, templateValue) : null);
  const apiTemplateInfo = dynamicApiData && dynamicApiData.template_info ? dynamicApiData.template_info : '';

  let fallbackData = parseTemplate(templateValue) || {};
  if (!apiTemplateInfo && z && bundle) {
    fallbackData = await getTemplateFromTemplatesApi(z, bundle, templateValue);
  }

  const previewText = buildTemplatePreviewText(fallbackData, apiTemplateInfo);
  const displayPreview = previewText ? formatTextForZapierDisplay(previewText) : '';

  return {
    key: 'template_info',
    label: 'Template Preview',
    type: 'copy',
    helpText: displayPreview || 'Template preview is not available for this template.',
    required: false,
    list: false,
    altersDynamicFields: false,
  };
};

const buildTemplatePreviewText = (templateData, apiTemplateInfo = '') => {
  if (apiTemplateInfo && String(apiTemplateInfo).trim()) {
    return String(apiTemplateInfo).trim();
  }

  if (templateData && templateData.body && String(templateData.body).trim()) {
    return String(templateData.body).trim();
  }

  if (!templateData) {
    return '';
  }

  if (templateData.components && Array.isArray(templateData.components.components)) {
    const parts = [];

    templateData.components.components.forEach((component) => {
      if (component.type === 'HEADER') {
        if (component.format && component.format !== 'TEXT') {
          parts.push(`**Header:** ${component.format} media`);
        } else if (component.text) {
          parts.push(`**Header:** ${component.text}`);
        }
      }

      if (component.type === 'BODY' && component.text) {
        parts.push(`**Body:** ${component.text}`);
      }

      if (component.type === 'FOOTER' && component.text) {
        parts.push(`**Footer:** ${component.text}`);
      }

      if (component.type === 'BUTTONS' && Array.isArray(component.buttons)) {
        const buttonLabels = component.buttons
          .map((button) => button.text || button.type)
          .filter(Boolean)
          .join(', ');
        if (buttonLabels) {
          parts.push(`**Buttons:** ${buttonLabels}`);
        }
      }
    });

    if (parts.length) {
      return parts.join('\n\n');
    }
  }

  if (templateData.template_formate) {
    return `**Template format:** ${templateData.template_formate}`;
  }

  return '';
};

const getTemplateVariableFields = async (...args) => {
  const [arg1, arg2, arg3, arg4] = args;
  const hasZapierContext = typeof arg1 === 'object' && arg1 && typeof arg1.request === 'function';
  const z = hasZapierContext ? arg1 : null;
  const bundle = hasZapierContext ? arg2 : null;
  const templateValue = hasZapierContext ? arg3 : arg1;
  const apiData = hasZapierContext ? arg4 : null;

  let templateData = parseTemplate(templateValue);
  const fields = [];

  if (!templateData) {
    return fields;
  }

  if (z && bundle) {
    const dynamicApiData =
      apiData || (await getTemplateDynamicFieldsFromApi(z, bundle, templateValue));

    if (dynamicApiData.dynamic_input_fields.length) {
      return normalizeDynamicInputFields(dynamicApiData.dynamic_input_fields);
    }

    templateData = await getTemplateFromTemplatesApi(z, bundle, templateValue);
  }

  if (!templateData.components || !Array.isArray(templateData.components.components)) {
    const fallbackFields = getTemplateFormatFields(templateData);

    if (fallbackFields.length) {
      return fallbackFields;
    }

    const variableCount = Number(templateData.variable_counts) || 0;
    for (let index = 1; index <= variableCount; index += 1) {
      fields.push({
        key: `body${index}`,
        label: `Body ${index}`,
        type: 'string',
        required: true,
      });
    }

    return fields;
  }

  const components = templateData.components.components;
  const bodyComponent = components.find((component) => component.type === 'BODY');
  const bodyVariables = bodyComponent && bodyComponent.text ? bodyComponent.text.match(/\{\{\d+\}\}/g) || [] : [];

  bodyVariables.forEach((_, index) => {
    const example =
      bodyComponent.example &&
      bodyComponent.example.body_text &&
      bodyComponent.example.body_text[0] &&
      bodyComponent.example.body_text[0][index]
        ? bodyComponent.example.body_text[0][index]
        : `Variable ${index + 1}`;

    fields.push({
      key: `body${index + 1}`,
      label: `Body ${index + 1}. Example: ${example}`,
      type: 'string',
      required: true,
    });
  });

  components.forEach((component) => {
    if (component.type === 'BUTTONS') {
      const urlButton = component.buttons && component.buttons.find((button) => button.type === 'URL');
      if (urlButton && urlButton.url && urlButton.url.includes('{{')) {
        fields.push({
          key: 'visit_website',
          label: `Visit Website URL. Example: ${urlButton.url.replace(/\{\{\d+\}\}/g, 'your-value')}`,
          type: 'string',
          required: true,
        });
      }
    }

    if (component.type === 'HEADER' && component.format !== 'TEXT') {
      fields.push({
        key: 'media',
        label: 'Media: See above Template Preview',
        type: 'string',
        required: true,
      });
    }
  });

  return fields;
};

const getTemplateVariables = (templateValue, inputData) => {
  const templateData = parseTemplate(templateValue);
  const variables = {};

  if (!templateData) {
    return variables;
  }

  if (!templateData.components || !Array.isArray(templateData.components.components)) {
    Object.keys(inputData || {}).forEach((key) => {
      if (key === 'visit_website' || key === 'media' || key === 'body' || key.startsWith('body')) {
        variables[key] = inputData[key];
      }
    });
    return variables;
  }

  const components = templateData.components.components;
  const hasMediaHeader = components.some((component) => component.type === 'HEADER' && component.format !== 'TEXT');
  const hasUrlButton = components.some(
    (component) => component.type === 'BUTTONS' && component.buttons && component.buttons.some((button) => button.type === 'URL')
  );

  Object.keys(inputData || {}).forEach((key) => {
    if (key === 'media' && hasMediaHeader) {
      variables.media = inputData[key];
    } else if (key === 'visit_website' && hasUrlButton) {
      variables.visit_website = inputData[key];
    } else if (key.startsWith('body')) {
      variables[key] = inputData[key];
    }
  });

  return variables;
};

const parseZapierDatetimeToLegacy = (value) => {
  const trimmed = String(value).trim();

  const dateOnlyMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (dateOnlyMatch) {
    return {
      year: dateOnlyMatch[1],
      month: dateOnlyMatch[2],
      day: dateOnlyMatch[3],
      hour: '00',
      minute: '00',
      second: '00',
    };
  }

  const match = trimmed.match(
    /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?(?:\.\d{1,3})?(?:[zZ]|[+-]\d{2}:?\d{2})?$/
  );

  if (!match) {
    return null;
  }

  return {
    year: match[1],
    month: match[2],
    day: match[3],
    hour: match[4],
    minute: match[5],
    second: (match[6] || '00').padStart(2, '0'),
  };
};

const formatScheduleDatetimeForApi = (value, fieldLabel = 'Scheduled Date and Time') => {
  if (value === undefined || value === null || value === '') {
    throw new Error(`${fieldLabel} is required.`);
  }

  const parts = parseZapierDatetimeToLegacy(value);
  if (!parts) {
    throw new Error(`${fieldLabel} must use format 2026-06-08 17:20`);
  }

  return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}`;
};

const formatTemplateScheduleDatetime = formatScheduleDatetimeForApi;
const formatNonTemplateScheduleDatetime = formatScheduleDatetimeForApi;

const formatScheduleDatetimeUtcIso = formatScheduleDatetimeForApi;

const parseList = (value) => {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const parseConditions = (value) => {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch (error) {
      return [];
    }
  }

  return [];
};

const buildConditionPayload = (conditions) => {
  const andConditions = [];
  const orConditions = [];

  parseConditions(conditions).forEach((condition, index, allConditions) => {
    const { field, operator, value } = condition || {};
    if (!field || !operator) {
      return;
    }

    const operatorNeedsValue = operator !== 'basic:exists' && operator !== 'basic:notexists';
    if (operatorNeedsValue && (!value || String(value).trim() === '')) {
      return;
    }

    const conditionObj = { a: field, o: operator };
    if (operatorNeedsValue) {
      conditionObj.b = value;
    }

    if (index === 0 || (allConditions[index - 1].operatorType || 'AND') === 'AND') {
      andConditions.push(conditionObj);
    } else {
      orConditions.push(conditionObj);
    }
  });

  return [andConditions, orConditions];
};

const buildSearchPayload = (inputData) => {
  if (!inputData.enableConditions) {
    return {};
  }

  const payload = {};
  const conversationConditions = buildConditionPayload(inputData.conditions);
  const integrationConditions = buildConditionPayload(inputData.conditions2);

  if (conversationConditions[0].length || conversationConditions[1].length) {
    payload.search2 = conversationConditions;
  }

  if (integrationConditions[0].length || integrationConditions[1].length) {
    payload.search1 = integrationConditions;
  }

  return payload;
};

const buildNonTemplateMessageBody = (inputData) => {
  const base = {
    to: inputData.nonTemplateRecipient,
    type: inputData.messageType,
    recipient_type: 'individual',
    messaging_product: 'whatsapp',
    labels: parseList(inputData.nonTemplateLabels),
  };

  if (inputData.messageType === 'text') {
    base.text = {
      body: inputData.messageContent,
      preview_url: Boolean(inputData.enableLinkPreview),
    };
  } else if (inputData.messageType === 'document') {
    base.document = {
      link: inputData.documentUrl,
      caption: inputData.documentCaption || '',
      filename: inputData.documentFilename,
    };
  } else if (inputData.messageType === 'image') {
    base.image = {
      link: inputData.imageUrl,
      caption: inputData.imageCaption || '',
    };
  } else if (inputData.messageType === 'video') {
    base.video = {
      link: inputData.videoUrl,
      caption: inputData.videoCaption || '',
    };
  } else if (inputData.messageType === 'audio') {
    base.audio = {
      link: inputData.audioUrl,
    };
  }

  if (inputData.nonTemplateNote) {
    base.note = inputData.nonTemplateNote;
  }

  return base;
};

const buildNotifyerScheduleParams = (inputData) => {
  const scheduleTypeSpecific =
    inputData.notifyerScheduleTypeSpecific === true ||
    inputData.notifyerScheduleTypeSpecific === 'true';
  const body = {
    is_schedule: true,
    schedule_type: scheduleTypeSpecific ? 'specific' : 'relative',
  };

  if (scheduleTypeSpecific) {
    body.time_zone = inputData.templateTimezone;
    body.schedule_datetime_date = formatTemplateScheduleDatetime(inputData.templateScheduledDateTime);
  } else {
    body.unit_of_time_name = inputData.notifyerUnitOfTime;
    body.unit_of_time_value = Number(inputData.notifyerUnitOfTimeValue);
  }

  if (inputData.notifyerRecipientReplyCondition) {
    body.condition_one = inputData.notifyerRecipientReplyCondition;
  }

  if (inputData.notifyerLabelConditionStatus && parseList(inputData.notifyerConditionTwoLabels).length) {
    body.condition_two = {
      c: inputData.notifyerLabelConditionStatus,
      v: parseList(inputData.notifyerConditionTwoLabels),
    };
  }

  return body;
};

const buildScheduledNonTemplateMessageBody = (inputData) => ({
  ...buildNonTemplateMessageBody(inputData),
  ...buildNotifyerScheduleParams(inputData),
});

module.exports = {
  LABEL_CONDITIONS,
  MESSAGE_TYPES,
  REPLY_CONDITIONS,
  TIME_UNITS,
  TIME_VALUES,
  buildNonTemplateMessageBody,
  buildNotifyerScheduleParams,
  buildScheduledNonTemplateMessageBody,
  buildUpdateContactLabelsPayload,
  formatScheduleDatetimeForApi,
  formatNonTemplateScheduleDatetime,
  formatScheduleDatetimeUtcIso,
  formatTemplateScheduleDatetime,
  getErrorMessage,
  getGroups,
  getLabels,
  getLabelsForRemoveContact,
  getPhoneNumbers,
  getProductOperations,
  getReplyConditionDescription,
  getTemplateDynamicFieldsFromApi,
  getTemplatePreviewInfoField,
  getTemplateVariableFields,
  getTemplateVariables,
  getTemplates,
  getWhatsAppNumbers,
  handleApiResponse,
  formatTextForZapierDisplay,
  normalizeDynamicInputFields,
  parseList,
  parseTemplate,
  request,
  validateApiKey,
};
