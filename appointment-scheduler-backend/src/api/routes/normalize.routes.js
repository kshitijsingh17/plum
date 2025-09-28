const express = require('express');
const router = express.Router();
const normalizeController = require('../../controllers/normalize.controller');

router.post('/', normalizeController.normalize);

module.exports = router;
