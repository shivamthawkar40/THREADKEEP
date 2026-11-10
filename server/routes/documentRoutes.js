const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { protect } = require('../middleware/auth');
const {
  uploadDocuments,
  getProjectDocuments,
  getDocumentById,
  deleteDocument,
} = require('../controllers/documentController');

router.use(protect);

router.post('/upload/:projectId', upload.array('files', 15), uploadDocuments);
router.get('/project/:projectId', getProjectDocuments);
router.route('/:id')
  .get(getDocumentById)
  .delete(deleteDocument);

module.exports = router;
