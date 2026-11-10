const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
    index: true,
  },

  originalName: {
    type: String,
    required: true,
  },

  mimeType: {
    type: String,
    required: true,
  },

  size: {
    type: Number,
    required: true,
  },

  // Legacy local path; retained for existing documents
  filePath: {
    type: String,
    default: '',
  },

  // Cloudinary storage information
  storageProvider: {
    type: String,
    enum: ['local', 'cloudinary'],
    default: 'local',
  },

  fileUrl: {
    type: String,
    default: '',
  },

  cloudinaryPublicId: {
    type: String,
    default: '',
  },

  cloudinaryResourceType: {
    type: String,
    default: 'raw',
  },

  fileType: {
    type: String,
    enum: ['pdf', 'docx', 'csv', 'txt'],
    required: true,
  },

  status: {
    type: String,
    enum: ['uploaded', 'processing', 'processed', 'error'],
    default: 'uploaded',
  },

  errorMessage: {
    type: String,
    default: null,
  },

  rawText: {
    type: String,
    default: '',
  },

  wordCount: {
    type: Number,
    default: 0,
  },

  pageCount: {
    type: Number,
    default: 1,
  },

  sections: [{
    sectionNumber: Number,
    title: String,
    page: Number,
    lineStart: Number,
    content: String,
  }],

  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },

}, {
  timestamps: true,
});

module.exports = mongoose.model('Document', documentSchema);