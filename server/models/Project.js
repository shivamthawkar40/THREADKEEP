const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true,
  },
  key: {
    type: String,
    trim: true,
    uppercase: true,
  },
  description: {
    type: String,
    default: '',
  },
  category: {
    type: String,
    default: 'Software Development',
  },
  targetDomain: {
    type: String,
    default: 'Fintech / Enterprise',
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'in_review', 'reconstructed', 'archived', 'completed'],
    default: 'active',
  },
  healthScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
  stats: {
    totalDocuments: { type: Number, default: 0 },
    confirmedFacts: { type: Number, default: 0 },
    inferredFacts: { type: Number, default: 0 },
    openGaps: { type: Number, default: 0 },
    unresolvedConflicts: { type: Number, default: 0 },
    pendingReviews: { type: Number, default: 0 },
  },
  lastReconstructedAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

projectSchema.pre('save', function(next) {
  if (!this.key && this.name) {
    this.key = this.name.split(' ').map(w => w[0]).join('').substring(0, 5).toUpperCase();
  }
  next();
});

module.exports = mongoose.model('Project', projectSchema);
