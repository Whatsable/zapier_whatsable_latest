const fetchSessions = async (z, bundle) => {
  const requestOptions = {
    url: 'https://preview.whatsable.app/api/sessions',
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  };

  const response = await z.request(requestOptions);
  response.throwForStatus();

  return response.json.map((session) => ({
    id: session.value,
    label: session.label,
    value: session.value,
    sessionLabel: session.label,
  }));
};

module.exports = {
  key: 'fetchSessions',
  noun: 'Session',
  display: {
    label: 'Fetch WhatsAble Sessions',
    description: 'Retrieves available WhatsAble sessions.',
  },
  operation: {
    perform: fetchSessions,
    sample: {
      id: 'test-nibir',
      label: 'test-nibir',
      value: 'test-nibir',
      sessionLabel: 'test-nibir',
    },
    outputFields: [
      { key: 'label', label: 'Session label' },
      { key: 'value', label: 'Session value' },
    ],
  },
};

