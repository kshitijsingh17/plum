const entityService = require('../services/entity.service');
const { successResponse, errorResponse } = require('../utils/responseFormatter');

exports.extract = async (req, res) => {
  try {
    const { raw_text } = req.body;
    if (!raw_text) return res.status(400).json(errorResponse('Missing raw_text'));
    const result = await entityService.extractEntities(raw_text);
    res.json(successResponse(result));
  } catch (err) {
    res.status(500).json(errorResponse(err.message));
  }
};
