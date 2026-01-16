const perform = async (z, bundle) => {
  // The groupId is already the combined value (format: value_for_session_id)
  const combinedValue = bundle.inputData.groupId;
  
  // Extract session_id and groupId from combined value (format: value_for_session_id)
  const lastUnderscoreIndex = combinedValue.lastIndexOf('_');
  
  let sessionId, groupIdValue;
  if (lastUnderscoreIndex !== -1) {
    groupIdValue = combinedValue.substring(0, lastUnderscoreIndex); // value_for part (e.g., "120363405693454126@g.us")
    sessionId = combinedValue.substring(lastUnderscoreIndex + 1); // session_id part (e.g., "705848f2-9c18-403a-92e8-2509d84ceb85")
  } else {
    // Fallback if format is unexpected
    groupIdValue = combinedValue;
    sessionId = combinedValue;
  }
  
  const options = {
    url: 'https://dashboard.whatsable.app/api/whatsapp/messages/v2.0.0/group-send',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: {
      session: sessionId,
      groupId: groupIdValue,
      message: bundle.inputData.message,
    },
  };

  return z.request(options).then((response) => {
    response.throwForStatus();
    const result = response.json;
    
    // Remove Group Message Id from response
    const { 'Group Message Id': _, 'groupMessageId': __, 'group_message_id': ___, ...cleanResult } = result;
    
    return cleanResult;
  });
};

module.exports = {
  key: 'send_session_message',
  noun: 'SessionMessage',
  display: {
    label: 'Send Group Message',
    description: 'Sends a message to a WhatsAble group',
    hidden: false,
  },
  operation: {
    inputFields: [
      {
        key: 'groupId',
        label: 'Select a Group',
        type: 'text',
        helpText: 'Select a group from the WhatsAble Groups trigger.',
        dynamic: 'fetchGroups.id.label_name',
        required: true,
        altersDynamicFields: false,
      },
      {
        key: 'message',
        label: 'Message',
        type: 'text',
        helpText: 'Message text to send to the group.',
        required: true,
        list: false,
        altersDynamicFields: false,
      },
    ],
    perform: perform,
    sample: {
      groupId: '120363405693454126@g.us_705848f2-9c18-403a-92e8-2509d84ceb85',
      message: 'Hello group! This message is sent from our WhatsApp server.',
    },
  },
};

