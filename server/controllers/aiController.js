const Project = require('../models/Project');
const Document = require('../models/Document');
const ExtractedKnowledge = require('../models/ExtractedKnowledge');
const KnowledgeGap = require('../models/KnowledgeGap');
const Conflict = require('../models/Conflict');
const ActivityLog = require('../models/ActivityLog');
const { generateStructuredAI, isGeminiConfigured } = require('../services/geminiService');
const {
  reconstructProjectKnowledge,
  detectKnowledgeGaps,
  detectConflicts,
  calculateKnowledgeHealth,
} = require('../services/intelligenceEngine');

// @desc    Trigger AI Project Reconstruction across all project documents
// @route   POST /api/ai/reconstruct/:projectId
const triggerReconstruction = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findOne({ _id: projectId, owner: req.user._id });
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const documents = await Document.find({ project: projectId, status: 'processed' });
    if (documents.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No processed documents found for this project. Please upload documents first.',
      });
    }

    await ActivityLog.create({
      project: project._id,
      user: req.user._id,
      userName: req.user.name,
      action: 'reconstruction_started',
      entityType: 'reconstruction',
      title: 'Knowledge Reconstruction Pipeline Initiated',
      details: `Analyzing ${documents.length} project documents with semantic entity linking.`,
      severity: 'info',
    });

    let geminiResult = null;
    if (isGeminiConfigured()) {
      try {
        const docSummaries = documents.map(d => `--- Document: ${d.originalName} ---\n${d.rawText.substring(0, 4000)}`).join('\n\n');
        const prompt = `Analyze these project documents and return a structured JSON reconstruction of the project:\n${docSummaries}`;
        const systemPrompt = `You are THREADKEEP Intelligence. Return valid JSON containing: overview, objectives, technicalArchitecture, technologyStack, decisions, completedTasks, pendingTasks, teamResponsibilities, dependencies, risks, milestones.`;
        geminiResult = await generateStructuredAI(prompt, systemPrompt);
      } catch (gErr) {
        console.warn('Gemini extraction had an issue, falling back seamlessly:', gErr.message);
      }
    }

    // 1. Run Intelligence Engine Extraction & Citation Mapper
    const knowledgeData = await reconstructProjectKnowledge(project, documents, geminiResult);

    // Save or update ExtractedKnowledge in MongoDB
    let knowledgeRecord = await ExtractedKnowledge.findOne({ project: projectId }).sort({ version: -1 });
    if (knowledgeRecord) {
      knowledgeData.version = knowledgeRecord.version + 1;
    }
    knowledgeRecord = await ExtractedKnowledge.create(knowledgeData);

    // 2. Run Knowledge Gap Radar
    const rawGaps = await detectKnowledgeGaps(project, documents, geminiResult);
    // Remove old open gaps and insert new ones
    await KnowledgeGap.deleteMany({ project: projectId, status: 'open' });
    const insertedGaps = await KnowledgeGap.insertMany(rawGaps);

    // 3. Run Conflict Detection
    const rawConflicts = await detectConflicts(project, documents, geminiResult);
    // Remove old unresolved conflicts and insert new ones
    await Conflict.deleteMany({ project: projectId, status: 'unresolved' });
    const insertedConflicts = await Conflict.insertMany(rawConflicts);

    // 4. Calculate Knowledge Health Indicator
    const healthResult = calculateKnowledgeHealth(
      knowledgeData.confidenceStats,
      knowledgeData.objectives.length + knowledgeData.completedTasks.length,
      knowledgeData.confidenceStats.confirmedPercentage,
      knowledgeData.confidenceStats.inferredPercentage,
      knowledgeData.confidenceStats.unknownPercentage,
      insertedGaps,
      insertedConflicts
    );

    // Update project stats & health score
    project.healthScore = healthResult.score;
    project.status = 'reconstructed';
    project.lastReconstructedAt = new Date();
    project.stats.confirmedFacts = knowledgeData.confidenceStats.confirmedPercentage;
    project.stats.inferredFacts = knowledgeData.confidenceStats.inferredPercentage;
    project.stats.openGaps = insertedGaps.length;
    project.stats.unresolvedConflicts = insertedConflicts.length;
    await project.save();

    await ActivityLog.create({
      project: project._id,
      user: req.user._id,
      userName: req.user.name,
      action: 'reconstruction_completed',
      entityType: 'reconstruction',
      entityId: knowledgeRecord._id,
      title: 'Knowledge Reconstruction Finished',
      details: `Health Score: ${healthResult.score}% (${healthResult.rating}). ${insertedGaps.length} gaps identified, ${insertedConflicts.length} contradictions detected.`,
      severity: 'success',
    });

    res.json({
      success: true,
      knowledge: knowledgeRecord,
      gaps: insertedGaps,
      conflicts: insertedConflicts,
      health: healthResult,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get latest extracted knowledge for a project
// @route   GET /api/ai/knowledge/:projectId
const getExtractedKnowledge = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const knowledge = await ExtractedKnowledge.findOne({ project: projectId }).sort({ version: -1 });
    if (!knowledge) {
      return res.status(404).json({
        success: false,
        message: 'No reconstructed knowledge found. Please run reconstruction first.',
      });
    }
    res.json({ success: true, knowledge });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  triggerReconstruction,
  getExtractedKnowledge,
};
