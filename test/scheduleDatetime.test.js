jest.mock('../whatsableApi', () => {
  const actual = jest.requireActual('../whatsableApi');
  return {
    ...actual,
    validateApiKey: jest.fn(async () => ({ product: 'notifyer', success: true })),
  };
});

const { buildNotifyerScheduleParams, formatScheduleDatetimeForApi } = require('../whatsableApi');
const { scheduleFollowUpMessage } = require('../creates/performWhatsAbleOperation');

describe('formatScheduleDatetimeForApi', () => {
  it('keeps the clock digits from a UTC offset and drops the offset', () => {
    expect(formatScheduleDatetimeForApi('2026-10-27T19:30:00+00:00')).toBe('2026-10-27T19:30:00');
  });

  it('keeps the clock digits from a Z suffix', () => {
    expect(formatScheduleDatetimeForApi('2026-07-07T18:00:00Z')).toBe('2026-07-07T18:00:00');
    expect(formatScheduleDatetimeForApi('2026-10-26T14:30:00.000Z')).toBe('2026-10-26T14:30:00');
  });

  it('keeps the clock digits from a compact offset', () => {
    expect(formatScheduleDatetimeForApi('2026-06-08T17:20:00+0200')).toBe('2026-06-08T17:20:00');
  });

  it('keeps the clock digits from a colon offset, including a negative one', () => {
    expect(formatScheduleDatetimeForApi('2026-06-08T17:20:00+02:00')).toBe('2026-06-08T17:20:00');
    expect(formatScheduleDatetimeForApi('2026-10-27T15:30:00-04:00')).toBe('2026-10-27T15:30:00');
  });

  it('keeps legacy space-separated input', () => {
    expect(formatScheduleDatetimeForApi('2026-06-08 17:20')).toBe('2026-06-08T17:20:00');
  });

  it('keeps ISO datetime without a timezone suffix', () => {
    expect(formatScheduleDatetimeForApi('2026-06-08T17:20:00')).toBe('2026-06-08T17:20:00');
  });

  it('defaults date-only values to midnight', () => {
    expect(formatScheduleDatetimeForApi('2026-06-08')).toBe('2026-06-08T00:00:00');
  });

  it('throws when the value is missing', () => {
    expect(() => formatScheduleDatetimeForApi('')).toThrow('Scheduled Date and Time is required.');
  });

  it('throws when the value is not a valid datetime', () => {
    expect(() => formatScheduleDatetimeForApi('not-a-date')).toThrow('must use format 2026-06-08 17:20');
  });
});

describe('buildNotifyerScheduleParams', () => {
  it('sends the dropdown timezone and the wall clock with no offset', () => {
    expect(buildNotifyerScheduleParams({
      notifyerScheduleTypeSpecific: true,
      templateScheduledDateTime: '2026-10-27T19:30:00+00:00',
      templateTimezone: 'Europe/Berlin',
    })).toMatchObject({
      is_schedule: true,
      schedule_type: 'specific',
      time_zone: 'Europe/Berlin',
      schedule_datetime_date: '2026-10-27T19:30:00',
    });
  });
});

describe('Schedule a Follow-Up Message date field', () => {
  it('is plain text so Zapier does not rewrite the clock into the account timezone', async () => {
    const getFields = scheduleFollowUpMessage.operation.inputFields[0];
    const fields = await getFields(
      { errors: { Error: class ZapierError extends Error {} } },
      {
        authData: { api_key: 'test' },
        inputData: {
          configuration: 'sendNotifyerTemplate',
          notifyerScheduleTypeSpecific: true,
        },
      },
    );
    const scheduled = fields.find((field) => field.key === 'templateScheduledDateTime');
    expect(scheduled.type).toBe('string');
  });
});
