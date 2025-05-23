// trigger that fetches validated phone numbers from our api
const fetchNumbers = async (z, bundle) => {

  const requestOptions = {
    url: `https://dashboard.whatsable.app/api/numbers/fetch`,
    method: 'GET',
  };
  const response = await z.request(requestOptions);

  return response.json.numbers.map(number => {
    return { id: number.phone_number, phone_number: number.phone_number, last_message_at: `${number.last_message_at}` }
  })
};

module.exports = {
  key: 'fetchNumbers',
  noun: 'WhatsApp number',
  display: {
    label: 'Your WhatsApp Numbers',
    description: 'Triggers when added.',
  },
  operation: {
    perform: fetchNumbers,
    outputFields: [
      { key: 'phone_number', label: 'WhatsApp number' },
    ],
    sample: {
      id: 1,
      phone_number: '+1234567890',
      last_message_at: '2025-05-22T12:00:00Z'
    }
  },
}