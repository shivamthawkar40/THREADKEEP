const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getGaps, updateGapStatus } = require('../controllers/gapController');

router.use(protect);

router.get('/project/:projectId', getGaps);
router.put('/:id/status', updateGapStatus);

module.exports = router;
