const path = require('path');
const fs = require('fs');

const Handover = require('../models/Handover');
const Project = require('../models/Project');
const ExtractedKnowledge = require('../models/ExtractedKnowledge');
const KnowledgeGap = require('../models/KnowledgeGap');
const Conflict = require('../models/Conflict');
const ActivityLog = require('../models/ActivityLog');

const {
  generateHandoverPDF,
} = require('../services/pdfExportService');


// ==========================================
// GENERATE HANDOVER REPORT
// ==========================================

const generateHandover = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { title, version } = req.body;

    const project = await Project.findOne({
      _id: projectId,
      owner: req.user._id,
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    const knowledge = await ExtractedKnowledge
      .findOne({ project: projectId })
      .sort({ version: -1 });

    const gaps = await KnowledgeGap.find({
      project: projectId,
    });

    const conflicts = await Conflict.find({
      project: projectId,
    });

    const openGaps = gaps.filter(
      g => g.status === 'open'
    );

    const unresolvedConflicts = conflicts.filter(
      c => c.status === 'unresolved'
    );

    const handoverDoc = await Handover.create({

      project: project._id,

      title:
        title ||
        `${project.name} Engineering Handover Dossier`,

      version: version || '1.0.0',

      status: 'draft',

      summary:
        knowledge?.overview?.summary ||
        `${project.name} comprehensive operational and architectural handover document.`,

      sections: {

        projectOverview:
          knowledge?.overview?.summary ||
          project.description,

        projectObjectives:
          (knowledge?.objectives || []).map(o => ({
            title: o.title,
            description: o.description,
            status: o.status,
          })),

        currentStatus:
          project.status === 'reconstructed'
            ? 'Ready for Handover Review'
            : 'Active Documentation',

        technicalArchitecture: {

          overview:
            knowledge?.technicalArchitecture?.overview ||
            'Layered modular service architecture',

          components:
            (
              knowledge?.technicalArchitecture?.components ||
              []
            ).map(c => ({
              name: c.name,
              role: c.role,
              technologies: c.technologies,
            })),
        },

        technologyStack:
          (knowledge?.technologyStack || []).map(t => ({
            category: t.category,
            technology: t.technology,
            version: t.version,
            status: t.status,
          })),

        importantDecisions:
          (knowledge?.decisions || []).map(d => ({
            decision: d.decision,
            rationale: d.rationale,
            date: d.date,
          })),

        completedTasks:
          (knowledge?.completedTasks || []).map(t => ({
            title: t.title,
            owner: t.owner,
            status: t.status,
          })),

        pendingTasks:
          (knowledge?.pendingTasks || []).map(t => ({
            title: t.title,
            owner: t.owner,
            priority: t.severity || 'High',
            blocker:
              t.status === 'unknown'
                ? 'Unassigned Owner'
                : 'Pending Review',
          })),

        teamResponsibilities:
          (knowledge?.teamResponsibilities || []).map(r => ({
            name: r.name,
            role: r.role,
            responsibilities: r.responsibilities,
          })),

        dependencies:
          (knowledge?.dependencies || []).map(d => ({
            item: d.item,
            dependsOn: d.dependsOn,
            status: d.status,
          })),

        risks:
          (knowledge?.risks || []).map(r => ({
            title: r.title,
            impact: r.impact,
            mitigation: r.mitigation,
          })),

        knowledgeGaps:
          openGaps.map(g => ({
            title: g.title,
            severity: g.severity,
            recommendation: g.recommendedAction,
            status: g.status,
          })),

        unresolvedConflicts:
          unresolvedConflicts.map(c => ({
            topic: c.topic,
            statementA: c.statementA.claim,
            statementB: c.statementB.claim,
            severity: c.severity,
          })),

        recommendedNextActions: [
          'Review and resolve the unassigned tasks documented in the Knowledge Gap Radar.',
          'Schedule an architectural alignment meeting to finalize database choice and cloud hosting platform.',
          'Execute the integration test suite in staging to verify third-party API keys.',
          'Complete outgoing engineer knowledge transfer sign-off session.',
        ],
      },

      metadata: {

        totalDocumentsAnalyzed:
          project.stats.totalDocuments || 1,

        verifiedItemsCount:
          (knowledge?.objectives?.length || 0) +
          (knowledge?.completedTasks?.length || 0),

        unresolvedGapsCount: openGaps.length,

        unresolvedConflictsCount:
          unresolvedConflicts.length,

        knowledgeHealthScore:
          project.healthScore || 85,
      },

      generatedBy: req.user._id,
    });

    await ActivityLog.create({

      project: project._id,
      user: req.user._id,
      userName: req.user.name,

      action: 'handover_generated',

      entityType: 'handover',
      entityId: handoverDoc._id,

      title:
        `Handover Dossier v${handoverDoc.version} Generated`,

      details:
        `Generated with ${handoverDoc.metadata.verifiedItemsCount} verified items, ${openGaps.length} open gaps, and ${unresolvedConflicts.length} unresolved conflicts.`,

      severity: 'success',
    });

    return res.status(201).json({
      success: true,
      handover: handoverDoc,
    });

  } catch (err) {
    next(err);
  }
};


// ==========================================
// GET PROJECT HANDOVERS
// ==========================================

const getProjectHandovers = async (req, res, next) => {
  try {

    const { projectId } = req.params;

    const project = await Project.findOne({
      _id: projectId,
      owner: req.user._id,
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    const handovers = await Handover
      .find({ project: projectId })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: handovers.length,
      handovers,
    });

  } catch (err) {
    next(err);
  }
};


// ==========================================
// GET SINGLE HANDOVER
// ==========================================

const getHandoverById = async (req, res, next) => {
  try {

    const handover = await Handover.findById(req.params.id);

    if (!handover) {
      return res.status(404).json({
        success: false,
        message: 'Handover report not found',
      });
    }

    const project = await Project.findOne({
      _id: handover.project,
      owner: req.user._id,
    });

    if (!project) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    res.json({
      success: true,
      handover,
    });

  } catch (err) {
    next(err);
  }
};


// ==========================================
// UPDATE HANDOVER
// ==========================================

const updateHandover = async (req, res, next) => {
  try {

    const { id } = req.params;

    const {
      title,
      summary,
      sections,
      status,
    } = req.body;

    const handover = await Handover.findById(id);

    if (!handover) {
      return res.status(404).json({
        success: false,
        message: 'Handover report not found',
      });
    }

    const project = await Project.findOne({
      _id: handover.project,
      owner: req.user._id,
    });

    if (!project) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    if (title) handover.title = title;

    if (summary !== undefined) {
      handover.summary = summary;
    }

    if (sections) {
      handover.sections = {
        ...handover.sections.toObject?.() || handover.sections,
        ...sections,
      };
    }

    if (status) handover.status = status;

    await handover.save();

    res.json({
      success: true,
      handover,
    });

  } catch (err) {
    next(err);
  }
};


// ==========================================
// EXPORT HANDOVER PDF
// ==========================================

const exportHandoverPDF = async (req, res, next) => {
  try {

    const { id } = req.params;

    const handover = await Handover.findById(id);

    if (!handover) {
      return res.status(404).json({
        success: false,
        message: 'Handover report not found',
      });
    }

    const project = await Project.findOne({
      _id: handover.project,
      owner: req.user._id,
    });

    if (!project) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    // Generate actual PDF file
    const generatedPath = await generateHandoverPDF(
      handover,
      project
    );

    if (!generatedPath) {
      throw new Error('PDF generation returned an empty path');
    }

    const pdfPath = path.resolve(generatedPath);

    // Verify file exists
    await fs.promises.access(
      pdfPath,
      fs.constants.R_OK
    );

    // Verify actual PDF signature
    const fileHandle = await fs.promises.open(
      pdfPath,
      'r'
    );

    const header = Buffer.alloc(5);

    try {
      await fileHandle.read(header, 0, 5, 0);
    } finally {
      await fileHandle.close();
    }

    if (header.toString() !== '%PDF-') {
      throw new Error(
        'Generated file is not a valid PDF document'
      );
    }

    // Save generated PDF path
    handover.pdfPath = pdfPath;

    await handover.save();

    // Activity log
    await ActivityLog.create({

      project: project._id,
      user: req.user._id,
      userName: req.user.name,

      action: 'handover_exported',

      entityType: 'handover',
      entityId: handover._id,

      title:
        `Handover PDF Generated: ${path.basename(pdfPath)}`,

      details:
        'Executive PDF ready for download and offline distribution.',

      severity: 'info',
    });

    res.json({

      success: true,

      pdfUrl:
        `/api/handovers/${id}/download-pdf`,

      message: 'PDF exported successfully',
    });

  } catch (err) {
    next(err);
  }
};


// ==========================================
// DOWNLOAD GENERATED PDF
// ==========================================

const downloadHandoverPDF = async (req, res, next) => {
  try {

    const { id } = req.params;

    const handover = await Handover.findById(id);

    if (!handover || !handover.pdfPath) {
      return res.status(404).json({
        success: false,
        message: 'PDF report not found. Generate it first.',
      });
    }

    const project = await Project.findOne({
      _id: handover.project,
      owner: req.user._id,
    });

    if (!project) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    const pdfPath = path.resolve(handover.pdfPath);

    await fs.promises.access(
      pdfPath,
      fs.constants.R_OK
    );

    const fileHandle = await fs.promises.open(
      pdfPath,
      'r'
    );

    const header = Buffer.alloc(5);

    try {
      await fileHandle.read(header, 0, 5, 0);
    } finally {
      await fileHandle.close();
    }

    if (header.toString() !== '%PDF-') {
      return res.status(500).json({
        success: false,
        message: 'Stored file is not a valid PDF.',
      });
    }

    const filename =
      `THREADKEEP-Handover-${id}.pdf`;

    res.download(pdfPath, filename, (err) => {

      if (err) {
        console.error('PDF Download Error:', err);

        if (!res.headersSent) {
          next(err);
        }
      }

    });

  } catch (err) {

    if (err.code === 'ENOENT') {
      return res.status(404).json({
        success: false,
        message: 'PDF file not found on server.',
      });
    }

    next(err);
  }
};


// ==========================================
// EXPORT CONTROLLERS
// ==========================================

module.exports = {

  generateHandover,

  getProjectHandovers,

  getHandoverById,

  updateHandover,

  exportHandoverPDF,

  downloadHandoverPDF,
};