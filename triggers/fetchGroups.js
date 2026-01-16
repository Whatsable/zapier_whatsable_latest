const fetchGroups = async (z, bundle) => {
  const requestOptions = {
    url: 'https://dashboard.whatsable.app/api/groups/automation/groups',
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: bundle.authData.apiKey,
    },
  };

  const response = await z.request(requestOptions);
  response.throwForStatus();

  return response.json.groups.map((group) => {
    const combinedValue = `${group.value_for}_${group.session_id}`;
    return {
      id: combinedValue, // This is the value that gets passed
      label_name: group.label_name, // This will be displayed
      value_for: group.value_for,
      session_id: group.session_id,
    };
  });
};

module.exports = {
  key: 'fetchGroups',
  noun: 'Group',
  display: {
    label: 'WhatsAble Groups',
    description: 'Triggers when groups are retrieved from WhatsAble.',
  },
  operation: {
    perform: fetchGroups,
    outputFields: [
      { key: 'id', label: 'Group ID (Combined)' },
      { key: 'label_name', label: 'Group Name' },
      { key: 'value_for', label: 'Group ID' },
      { key: 'session_id', label: 'Session ID' },
    ],
    sample: {
      id: '120363405693454126@g.us_705848f2-9c18-403a-92e8-2509d84ceb85',
      label_name: 'Trip Saint Martin by Whatsable',
      value_for: '120363405693454126@g.us',
      session_id: '705848f2-9c18-403a-92e8-2509d84ceb85',
    },
  },
};

