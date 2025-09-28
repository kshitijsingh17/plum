const express = require('express');
const router = express.Router();
const entityController = require('../../controllers/entity.controller');

router.post('/', entityController.extract);

module.exports = router;
