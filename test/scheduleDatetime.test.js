const { formatScheduleDatetimeForApi } = require('../whatsableApi');

describe('formatScheduleDatetimeForApi', () => {
  it('extracts wall-clock time from Zapier ISO with Z suffix', () => {
    expect(formatScheduleDatetimeForApi('2026-07-07T18:00:00Z')).toBe('2026-07-07T18:00:00.000Z');
  });

  it('extracts wall-clock time from Zapier ISO with compact offset', () => {
    expect(formatScheduleDatetimeForApi('2026-06-08T17:20:00+0200')).toBe('2026-06-08T17:20:00.000Z');
  });

  it('extracts wall-clock time from Zapier ISO with colon offset', () => {
    expect(formatScheduleDatetimeForApi('2026-06-08T17:20:00+02:00')).toBe('2026-06-08T17:20:00.000Z');
  });

  it('keeps legacy space-separated input', () => {
    expect(formatScheduleDatetimeForApi('2026-06-08 17:20')).toBe('2026-06-08T17:20:00.000Z');
  });

  it('keeps ISO datetime without timezone suffix', () => {
    expect(formatScheduleDatetimeForApi('2026-06-08T17:20:00')).toBe('2026-06-08T17:20:00.000Z');
  });

  it('defaults date-only Zapier values to midnight', () => {
    expect(formatScheduleDatetimeForApi('2026-06-08')).toBe('2026-06-08T00:00:00.000Z');
  });

  it('throws when the value is missing', () => {
    expect(() => formatScheduleDatetimeForApi('')).toThrow('Scheduled Date and Time is required.');
  });

  it('throws when the value is not a valid datetime', () => {
    expect(() => formatScheduleDatetimeForApi('not-a-date')).toThrow('must use format 2026-06-08 17:20');
  });
});
