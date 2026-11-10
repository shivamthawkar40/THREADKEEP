const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
    index: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  userName: {
    type: String,
    default: 'System / AI',
  },
  action: {
    type: String,
    enum: [
      'project_created',
      'document_uploaded',
      'document_processed',
      'document_deleted',
      'reconstruction_started',
      'reconstruction_completed',
      'gap_identified',
      'gap_resolved',
      'gap_reopened',
      'conflict_detected',
      'conflict_resolved',
      'finding_approved',
      'finding_rejected',
      'finding_edited',
      'handover_generated',
      'handover_exported',
      'sample_loaded',
    ],
    required: true,
  },
  entityType: {
    type: String,
    enum: ['project', 'document', 'reconstruction', 'gap', 'conflict', 'review', 'handover'],
  },
  entityId: {
    type: String,
  },
  title: {
    type: String,
    required: true,
  },
  details: {
    type: String,
    default: '',
  },
  severity: {
    type: String,
    enum: ['info', 'success', 'warning', 'critical'],
    default: 'info',
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('ActivityLog', activityLogSchema);
