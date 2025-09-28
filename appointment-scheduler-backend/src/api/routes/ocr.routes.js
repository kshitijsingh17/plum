const express = require('express');
const multer = require('multer');
const router = express.Router();
const ocrController = require('../../controllers/ocr.controller');

const upload = multer({ storage: multer.memoryStorage() });

router.post('/', upload.single('input'), ocrController.process);

router.get('/', (req, res) => {
  res.json({ route: '/api/ocr', method: 'POST', description: 'Accepts multipart/form-data (image) or JSON { input }' });
});

module.exports = router;
