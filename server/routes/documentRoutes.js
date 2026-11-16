const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { protect } = require('../middleware/auth');
const {
  uploadDocuments,
  getProjectDocuments,
  getDocumentById,
  deleteDocument,
  getTrashDocuments,
  restoreDocument,
  permanentlyDeleteDocument,
} = require('../controllers/documentController');

router.use(protect);

router.post('/upload/:projectId', upload.array('files', 15), uploadDocuments);
router.get('/project/:projectId', getProjectDocuments);
router.get('/trash/:projectId', getTrashDocuments);
router.patch('/:id/restore', restoreDocument);
router.delete('/:id/permanent', permanentlyDeleteDocument);
router.route('/:id')
  .get(getDocumentById)
  .delete(deleteDocument);

module.exports = router;
