const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/auth');

const {
  generateHandover,
  getProjectHandovers,
  getHandoverById,
  updateHandover,
  exportHandoverPDF,
  downloadHandoverPDF,
} = require('../controllers/handoverController');

// Authentication required for all handover routes
router.use(protect);

// Generate handover
router.post('/generate/:projectId', generateHandover);

// Get all handovers for a project
router.get('/project/:projectId', getProjectHandovers);

// Export / Generate PDF
router.post('/:id/export-pdf', exportHandoverPDF);

// Download generated PDF
router.get('/:id/download-pdf', downloadHandoverPDF);

// Get or update individual handover
router.route('/:id')
  .get(getHandoverById)
  .put(updateHandover);

module.exports = router;