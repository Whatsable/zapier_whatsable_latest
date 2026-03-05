const perform = async (z, bundle) => {
  const options = {
    url: `https://dashboard.whatsable.app/api/whatsapp/messages/v2.0.0/${bundle.inputData.message_id}`,
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${bundle.authData.apiKey}`,
    },
  };

  return z.request(options).then((response) => {
    response.throwForStatus();
    return response.json;
  });
};

module.exports = {
  key: 'get_message_status',
  noun: 'Message',
  display: {
    label: 'Get Message Status',
    description: 'Retrieves the status and details of a WhatsApp message by its message ID.',
    hidden: false,
  },
  operation: {
    inputFields: [
      {
        key: 'message_id',
        label: 'Message ID',
        type: 'string',
        helpText: 'The WhatsApp message ID (e.g. wamid.xxx) to look up.',
        required: true,
        list: false,
        altersDynamicFields: false,
      },
    ],
    perform: perform,
    sample: {
      id: 1835858,
      phone_number: 237672591248,
      message_id: 'wamid.HBgMMjM3NjcyNTkxMjQ4FQIAEhggQTU4REMzNjJENDRFNTQ4NDhBNjIzNjMxQzlGMURCODMA',
      delivered_time: null,
      read_time: null,
      status: 'unread',
      media_url: null,
      type: 'text',
      send_by: '',
      send_time: 1772699572258,
    },
  },
};
