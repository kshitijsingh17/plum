const express = require('express');
const router = express.Router();

const ocrRoutes = require('./routes/ocr.routes');
const entityRoutes = require('./routes/entity.routes');
const normalizeRoutes = require('./routes/normalize.routes');

const appointmentRoutes = require('./routes/appointment.routes');
const processRoutes = require('./routes/process.routes');

router.use('/ocr', ocrRoutes);
router.use('/entity', entityRoutes);
router.use('/normalize', normalizeRoutes);

router.use('/appointment', appointmentRoutes);
router.use('/process', processRoutes); 

router.get('/', (req, res) => {
  res.json({ status: 'ok', routes: ['/api/ocr (POST)', '/api/entity (POST)', '/api/normalize (POST)', '/api/guardrail (POST)', '/api/appointment (POST)'] });
});

module.exports = router;
