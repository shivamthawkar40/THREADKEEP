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
    const { title, version } = req.body || {};

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
      gap => gap.status === 'open'
    );

    const unresolvedConflicts = conflicts.filter(
      conflict => conflict.status === 'unresolved'
    );

    // ======================================
    // 1. PREPARE KNOWLEDGE DATA
    // ======================================

    const objectives = knowledge?.objectives || [];

    const architecture =
      knowledge?.technicalArchitecture || {};

    const architectureComponents =
      architecture.components || [];

    const technologyStack =
      knowledge?.technologyStack || [];

    const decisions =
      knowledge?.decisions || [];

    const completedTasks =
      knowledge?.completedTasks || [];

    const pendingTasks =
      knowledge?.pendingTasks || [];

    // ======================================
    // 2. COMPLETENESS VALIDATION
    // ======================================

    const checks = [];

    checks.push({
      name: 'Project Objectives',
      passed: objectives.length > 0,
      details: objectives.length > 0
        ? `${objectives.length} objectives documented.`
        : 'No explicit project objectives recorded.',
    });

    const hasArchitecture = Boolean(
      architecture.overview?.trim() ||
      architectureComponents.length > 0
    );

    checks.push({
      name: 'Technical Architecture',
      passed: hasArchitecture,
      details: hasArchitecture
        ? 'Technical architecture information is available.'
        : 'Technical architecture details are missing.',
    });

    // Detect ownership-related knowledge gaps
    const ownershipGaps = openGaps.filter(gap => {
      const gapText = [
        gap.title,
        gap.description,
        gap.recommendedAction,
        gap.category,
        gap.code,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return /owner|ownership|unassigned|task assignment/.test(
        gapText
      );
    });

    // Detect pending tasks without assigned owners
    const unassignedTasks = pendingTasks.filter(task => {
      const owner = String(task.owner || '')
        .trim()
        .toLowerCase();

      return !owner || owner === 'unassigned';
    });

    // Ownership passes only when neither source reports an issue
    const hasOwnershipIssues =
      unassignedTasks.length > 0 ||
      ownershipGaps.length > 0;

    checks.push({
      name: 'Pending Task Ownership',
      passed: !hasOwnershipIssues,
      details: hasOwnershipIssues
        ? [
            unassignedTasks.length > 0
              ? `${unassignedTasks.length} pending tasks have no assigned owner.`
              : null,
            ownershipGaps.length > 0
              ? `${ownershipGaps.length} ownership-related knowledge gaps remain unresolved.`
              : null,
          ].filter(Boolean).join(' ')
        : pendingTasks.length > 0
          ? 'All pending tasks have assigned owners and no ownership gaps were detected.'
          : 'No pending tasks or unresolved ownership gaps are recorded.',
    });

    const documentCount = Number(
      project.stats?.totalDocuments || 0
    );

    checks.push({
      name: 'Source Documents',
      passed: documentCount > 0,
      details: documentCount > 0
        ? `${documentCount} source documents recorded.`
        : 'No analyzed source documents recorded.',
    });

    checks.push({
      name: 'Knowledge Gaps',
      passed: openGaps.length === 0,
      details: openGaps.length > 0
        ? `${openGaps.length} unresolved knowledge gaps found.`
        : 'No open knowledge gaps found.',
    });

    checks.push({
      name: 'Document Conflicts',
      passed: unresolvedConflicts.length === 0,
      details: unresolvedConflicts.length > 0
        ? `${unresolvedConflicts.length} unresolved conflicts found.`
        : 'No unresolved document conflicts found.',
    });

    // ======================================
    // 3. CALCULATE COMPLETENESS SCORE
    // ======================================

    const passedChecks = checks.filter(
      check => check.passed
    ).length;

    const completenessScore = Math.round(
      (passedChecks / checks.length) * 100
    );

    // ======================================
    // 4. GENERATE WARNINGS
    // ======================================

    const warnings = [];

    if (objectives.length === 0) {
      warnings.push({
        code: 'MISSING_OBJECTIVES',
        title: 'Project objectives missing',
        description:
          'Add explicit project objectives before final handover.',
        severity: 'high',
      });
    }

    if (!hasArchitecture) {
      warnings.push({
        code: 'MISSING_ARCHITECTURE',
        title: 'Technical architecture missing',
        description:
          'Document the actual system architecture and components.',
        severity: 'high',
      });
    }

    if (unassignedTasks.length > 0) {
      warnings.push({
        code: 'UNASSIGNED_TASKS',
        title: 'Pending tasks without owners',
        description:
          `${unassignedTasks.length} pending tasks need assigned owners.`,
        severity: 'medium',
      });
    }

    if (documentCount === 0) {
      warnings.push({
        code: 'MISSING_DOCUMENTS',
        title: 'Source documents unavailable',
        description:
          'No analyzed source documents are recorded for this project.',
        severity: 'high',
      });
    }

    openGaps.forEach(gap => {
      warnings.push({
        code: 'OPEN_KNOWLEDGE_GAP',
        title: gap.title || 'Unresolved knowledge gap',
        description:
          gap.recommendedAction ||
          'Review and resolve this knowledge gap.',
        severity: ['critical', 'high'].includes(
          String(gap.severity || '').toLowerCase()
        ) ? 'critical' : 'medium',
      });
    });

    unresolvedConflicts.forEach(conflict => {
      const severity = String(
        conflict.severity || ''
      ).toLowerCase();

      warnings.push({
        code: 'UNRESOLVED_CONFLICT',
        title: conflict.topic || 'Document conflict',
        description:
          'Conflicting statements require verification.',
        severity: ['critical', 'high'].includes(severity)
          ? 'critical'
          : 'medium',
      });
    });

    // ======================================
    // 5. DETERMINE COMPLETENESS STATUS
    // ======================================

    const hasCriticalWarning = warnings.some(
      warning => warning.severity === 'critical'
    );

    let completenessStatus = 'incomplete';

    if (
      completenessScore >= 90 &&
      !hasCriticalWarning
    ) {
      completenessStatus = 'complete';
    } else if (
      completenessScore >= 60 &&
      !hasCriticalWarning
    ) {
      completenessStatus = 'needs_attention';
    }

    // ======================================
    // 6. GENERATE NEXT ACTIONS
    // ======================================

    const recommendedNextActions = warnings.map(
      warning =>
        `${warning.title}: ${warning.description}`
    );

    if (recommendedNextActions.length === 0) {
      recommendedNextActions.push(
        'Review the handover with the incoming team before final approval.'
      );
    }

    // ======================================
    // 7. CREATE HANDOVER DOCUMENT
    // ======================================

    const handoverDoc = await Handover.create({
      project: project._id,

      title: title ||
        `${project.name} Engineering Handover Dossier`,

      version: version || '1.0.0',

      status: 'draft',

      summary:
        knowledge?.overview?.summary || '',

      sections: {
        projectOverview:
          knowledge?.overview?.summary ||
          project.description ||
          '',

        projectObjectives: objectives.map(objective => ({
          title: objective.title,
          description: objective.description,
          status: objective.status,
        })),

        currentStatus:
          project.status === 'reconstructed'
            ? 'Ready for Handover Review'
            : 'Active Documentation',

        technicalArchitecture: {
          overview: architecture.overview || '',
          components: architectureComponents.map(component => ({
            name: component.name,
            role: component.role,
            technologies: component.technologies || [],
          })),
        },

        technologyStack: technologyStack.map(technology => ({
          category: technology.category,
          technology: technology.technology,
          version: technology.version,
          status: technology.status,
        })),

        importantDecisions: decisions.map(decision => ({
          decision: decision.decision,
          rationale: decision.rationale,
          date: decision.date,
        })),

        completedTasks: completedTasks.map(task => ({
          title: task.title,
          owner: task.owner,
          status: task.status,
        })),

        pendingTasks: pendingTasks.map(task => ({
          title: task.title,
          owner: task.owner || 'Unassigned',
          priority: task.severity || 'High',
          blocker: task.status === 'unknown'
            ? 'Requires clarification'
            : 'Pending review',
        })),

        teamResponsibilities:
          (knowledge?.teamResponsibilities || []).map(role => ({
            name: role.name,
            role: role.role,
            responsibilities: role.responsibilities || [],
          })),

        dependencies:
          (knowledge?.dependencies || []).map(dependency => ({
            item: dependency.item,
            dependsOn: dependency.dependsOn,
            status: dependency.status,
          })),

        risks:
          (knowledge?.risks || []).map(risk => ({
            title: risk.title,
            impact: risk.impact,
            mitigation: risk.mitigation,
          })),

        knowledgeGaps: openGaps.map(gap => ({
          title: gap.title,
          severity: gap.severity,
          recommendation: gap.recommendedAction,
          status: gap.status,
        })),

        unresolvedConflicts: unresolvedConflicts.map(conflict => ({
          topic: conflict.topic,
          statementA: conflict.statementA?.claim || '',
          statementB: conflict.statementB?.claim || '',
          severity: conflict.severity,
        })),

        recommendedNextActions,
      },

      // Knowledge health and handover completeness
      // are separate metrics.
      metadata: {
        totalDocumentsAnalyzed: documentCount,

        verifiedItemsCount: [
          ...objectives,
          ...technologyStack,
          ...decisions,
          ...completedTasks,
        ].filter(item =>
          Array.isArray(item.sources) &&
          item.sources.length > 0
        ).length,

        unresolvedGapsCount: openGaps.length,

        unresolvedConflictsCount:
          unresolvedConflicts.length,

        knowledgeHealthScore:
          Number.isFinite(Number(project.healthScore))
            ? Number(project.healthScore)
            : null,
      },

      completeness: {
        score: completenessScore,
        status: completenessStatus,
        warnings,
        checks,
      },

      generatedBy: req.user._id,
    });

    // ======================================
    // 8. ACTIVITY LOG
    // ======================================

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
        `Completeness: ${completenessScore}%. ${passedChecks}/${checks.length} checks passed. ${openGaps.length} open gaps and ${unresolvedConflicts.length} unresolved conflicts.`,

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

    if (title) {
      handover.title = title;
    }

    if (summary !== undefined) {
      handover.summary = summary;
    }

    if (sections) {
      const existingSections =
        handover.sections?.toObject
          ? handover.sections.toObject()
          : handover.sections || {};

      handover.sections = {
        ...existingSections,
        ...sections,
      };
    }

    if (status) {
      handover.status = status;
    }

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

    const generatedPath = await generateHandoverPDF(
      handover,
      project
    );

    if (!generatedPath) {
      throw new Error(
        'PDF generation returned an empty path'
      );
    }

    const pdfPath = path.resolve(generatedPath);

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
      throw new Error(
        'Generated file is not a valid PDF document'
      );
    }

    handover.pdfPath = pdfPath;

    await handover.save();

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
      pdfUrl: `/api/handovers/${id}/download-pdf`,
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

    res.download(pdfPath, filename, err => {
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