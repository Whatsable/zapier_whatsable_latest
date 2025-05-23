// IMPORTANT: When Zapier subscribes, it sends a POST to your /store_webhook endpoint with their webhook URL.
// Your backend MUST store this URL in your database or storage.
// When a relevant event happens (e.g., new message), your backend MUST POST the event data to all stored webhook URLs.
// If you do not store the URL, Zapier will never receive events and your integration will not work.

const perform = async (z, bundle) => {
  return [bundle.cleanedRequest];
};

const subscribeHook = (z, bundle) => {
  z.console.log('Subscribing webhook:', bundle.targetUrl);
  
  const data = {
    url: bundle.targetUrl
  };

  const options = {
    url: 'https://api.insightssystem.com/api:ZFDnbu8D/store_webhook',
    method: 'POST',
    body: data,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'Authorization': bundle.authData.apiKey
    }
  };

  // Make the request and parse the response
  return z.request(options)
    .then((response) => {
      z.console.log('Webhook subscription response:', response.data);
      return response.data;
    });
};

const unsubscribeHook = (z, bundle) => {
  z.console.log('Unsubscribing webhook:', bundle.subscribeData);
  
  // bundle.subscribeData contains the parsed response JSON from the subscribe request
  const hookId = bundle.subscribeData.id;

  const options = {
    url: `https://api.insightssystem.com/api:ZFDnbu8D/store_webhook/${hookId}`,
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'Authorization': bundle.authData.apiKey
    }
  };

  return z.request(options)
    .then((response) => {
      z.console.log('Webhook unsubscription response:', response.data);
      return response.data;
    });
};

const getFallbackMessage = (z, bundle) => {
  // For the test poll, you should get some real data, to aid the setup process.
  return [{
    id: 1,
    createdAt: '2024-12-15T12:00:00Z',
    last_messages: "Hi! How can I help you?",
    phone_number: "+1234567890",
    user_id: "6fb11ff2-d9b2-4560-8437-0fe58ec9f4a6",
    last_message_of_user: "I need help with my order",
    last_message_of_bot: "I'll help you track your order",
    conversation_paragraph: "User asked about order status. Bot offered to help track the order.",
    message_type: "text",
    user_timestamp: "1234567890123",
    bot_timestamp: "1234567890123"
  }];
};

module.exports = {
  key: 'incoming_message_webhook',
  noun: 'Message',
  display: {
    label: 'New Message Sent to Bot',
    description: 'Triggers instantly when a new message is received.',
    hidden: false
  },
  operation: {
    perform: perform,
    type: 'hook',
    performSubscribe: subscribeHook,
    performUnsubscribe: unsubscribeHook,
    performList: getFallbackMessage,
    sample: {
      id: 1,
      createdAt: '2024-12-15T12:00:00Z',
      last_messages: "Hi! How can I help you?",
      phone_number: "+1234567890",
      user_id: "6fb11ff2-d9b2-4560-8437-0fe58ec9f4a6",
      last_message_of_user: "I need help with my order",
      last_message_of_bot: "I'll help you track your order",
      conversation_paragraph: "User asked about order status. Bot offered to help track the order.",
      message_type: "text",
      user_timestamp: "1234567890123",
      bot_timestamp: "1234567890123"
    },
    outputFields: [
      {
        key: 'last_messages',
        label: 'Last Messages',
        type: 'string'
      },
      {
        key: 'phone_number',
        label: 'Phone Number',
        type: 'string'
      },
      {
        key: 'user_id',
        label: 'User ID',
        type: 'string'
      },
      {
        key: 'last_message_of_user',
        label: 'Last message sent by the user',
        type: 'string'
      },
      {
        key: 'last_message_of_bot',
        label: 'Last message sent by the bot',
        type: 'string'
      },
      {
        key: 'conversation_paragraph',
        label: 'Conversation paragraph',
        type: 'string'
      },
      {
        key: 'message_type',
        label: 'Type of message',
        type: 'string'
      },
      {
        key: "user_timestamp",
        label: "User Last Message Time",
        type: "string"
      },
      {
        key: "bot_timestamp",
        label: "Bot Last Message Time",
        type: "string"
      }
    ]
  }
};