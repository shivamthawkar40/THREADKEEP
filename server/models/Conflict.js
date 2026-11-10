const mongoose = require('mongoose');

const conflictSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
    index: true,
  },
  topic: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: [
      'technology_selection',
      'project_decisions',
      'task_status',
      'project_ownership',
      'deadlines',
      'dependencies',
      'technical_specifications',
      'other',
    ],
    default: 'other',
  },
  severity: {
    type: String,
    enum: ['critical', 'high', 'medium', 'low'],
    default: 'high',
  },
  statementA: {
    claim: { type: String, required: true },
    documentName: { type: String, required: true },
    documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' },
    pageNumber: Number,
    excerpt: { type: String, required: true },
  },
  statementB: {
    claim: { type: String, required: true },
    documentName: { type: String, required: true },
    documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' },
    pageNumber: Number,
    excerpt: { type: String, required: true },
  },
  conflictReason: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['unresolved', 'confirmed', 'rejected', 'superseded'],
    default: 'unresolved',
    index: true,
  },
  chosenStatement: {
    type: String,
    enum: ['A', 'B', 'custom', 'none'],
    default: 'none',
  },
  resolutionNotes: {
    type: String,
    default: '',
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  resolvedAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Conflict', conflictSchema);
