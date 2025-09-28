const normalizeService = require('../services/normalize.service');
const { successResponse, errorResponse } = require('../utils/responseFormatter');

exports.normalize = async (req, res) => {
  try {
    const { entities } = req.body;
    if (!entities) return res.status(400).json(errorResponse('Missing entities'));
    const result = await normalizeService.normalize(entities);
    res.json(successResponse(result));
  } catch (err) {
    res.status(500).json(errorResponse(err.message));
  }
};
