const entityService = require('../src/services/entity.service');

test('extracts department, date and time phrases', async () => {
  const res = await entityService.extractEntities('Book dentist next Friday at 3pm');
  expect(res.entities.department).toBe('dentist');
  expect(res.entities.date_phrase).toMatch(/next Friday/i);
  expect(res.entities.time_phrase).toMatch(/3pm/i);
  expect(res.entities_confidence).toBeGreaterThan(0);
});
