const perform = async (z, bundle) => {
    return [bundle.cleanedRequest];
  };
  
  module.exports = {
    key: 'incoming_message_webhook',
    noun: 'Message',
    display: {
      label: 'New Message (Instant) From Recipient',
      description: 'Triggers instantly when a new message is received.',
      hidden: false
    },
    operation: {
      perform: perform,
      type: 'hook',
      performSubscribe: {
        body: { url: '{{bundle.targetUrl}}' },
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'Authorization': '{{bundle.authData.apiKey}}'
        },
        method: 'POST',
        url: 'https://api.insightssystem.com/api:ZFDnbu8D/store_webhook',
      },
      performUnsubscribe: {
        method: 'DELETE',
        url: 'https://api.insightssystem.com/api:ZFDnbu8D/store_webhook',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'Authorization': '{{bundle.authData.apiKey}}'
        },
        body: { url: '{{bundle.targetUrl}}' },
      },
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