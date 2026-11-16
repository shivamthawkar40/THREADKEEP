const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { chatWithProjectCompanion, getCompanionHistory } = require('../controllers/companionController');
const { triggerReconstruction, getExtractedKnowledge } = require('../controllers/aiController');

router.use(protect);

router.post('/reconstruct/:projectId', triggerReconstruction);
router.get('/knowledge/:projectId', getExtractedKnowledge);
router.get('/companion/:projectId/history', getCompanionHistory);
router.post('/companion/:projectId', chatWithProjectCompanion);

module.exports = router;

