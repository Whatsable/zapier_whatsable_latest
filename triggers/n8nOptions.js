const {
  getGroups,
  getLabels,
  getLabelsForRemoveContact,
  getPhoneNumbers,
  getProductOperations,
  getTemplates,
  getWhatsAppNumbers,
} = require('../whatsableApi');

const makeOptionTrigger = ({ key, noun, label, description, perform }) => ({
  key,
  noun,
  display: {
    label,
    description,
    hidden: true,
  },
  operation: {
    perform,
    outputFields: [
      { key: 'id', label: 'ID' },
      { key: 'name', label: 'Name' },
      { key: 'description', label: 'Description' },
    ],
    sample: {
      id: 'sample',
      name: 'Sample',
      description: 'Sample option',
    },
  },
});

module.exports = {
  productOperations: makeOptionTrigger({
    key: 'fetchProductOperations',
    noun: 'Product Operation',
    label: 'WhatsAble Product Operations',
    description: 'Loads operations based on the connected API key product.',
    perform: getProductOperations,
  }),
  templates: makeOptionTrigger({
    key: 'fetchNotifyerTemplates',
    noun: 'Template',
    label: 'Notifyer Templates',
    description: 'Loads Notifyer templates.',
    perform: getTemplates,
  }),
  labels: makeOptionTrigger({
    key: 'fetchNotifyerLabels',
    noun: 'Label',
    label: 'Notifyer Labels',
    description: 'Loads Notifyer labels.',
    perform: getLabels,
  }),
  removeContactLabels: makeOptionTrigger({
    key: 'fetchNotifyerRemoveContactLabels',
    noun: 'Label',
    label: 'Notifyer Remove Contact Labels',
    description: 'Loads Notifyer labels for removal, including Remove All.',
    perform: getLabelsForRemoveContact,
  }),
  phoneNumbers: makeOptionTrigger({
    key: 'fetchNotifyerPhoneNumbers',
    noun: 'Phone Number',
    label: 'Notifyer Phone Numbers',
    description: 'Loads Notifyer phone numbers.',
    perform: getPhoneNumbers,
  }),
  whatsAppNumbers: makeOptionTrigger({
    key: 'fetchWhatsAbleNumbersV2',
    noun: 'WhatsApp Number',
    label: 'WhatsAble Numbers',
    description: 'Loads WhatsAble numbers.',
    perform: getWhatsAppNumbers,
  }),
  groups: makeOptionTrigger({
    key: 'fetchWhatsAbleGroupsV2',
    noun: 'Group',
    label: 'WhatsAble Groups',
    description: 'Loads WhatsAble groups.',
    perform: getGroups,
  }),
};
