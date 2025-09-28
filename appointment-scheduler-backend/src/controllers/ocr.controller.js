const ocrService = require('../services/ocr.service');
const { successResponse, errorResponse } = require('../utils/responseFormatter');

exports.process = async (req, res) => {
  try {
    let result;

    if (req.file) {
      // Image upload via multipart
      result = await ocrService.processBuffer(req.file.buffer);
    } else if (req.body.input) {
      // JSON base64 or plain text
      result = await ocrService.processInput(req.body.input);
    } else {
      return res.status(400).json(errorResponse('Missing input (provide either image file or input text/base64)'));
    }

    res.json(successResponse(result));
  } catch (err) {
    res.status(500).json(errorResponse(err.message));
  }
};
