const appointmentService = require('../services/appointment.service');
const { successResponse, errorResponse } = require('../utils/responseFormatter');

exports.createAppointment = async (req, res) => {
  try {
    const { department, date, time, tz } = req.body;
    if (!department || !date || !time) return res.status(400).json(errorResponse('Missing required fields'));
    const appointment = await appointmentService.create({ department, date, time, tz });
    res.json(successResponse({ appointment, status: 'ok' }));
  } catch (err) {
    res.status(500).json(errorResponse(err.message));
  }
};
