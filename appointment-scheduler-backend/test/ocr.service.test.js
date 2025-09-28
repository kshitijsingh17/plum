const ocrService = require('../src/services/ocr.service');

test('returns raw text when input is plain text', async () => {
  const res = await ocrService.processInput('Hello world');
  expect(res.raw_text).toBe('Hello world');
  expect(res.confidence).toBe(1.0);
});
