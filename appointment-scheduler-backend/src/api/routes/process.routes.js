const express = require('express');
const router = express.Router();
const processController = require('../../controllers/process.controller');
const multer = require('multer');

// Multer setup for file uploads in memory
const upload = multer({ storage: multer.memoryStorage() });

// POST endpoint accepts either:
// - text JSON: { "input": "Book dentist next Friday at 3pm" }
// - image file: form-data with field "input"
router.post('/', upload.single('input'), processController.process);

// Optional: simple GET to check route
router.get('/', (req, res) => {
  res.json({ route: '/api/process', method: 'POST', description: 'Accepts text JSON or image file in field "input"' });
});

module.exports = router;
