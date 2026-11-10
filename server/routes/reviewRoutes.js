const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { createReview, getReviews } = require('../controllers/reviewController');

router.use(protect);

router.post('/', createReview);
router.get('/project/:projectId', getReviews);

module.exports = router;
