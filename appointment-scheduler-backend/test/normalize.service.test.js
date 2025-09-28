const normalizeService = require('../src/services/normalize.service');

test('normalizes date and time phrases', async () => {
  const res = await normalizeService.normalize({ date_phrase: 'next Friday', time_phrase: '3pm' });
  expect(res.normalized.date).toBeTruthy();
  expect(res.normalized.time).toMatch(/\d{2}:\d{2}/);
  expect(res.normalization_confidence).toBeGreaterThan(0);
});
