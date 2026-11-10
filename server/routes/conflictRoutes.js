const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getConflicts, resolveConflict } = require('../controllers/conflictController');

router.use(protect);

router.get('/project/:projectId', getConflicts);
router.put('/:id/resolve', resolveConflict);

module.exports = router;
