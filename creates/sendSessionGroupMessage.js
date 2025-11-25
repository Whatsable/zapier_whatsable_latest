const perform = async (z, bundle) => {
  const options = {
    url: 'http://91.98.45.220:3000/sessions/groups/send',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: {
      session: bundle.inputData.session,
      groupId: bundle.inputData.to,
      message: bundle.inputData.message,
    },
  };

  return z.request(options).then((response) => {
    response.throwForStatus();
    return response.json;
  });
};

module.exports = {
  key: 'send_session_message',
  noun: 'SessionMessage',
  display: {
    label: 'Send Session Group Message',
    description: 'Sends a message to a WhatsAble group from a chosen session.',
    hidden: false,
  },
  operation: {
    inputFields: [
      {
        key: 'session',
        type: 'string',
        helpText: 'Select the WhatsAble session to send the message from.',
        dynamic: 'fetchSessions.id.label',
        altersDynamicFields: true,
      },
      {
        key: 'to',
        label: 'Group Id',
        type: 'text',
        helpText: 'WhatsApp Group ID (e.g., 120363405693454126@g.us).',
        required: true,
        list: false,
        altersDynamicFields: false,
      },
      {
        key: 'message',
        label: 'Message',
        type: 'text',
        helpText: 'Message text to send through the selected session.',
        required: true,
        list: false,
        altersDynamicFields: false,
      },
    ],
    perform: perform,
    sample: {
      session: 'test-akash',
      to: '120363405693454126@g.us',
      message: 'Hello group! This message send from our whatsapp server to customer success group',
      status: 'sent',
    },
  },
};

