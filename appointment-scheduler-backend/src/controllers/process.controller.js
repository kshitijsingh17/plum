const ocrService = require('../services/ocr.service');
const entityService = require('../services/entity.service');
const normalizeService = require('../services/normalize.service');
const { successResponse, errorResponse } = require('../utils/responseFormatter');

exports.process = async (req, res) => {
  try {
    let raw_text = null;

    // Image upload via multipart/form-data
    if (req.file) {
      const ocrResult = await ocrService.processBuffer(req.file.buffer);
      raw_text = ocrResult.raw_text;
    }
    // Plain text input via JSON
    else if (req.body.input) {
      raw_text = req.body.input;
    }

    if (!raw_text) {
      return res.status(400).json(errorResponse('Missing input or raw_text'));
    }

    // 1️⃣ Entity extraction
    const entityResult = await entityService.extractEntities(raw_text);

    // 2️⃣ Guardrail check
    const { department, date_phrase, time_phrase } = entityResult.entities;
    if (!department || !date_phrase || !time_phrase) {
      return res.json(successResponse({
        status: 'needs_clarification',
        message: 'Ambiguous or missing date, time, or department'
      }));
    }

    // 3️⃣ Normalization
    const normalized = await normalizeService.normalize(entityResult.entities);

    // 4️⃣ Final appointment JSON
    const appointment = {
      department,
      date: normalized.normalized.date,
      time: normalized.normalized.time,
      tz: normalized.normalized.tz
    };

    return res.json(successResponse({ appointment, status: 'ok' }));
  } catch (err) {
    return res.status(500).json(errorResponse(err.message));
  }
};
