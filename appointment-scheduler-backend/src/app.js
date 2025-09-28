const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const api = require('./api');
const config = require('./config/appConfig');
const db = require('./config/db');
const logger = require('./utils/logger');

const app = express();

app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(morgan('dev'));

app.use('/api', api);

app.get('/', (req, res) => res.send('Appointment Scheduler API'));

const start = async () => {
  try {
    await db.connect(config.dbUri);
        app.listen(config.port, '0.0.0.0', () => 
      logger.info(`Server running on port ${config.port}`)
    );
  } catch (err) {
    logger.error('Failed to start server: ' + err.message);
    process.exit(1);
  }
};

if (require.main === module) start();

module.exports = app;
