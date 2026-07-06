const { getErrorMessage } = require('../whatsableApi');

describe('getErrorMessage', () => {
  it('extracts message from WhatsAble API error body', () => {
    const body = {
      code: 'ERROR_CODE_NOT_FOUND',
      message: 'Not Found',
      payload: '',
    };

    expect(getErrorMessage(body)).toBe('Not Found');
  });

  it('extracts message from JSON string responses', () => {
    const response = {
      status: 404,
      content: '{"code":"ERROR_CODE_NOT_FOUND","message":"Not Found","payload":""}',
    };

    expect(getErrorMessage(response)).toBe('Not Found');
  });

  it('extracts description when message is missing', () => {
    expect(getErrorMessage({ description: 'Invalid API key' })).toBe('Invalid API key');
  });

  it('falls back to code when message is missing', () => {
    expect(getErrorMessage({ code: 'ERROR_CODE_ACCESS_DENIED' })).toBe('ERROR_CODE_ACCESS_DENIED');
  });
});
