const {
  formatTextForZapierDisplay,
  normalizeDynamicInputFields,
  parseTemplate,
} = require('../whatsableApi');

describe('template UX', () => {
  it('parseTemplate accepts plain template IDs and legacy JSON values', () => {
    const templateId = '61aaddab-6afa-498c-be0d-7ca289987f40';

    expect(parseTemplate(templateId)).toEqual({ template_id: templateId });

    const legacyValue = JSON.stringify({
      template_id: templateId,
      variable_counts: 3,
      template_formate: '[b:3]',
      body: 'Hello {{1}}, your order {{2}} is being processed.',
    });

    expect(parseTemplate(legacyValue)).toMatchObject({
      template_id: templateId,
      variable_counts: 3,
    });
  });

  it('formatTextForZapierDisplay preserves template placeholders for Zapier UI', () => {
    const preview = 'Hello {{1}}, your order {{2}} is expected by {{3}}.';

    expect(formatTextForZapierDisplay(preview)).toBe(
      'Hello &#123;&#123;1&#125;&#125;, your order &#123;&#123;2&#125;&#125; is expected by &#123;&#123;3&#125;&#125;.'
    );
  });

  it('normalizeDynamicInputFields moves examples into labels', () => {
    const [field] = normalizeDynamicInputFields([
      {
        key: 'body',
        label: 'Body',
        helpText:
          'Enter the message text for your WhatsApp messaging\n\nTemplate Text: Hi {{1}},\nWelcome to Notifyer System.\nExample: {{1}} = Nahid',
        required: true,
      },
    ]);

    expect(field.label).toBe('Body 1 — Example: Nahid');
    expect(field.helpText).toContain('Template Text');
    expect(field.helpText).not.toContain('Example:');
  });

  it('normalizeDynamicInputFields supports multiple body variable examples', () => {
    const fields = normalizeDynamicInputFields([
      {
        key: 'body1',
        label: 'Body 1',
        helpText: 'Template Text: Hello {{1}}\nExample: {{1}} = Nahid, {{2}} = 12345',
        required: true,
      },
      {
        key: 'body2',
        label: 'Body 2',
        helpText: 'Template Text: Order {{2}}\nExample: {{1}} = Nahid, {{2}} = 12345',
        required: true,
      },
    ]);

    expect(fields[0].label).toBe('Body 1 — Example: Nahid');
    expect(fields[1].label).toBe('Body 2 — Example: 12345');
  });

  it('normalizeDynamicInputFields uses template preview hint for media fields', () => {
    const [field] = normalizeDynamicInputFields([
      {
        key: 'media',
        label: 'Media (IMAGE)',
        helpText: 'Enter the media URL for the template header.',
        required: true,
      },
    ]);

    expect(field.label).toBe('Media: See above Template Preview');
  });
});
