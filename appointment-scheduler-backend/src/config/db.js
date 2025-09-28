const mongoose = require('mongoose');
const logger = require('../utils/logger');

exports.connect = async (uri) => {
  try {
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    logger.info('Connected to MongoDB');
  } catch (err) {
    logger.error('MongoDB connection error: ' + err.message);
    throw err;
  }
};
