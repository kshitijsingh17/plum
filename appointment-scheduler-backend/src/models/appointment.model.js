const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
  department: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  tz: { type: String, default: process.env.TZ || 'Asia/Kolkata' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Appointment', AppointmentSchema);
