const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { triggerReconstruction, getExtractedKnowledge } = require('../controllers/aiController');

router.use(protect);

router.post('/reconstruct/:projectId', triggerReconstruction);
router.get('/knowledge/:projectId', getExtractedKnowledge);

module.exports = router;
