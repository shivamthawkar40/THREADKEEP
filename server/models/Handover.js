const mongoose = require('mongoose');

const handoverSchema = new mongoose.Schema({
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
  version: {
    type: String,
    default: '1.0.0',
  },
  summary: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['draft', 'final', 'archived'],
    default: 'draft',
  },
  sections: {
    projectOverview: { type: String, default: '' },
    projectObjectives: [{ title: String, description: String, status: String }],
    currentStatus: { type: String, default: 'Active Transition' },
    technicalArchitecture: {
      overview: String,
      components: [{ name: String, role: String, technologies: [String] }],
    },
    technologyStack: [{ category: String, technology: String, version: String, status: String }],
    importantDecisions: [{ decision: String, rationale: String, date: String }],
    completedTasks: [{ title: String, owner: String, status: String }],
    pendingTasks: [{ title: String, owner: String, priority: String, blocker: String }],
    teamResponsibilities: [{ name: String, role: String, responsibilities: [String] }],
    dependencies: [{ item: String, dependsOn: String, status: String }],
    risks: [{ title: String, impact: String, mitigation: String }],
    knowledgeGaps: [{ title: String, severity: String, recommendation: String, status: String }],
    unresolvedConflicts: [{ topic: String, statementA: String, statementB: String, severity: String }],
    recommendedNextActions: [String],
  },
  metadata: {
    totalDocumentsAnalyzed: Number,
    verifiedItemsCount: Number,
    unresolvedGapsCount: Number,
    unresolvedConflictsCount: Number,
    knowledgeHealthScore: Number,
  },
  pdfPath: {
    type: String,
    default: '',
  },
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Handover', handoverSchema);
