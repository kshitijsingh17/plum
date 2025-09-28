require('dotenv').config();

module.exports = {
  port: process.env.PORT || 5000,
  dbUri: process.env.DB_URI || 'mongodb://localhost:27017/appointments',
  tz: process.env.TZ || 'Asia/Kolkata'
};
