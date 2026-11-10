const fs = require('fs');
const path = require('path');
const Project = require('../models/Project');
const Document = require('../models/Document');
const ExtractedKnowledge = require('../models/ExtractedKnowledge');
const KnowledgeGap = require('../models/KnowledgeGap');
const Conflict = require('../models/Conflict');
const Handover = require('../models/Handover');
const ActivityLog = require('../models/ActivityLog');
const { parseDocument } = require('../services/parserService');
const { SAMPLE_FILES_DIR, UPLOAD_DIR } = require('../config/env');
const {
  reconstructProjectKnowledge,
  detectKnowledgeGaps,
  detectConflicts,
  calculateKnowledgeHealth,
} = require('../services/intelligenceEngine');

// @desc    Load realistic sample project with multiple documents and full AI reconstruction
// @route   POST /api/sample/load
const loadSampleProject = async (req, res, next) => {
  try {
    const sampleFiles = [
      { name: 'FinPulse_Architecture_Spec_v1.txt', mime: 'text/plain' },
      { name: 'FinPulse_Sprint_Handover_Notes_v2.txt', mime: 'text/plain' },
      { name: 'FinPulse_Decisions_and_Risks.csv', mime: 'text/csv' },
    ];

    // Ensure uploads directory exists
    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }

    // 1. Create or reset sample project for this user
    let project = await Project.findOne({
      name: 'FinPulse: Next-Gen Core Banking Platform',
      owner: req.user._id,
    });

    if (project) {
      // Clear previous associated records to ensure fresh state
      await Promise.all([
        Document.deleteMany({ project: project._id }),
        ExtractedKnowledge.deleteMany({ project: project._id }),
        KnowledgeGap.deleteMany({ project: project._id }),
        Conflict.deleteMany({ project: project._id }),
        Handover.deleteMany({ project: project._id }),
        ActivityLog.deleteMany({ project: project._id }),
      ]);
    } else {
      project = await Project.create({
        name: 'FinPulse: Next-Gen Core Banking Platform',
        key: 'FINP',
        description: 'Enterprise transactional core banking engine with double-entry accounting and high-throughput settlement.',
        category: 'Fintech & Banking Infrastructure',
        targetDomain: 'Core Financial Services',
        owner: req.user._id,
        status: 'active',
        healthScore: 0,
      });
    }

    await ActivityLog.create({
      project: project._id,
      user: req.user._id,
      userName: req.user.name,
      action: 'sample_loaded',
      entityType: 'project',
      entityId: project._id,
      title: 'Realistic Sample Project Initialized',
      details: 'Loaded FinPulse multi-document banking dataset for end-to-end evaluation.',
      severity: 'info',
    });

    // 2. Ingest and parse each sample file
    const docRecords = [];
    for (const file of sampleFiles) {
      const srcPath = path.join(SAMPLE_FILES_DIR, file.name);
      const destPath = path.join(UPLOAD_DIR, `sample-${Date.now()}-${file.name}`);
      fs.copyFileSync(srcPath, destPath);

      const parsed = await parseDocument(destPath, file.name);

      const docRecord = await Document.create({
        project: project._id,
        originalName: file.name,
        mimeType: file.mime,
        size: fs.statSync(destPath).size,
        filePath: destPath,
        fileType: parsed.fileType,
        status: 'processed',
        rawText: parsed.rawText,
        wordCount: parsed.wordCount,
        pageCount: parsed.pageCount,
        sections: parsed.sections,
        uploadedBy: req.user._id,
      });

      docRecords.push(docRecord);

      await ActivityLog.create({
        project: project._id,
        user: req.user._id,
        userName: req.user.name,
        action: 'document_uploaded',
        entityType: 'document',
        entityId: docRecord._id,
        title: `Document "${file.name}" Parsed`,
        details: `Parsed ${parsed.wordCount} words and ${parsed.sections.length} sections with line citations.`,
        severity: 'info',
      });
    }

    // 3. AI Project Knowledge Reconstruction
    const knowledgeData = await reconstructProjectKnowledge(project, docRecords);
    const knowledgeRecord = await ExtractedKnowledge.create(knowledgeData);

    // 4. Knowledge Gap Radar
    const rawGaps = await detectKnowledgeGaps(project, docRecords);
    const insertedGaps = await KnowledgeGap.insertMany(rawGaps);

    // 5. Conflict Detection
    const rawConflicts = await detectConflicts(project, docRecords);
    const insertedConflicts = await Conflict.insertMany(rawConflicts);

    // 6. Knowledge Health Calculation
    const healthResult = calculateKnowledgeHealth(
      knowledgeData.confidenceStats,
      knowledgeData.objectives.length + knowledgeData.completedTasks.length,
      knowledgeData.confidenceStats.confirmedPercentage,
      knowledgeData.confidenceStats.inferredPercentage,
      knowledgeData.confidenceStats.unknownPercentage,
      insertedGaps,
      insertedConflicts
    );

    // 7. Update Project
    project.healthScore = healthResult.score;
    project.status = 'reconstructed';
    project.lastReconstructedAt = new Date();
    project.stats.totalDocuments = docRecords.length;
    project.stats.confirmedFacts = knowledgeData.confidenceStats.confirmedPercentage;
    project.stats.inferredFacts = knowledgeData.confidenceStats.inferredPercentage;
    project.stats.openGaps = insertedGaps.length;
    project.stats.unresolvedConflicts = insertedConflicts.length;
    await project.save();

    // 8. Generate Initial Handover
    await Handover.create({
      project: project._id,
      title: `${project.name} Production Handover Dossier`,
      version: '1.0.0',
      status: 'draft',
      summary: knowledgeData.overview.summary,
      sections: {
        projectOverview: knowledgeData.overview.summary,
        projectObjectives: knowledgeData.objectives.map(o => ({ title: o.title, description: o.description, status: o.status })),
        currentStatus: 'Ready for Human Review & Sign-off',
        technicalArchitecture: {
          overview: knowledgeData.technicalArchitecture.overview,
          components: knowledgeData.technicalArchitecture.components,
        },
        technologyStack: knowledgeData.technologyStack,
        importantDecisions: knowledgeData.decisions,
        completedTasks: knowledgeData.completedTasks,
        pendingTasks: knowledgeData.pendingTasks,
        teamResponsibilities: knowledgeData.teamResponsibilities,
        dependencies: knowledgeData.dependencies,
        risks: knowledgeData.risks,
        knowledgeGaps: insertedGaps.map(g => ({ title: g.title, severity: g.severity, recommendation: g.recommendedAction, status: g.status })),
        unresolvedConflicts: insertedConflicts.map(c => ({ topic: c.topic, statementA: c.statementA.claim, statementB: c.statementB.claim, severity: c.severity })),
        recommendedNextActions: [
          'Assign an owner to the critical QA integration testing suite in the Knowledge Gap Radar.',
          'Convene an architectural sync to resolve the MongoDB vs PostgreSQL ledger conflict.',
          'Document production environment secrets in a verified deployment runbook.',
        ],
      },
      metadata: {
        totalDocumentsAnalyzed: docRecords.length,
        verifiedItemsCount: knowledgeData.objectives.length + knowledgeData.completedTasks.length,
        unresolvedGapsCount: insertedGaps.length,
        unresolvedConflictsCount: insertedConflicts.length,
        knowledgeHealthScore: healthResult.score,
      },
      generatedBy: req.user._id,
    });

    await ActivityLog.create({
      project: project._id,
      user: req.user._id,
      userName: req.user.name,
      action: 'reconstruction_completed',
      entityType: 'reconstruction',
      entityId: knowledgeRecord._id,
      title: 'Full Knowledge Continuity Pipeline Completed',
      details: `Project Health: ${healthResult.score}% (${healthResult.rating}). 3 documents ingested, ${insertedGaps.length} gaps identified, ${insertedConflicts.length} contradictions cataloged.`,
      severity: 'success',
    });

    res.status(201).json({
      success: true,
      message: 'Realistic sample banking project loaded successfully!',
      project,
      documentsCount: docRecords.length,
      gapsCount: insertedGaps.length,
      conflictsCount: insertedConflicts.length,
      health: healthResult,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { loadSampleProject };
