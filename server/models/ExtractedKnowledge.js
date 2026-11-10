const mongoose = require('mongoose');

const citationSchema = new mongoose.Schema({
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
  },
  documentName: String,
  pageNumber: Number,
  sectionTitle: String,
  lineRange: String,
  excerpt: String,
}, { _id: false });

const verifiedItemSchema = new mongoose.Schema({
  id: String,
  title: String,
  description: String,
  category: String,
  status: {
    type: String,
    enum: ['confirmed', 'inferred', 'unknown'],
    default: 'confirmed',
  },
  confidenceScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 85,
  },
  sources: [citationSchema],
  rationale: String,
  owner: String,
  severity: String,
  reviewStatus: {
    type: String,
    enum: ['unreviewed', 'approved', 'rejected', 'edited'],
    default: 'unreviewed',
  },
  reviewNotes: String,
});

const extractedKnowledgeSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
    index: true,
  },
  version: {
    type: Number,
    default: 1,
  },
  overview: {
    summary: String,
    problemStatement: String,
    targetAudience: String,
    status: { type: String, enum: ['confirmed', 'inferred', 'unknown'], default: 'confirmed' },
    sources: [citationSchema],
  },
  objectives: [verifiedItemSchema],
  technicalArchitecture: {
    overview: String,
    pattern: String,
    components: [{
      name: String,
      role: String,
      technologies: [String],
      dependencies: [String],
      sources: [citationSchema],
    }],
    diagramNodes: [mongoose.Schema.Types.Mixed],
    diagramEdges: [mongoose.Schema.Types.Mixed],
    sources: [citationSchema],
  },
  technologyStack: [{
    category: String, // Frontend, Backend, Database, Cloud, etc.
    technology: String,
    version: String,
    status: { type: String, enum: ['confirmed', 'inferred', 'unknown'], default: 'confirmed' },
    sources: [citationSchema],
  }],
  decisions: [{
    decision: String,
    rationale: String,
    alternativesConsidered: String,
    decidedBy: String,
    date: String,
    status: { type: String, enum: ['confirmed', 'inferred', 'unknown'], default: 'confirmed' },
    sources: [citationSchema],
  }],
  completedTasks: [verifiedItemSchema],
  pendingTasks: [verifiedItemSchema],
  teamResponsibilities: [{
    name: String,
    role: String,
    responsibilities: [String],
    ownershipAreas: [String],
    status: { type: String, enum: ['confirmed', 'inferred', 'unknown'], default: 'confirmed' },
    sources: [citationSchema],
  }],
  dependencies: [{
    item: String,
    dependsOn: String,
    type: { type: String, enum: ['internal', 'external', 'third_party'] },
    status: { type: String, enum: ['resolved', 'pending', 'blocked'] },
    impact: String,
    sources: [citationSchema],
  }],
  risks: [{
    title: String,
    description: String,
    impact: { type: String, enum: ['critical', 'high', 'medium', 'low'] },
    likelihood: { type: String, enum: ['high', 'medium', 'low'] },
    mitigation: String,
    sources: [citationSchema],
  }],
  milestones: [{
    title: String,
    targetDate: String,
    status: { type: String, enum: ['completed', 'in_progress', 'delayed', 'unknown'] },
    sources: [citationSchema],
  }],
  confidenceStats: {
    confirmedPercentage: Number,
    inferredPercentage: Number,
    unknownPercentage: Number,
    overallHealthScore: Number,
  },
  extractedBy: {
    type: String,
    default: 'THREADKEEP Intelligence Engine',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('ExtractedKnowledge', extractedKnowledgeSchema);
