const mongoose = require('mongoose');

const knowledgeGapSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: [
      'missing_ownership',
      'unanswered_question',
      'missing_documentation',
      'unknown_task_status',
      'missing_technical_decision',
      'unclear_dependency',
      'missing_deployment_instructions',
      'incomplete_testing',
      'general',
    ],
    default: 'general',
  },
  severity: {
    type: String,
    enum: ['critical', 'high', 'medium', 'low'],
    default: 'medium',
    index: true,
  },
  explanation: {
    type: String,
    required: true,
  },
  whyItMatters: {
    type: String,
    required: true,
  },
  relatedInfo: {
    type: String,
    default: '',
  },
  evidence: [{
    documentName: String,
    pageNumber: Number,
    excerpt: String,
  }],
  suggestedQuestion: {
    type: String,
    required: true,
  },
  recommendedAction: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['open', 'resolved', 'reopened', 'not_applicable'],
    default: 'open',
    index: true,
  },
  reviewerComment: {
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

module.exports = mongoose.model('KnowledgeGap', knowledgeGapSchema);
