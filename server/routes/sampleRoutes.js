const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { loadSampleProject } = require('../controllers/sampleController');

router.use(protect);

router.post('/load', loadSampleProject);

module.exports = router;
