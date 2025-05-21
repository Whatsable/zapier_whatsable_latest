const perform = async (z, bundle) => {
  const options = {
    url: 'https://dashboard.whatsable.app/api/whatsapp/messages/v2.0.0/send',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${bundle.authData.apiKey}`,
    },
    body: {
      text: bundle.inputData.text,
      attachment: bundle.inputData.attachment,
      filename: bundle.inputData.filename,
      to: bundle.inputData.phone,
    },
  };

  return z.request(options).then((response) => {
    response.throwForStatus();
    const results = response.json;

    // You can do any parsing you need for results here before returning them

    return results;
  });
};

module.exports = {
  display: {
    description: 'Sends a WhatsApp message to the designated number. ',
    hidden: false,
    label: 'Send WhatsApp Message',
  },
  key: 'send_message',
  noun: 'Message',
  operation: {
    inputFields: [
      {
        key: 'phone',
        type: 'text',
        helpText: 'Verified phone number to send the message to. Select a number you registered in the [WhatsAble Dashboard](https://dashboard.whatsable.app/numbers/)',
        dynamic: 'fetchNumbers.id.phone_number',
        altersDynamicFields: true,
      },
      {
        key: 'text',
        label: 'Message Body',
        type: 'text',
        helpText: 'Enter the text of the message.',
        //default: 'Your message text here...',
        placeholder: "Your message text here...",
        required: true,
        list: false,
        altersDynamicFields: false,
      },
      {
        key: 'attachment',
        label: 'Attachment',
        type: 'string',
        helpText:
          'Enter the public link of image, video or document (Max 5MB for images, 16MB for video and 100MB for document)',
        required: false,
        list: false,
        altersDynamicFields: false,
      },
      {
        key: 'filename',
        label: 'File Name',
        type: 'string',
        //default: "example_name",
        helpText: 'Enter the filename for the attachment.',
        required: false,
        list: false,
        altersDynamicFields: false,
      },
    ],
    perform: perform,
    sample: { message: 'Message sent successfully' },
  },
};
