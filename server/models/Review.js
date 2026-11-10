const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
    index: true,
  },
  itemType: {
    type: String,
    enum: ['finding', 'objective', 'architecture', 'technology', 'decision', 'task', 'gap', 'conflict'],
    required: true,
  },
  itemId: {
    type: String,
    required: true,
  },
  action: {
    type: String,
    enum: ['approved', 'rejected', 'edited', 'resolved', 'reopened'],
    required: true,
  },
  previousValue: {
    type: mongoose.Schema.Types.Mixed,
  },
  newValue: {
    type: mongoose.Schema.Types.Mixed,
  },
  comment: {
    type: String,
    default: '',
  },
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  reviewerName: {
    type: String,
    default: 'Team Member',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Review', reviewSchema);
