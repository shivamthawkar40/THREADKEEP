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
const { generateStructuredAI } = require('../services/geminiService');
const { SAMPLE_FILES_DIR, UPLOAD_DIR } = require('../config/env');
const {
  reconstructProjectKnowledge,
  detectKnowledgeGaps,
  detectConflicts,
  calculateKnowledgeHealth,
} = require('../services/intelligenceEngine');

// @desc    Load realistic sample project with multiple documents and full AI reconstruction
// @route   POST /api/sample/load

// Evidence-backed fallback for the FinPulse sample documents.
// This is deterministic analysis, not AI-generated output.
const buildFinPulseFallback = (documents = []) => {
    const source = (fileName, excerpt, sectionTitle) => {
    const doc = documents.find(d => d.originalName === fileName);
    if (!doc) throw new Error(`Fallback source document missing: ${fileName}`);

    const rawText = String(doc.rawText || '');
    const normalized = value => String(value).toLowerCase().replace(/[^a-z0-9]/g, '');
    const target = normalized(excerpt);

    let verifiedExcerpt = rawText.includes(excerpt) ? excerpt : '';

    if (!verifiedExcerpt) {
      const lines = rawText.split(/\r?\n/);
      const matched = lines.find(line => {
        const candidate = normalized(line);
        return candidate.includes(target) || target.includes(candidate) && candidate.length > 35;
      });
      if (matched) verifiedExcerpt = matched;
    }

    if (!verifiedExcerpt && fileName.toLowerCase().endsWith('.csv')) {
      const recordId = String(excerpt).match(/DEC-\d+/)?.[0];
      verifiedExcerpt = lines.find(line => line.includes(`DecisionID=${recordId}`)) || '';
    }

    if (!verifiedExcerpt) {
      throw new Error(`Fallback evidence could not be verified in ${fileName}: ${excerpt}`);
    }

    return {
      documentId: String(doc._id),
      documentName: doc.originalName,
      pageNumber: 1,
      sectionTitle,
      lineRange: 'Not available',
      excerpt: verifiedExcerpt
    };
  };
  const architecture = 'FinPulse_Architecture_Spec_v1.txt';
  const handover = 'FinPulse_Sprint_Handover_Notes_v2.txt';

  const mongo = '4. Database Persistence Store: MongoDB (v7.0) configured as the primary persistence layer for flexible financial document models, rapid schema iteration, and high write throughput.';
  const postgres = 'Consequently, we decided to migrate the primary database from MongoDB to PostgreSQL (v16).';
  const aws = '5. Cloud Infrastructure: Hosted on Amazon Web Services (AWS) using AWS ECS Fargate containers and AWS S3 for ledger archive storage.';
  const gcp = 'Due to high data transfer and egress costs on AWS, leadership decided to migrate staging and production workloads to Google Cloud Platform (GCP Cloud Run).';

  const evidence = (file, excerpt, section) =>
    source(file, excerpt, section);

  return {
    overview: {
      summary: 'FinPulse is a core banking transaction settlement platform designed for high throughput, low latency and auditable financial operations.',
      problemStatement: 'The platform must support resilient transaction settlement, real-time auditability and multi-tenant ledger isolation.',
      targetAudience: 'Tier-1 digital banks, payment service providers and neo-banking operations.',
      sources: [
        evidence(architecture, 'Goal: Architect a resilient, sub-100 millisecond core banking transaction settlement engine.', 'Executive Overview & Objectives')
      ]
    },

    objectives: [
      {
        title: 'Achieve sub-100 millisecond transaction settlement',
        status: 'confirmed',
        sources: [evidence(architecture, 'Goal: Architect a resilient, sub-100 millisecond core banking transaction settlement engine.', 'Executive Overview & Objectives')]
      },
      {
        title: 'Support 10,000 transactions per second with real-time auditability',
        status: 'confirmed',
        sources: [evidence(architecture, 'Aim: Support 10,000 transactions per second with real-time auditability and multi-tenant ledger isolation.', 'Executive Overview & Objectives')]
      }
    ],

    technologyStack: [
      { technology: 'React.js', status: 'confirmed', sources: [evidence(architecture, '- Frontend: React.js, Tailwind CSS, Axios, Lucide Icons', 'Technology Stack')] },
      { technology: 'Tailwind CSS', status: 'confirmed', sources: [evidence(architecture, '- Frontend: React.js, Tailwind CSS, Axios, Lucide Icons', 'Technology Stack')] },
      { technology: 'Node.js and Express.js', status: 'confirmed', sources: [evidence(architecture, '- Backend: Node.js, Express.js REST API', 'Technology Stack')] },
      { technology: 'MongoDB with Mongoose ODM (legacy specification; migration conflict detected)', status: 'inferred', sources: [evidence(architecture, '- Primary Database: MongoDB with Mongoose ODM', 'Technology Stack')] },
      { technology: 'Redis cluster v7.2', status: 'confirmed', sources: [evidence(architecture, '- Cache Layer: Redis cluster (v7.2)', 'Technology Stack')] },
      { technology: 'AWS ECS and S3 (legacy specification; migration conflict detected)', status: 'inferred', sources: [evidence(architecture, '- Cloud & Hosting: Amazon Web Services (AWS ECS / S3)', 'Technology Stack')] }
    ],

    decisions: [
      {
        decision: 'Use a modular multi-stage pipeline separating parsing from AI inference',
        status: 'confirmed',
        sources: [evidence('FinPulse_Decisions_and_Risks.csv', 'Row 1: DecisionID=DEC-01 | Category=Architecture | DecisionSummary=Modular Multi-Stage Pipeline | Rationale=Separates parsing from AI inference for auditability | DecidedBy=Lead Architect | Date=2026-09-12 | Status=Confirmed | RiskLevel=Low', 'Decision Register')]
      },
      {
        decision: 'Migrate primary database from MongoDB to PostgreSQL',
        status: 'inferred',
        sources: [evidence(handover, postgres, 'Urgent Architectural Shifts & Contradictions')]
      }
    ],

    completedTasks: [
      {
        title: 'Core banking REST API specification finalized',
        status: 'confirmed',
        sources: [evidence(architecture, '- Task C1: Core banking REST API specification finalized. Owner: Lead Developer.', 'Completed Tasks & Workstreams')]
      },
      {
        title: 'Double-entry ledger data models designed',
        status: 'confirmed',
        sources: [evidence(architecture, '- Task C2: Double-entry ledger data models designed. Owner: Database Engineer.', 'Completed Tasks & Workstreams')]
      },
      {
        title: 'JWT authentication and role-based access control implemented',
        status: 'confirmed',
        sources: [evidence(architecture, '- Task C3: JWT authentication and role-based access control implemented. Owner: Security Architect.', 'Completed Tasks & Workstreams')]
      }
    ],

    pendingTasks: [
      {
        title: 'Complete end-to-end testing and automated regression suite',
        status: 'unknown',
        sources: [evidence(handover, 'We have no integration tests or automated regression suites.', 'Incomplete Workstreams & Knowledge Gaps')]
      },
      {
        title: 'Create production deployment runbook and CI/CD instructions',
        status: 'unknown',
        sources: [evidence(handover, 'We have no automated CI/CD pipeline script or production Dockerfile committed.', 'Incomplete Workstreams & Knowledge Gaps')]
      }
    ],

    teamResponsibilities: [],
    dependencies: [],
    risks: [],
    milestones: [],

    technicalArchitecture: {
      overview: 'Decoupled multi-tier microservice architecture with client presentation, API gateway, ledger service, database persistence and cloud infrastructure.',
      pattern: 'Microservices / decoupled multi-tier architecture',
      components: [
        { name: 'Client Presentation Layer', status: 'confirmed', sources: [evidence(architecture, '1. Client Presentation Layer: Built with React.js (v18.3) and Tailwind CSS for high-density transactionalfinancial dashboards.', 'Technical Architecture & System Components')] },
        { name: 'API Gateway & Auth Service', status: 'confirmed', sources: [evidence(architecture, '2. API Gateway & Auth Service: Node.js reverse proxy handling JWT authentication (RFC 7519), rate limiting, and request sanitization.', 'Technical Architecture & System Components')] },
        { name: 'Core Ledger Service', status: 'confirmed', sources: [evidence(architecture, '3. Core Ledger Service: Node.js Express service orchestrating double-entry bookkeeping transactions.', 'Technical Architecture & System Components')] },
        { name: 'Database Persistence Store', status: 'inferred', sources: [evidence(architecture, mongo, 'Technical Architecture & System Components')] },
        { name: 'Cloud Infrastructure', status: 'inferred', sources: [evidence(architecture, aws, 'Technical Architecture & System Components')] }
      ],
      diagramNodes: [],
      diagramEdges: [],
      sources: [evidence(architecture, 'The FinPulse platform is engineered as a decoupled, multi-tier microservice system:', 'Technical Architecture & System Components')]
    },

    gaps: [
      {
        title: 'End-to-end testing suite is missing',
        category: 'incomplete_testing',
        severity: 'critical',
        explanation: 'The handover document reports that integration tests and automated regression suites are absent.',
        whyItMatters: 'Regressions may go undetected during onboarding and future releases.',
        suggestedQuestion: 'Who will own and deliver the end-to-end testing suite?',
        recommendedAction: 'Assign a QA owner and establish Cypress integration and regression tests.',
        evidence: [evidence(handover, 'We have no integration tests or automated regression suites.', 'Incomplete Workstreams & Knowledge Gaps')]
      },
      {
        title: 'Production deployment runbook is missing',
        category: 'missing_deployment_instructions',
        severity: 'high',
        explanation: 'The handover reports missing CI/CD scripts and production Dockerfile.',
        whyItMatters: 'Incoming developers lack a documented deployment sequence.',
        suggestedQuestion: 'What are the approved production deployment steps and environment requirements?',
        recommendedAction: 'Create a deployment runbook, production Dockerfile and CI/CD documentation.',
        evidence: [evidence(handover, 'We have no automated CI/CD pipeline script or production Dockerfile committed.', 'Incomplete Workstreams & Knowledge Gaps')]
      },
      {
        title: 'Redis deployment strategy is undecided',
        category: 'missing_technical_decision',
        severity: 'medium',
        explanation: 'The handover leaves the managed Redis versus distributed in-memory caching choice unresolved.',
        whyItMatters: 'Caching architecture and operational ownership remain unclear.',
        suggestedQuestion: 'Should Redis be a separate managed instance or distributed in-memory caching?',
        recommendedAction: 'Evaluate both options and record an approved architecture decision.',
        evidence: [evidence(handover, 'Should we implement Redis as a separate managed instance or rely on distributed in-memory caching?', 'Incomplete Workstreams & Knowledge Gaps')]
      },
      {
        title: 'Stripe webhook retry and rate-limit policies are undocumented',
        category: 'unclear_dependency',
        severity: 'high',
        explanation: 'The integration policies for Stripe webhooks are not documented.',
        whyItMatters: 'High-volume bursts could result in unhandled webhook events.',
        suggestedQuestion: 'What retry, rate-limit and failure-recovery policies apply to Stripe webhooks?',
        recommendedAction: 'Document webhook limits, retry behavior and event recovery procedures.',
        evidence: [evidence(handover, '- Unclear Dependency: Stripe webhook rate-limits and retry policies were not documented. High volume bursts could drop unhandled webhook events.', 'Third-Party Integrations & Risks')]
      }
    ],

    conflicts: [
      {
        topic: 'Primary database selection',
        category: 'technology_selection',
        severity: 'critical',
        conflictReason: 'The architecture specification identifies MongoDB as primary persistence, while the later handover states that the primary database is migrating to PostgreSQL.',
        statementA: {
          claim: 'MongoDB is the primary persistence layer.',
          ...evidence(architecture, mongo, 'Technical Architecture & System Components')
        },
        statementB: {
          claim: 'The primary database is migrating to PostgreSQL v16.',
          ...evidence(handover, postgres, 'Urgent Architectural Shifts & Contradictions')
        }
      },
      {
        topic: 'Cloud hosting provider',
        category: 'technology_selection',
        severity: 'high',
        conflictReason: 'The architecture specification describes AWS ECS and S3, while the later handover directs staging and production workloads to GCP Cloud Run.',
        statementA: {
          claim: 'The platform is hosted on AWS ECS Fargate and S3.',
          ...evidence(architecture, aws, 'Technical Architecture & System Components')
        },
        statementB: {
          claim: 'Staging and production workloads are moving to GCP Cloud Run.',
          ...evidence(handover, gcp, 'Urgent Architectural Shifts & Contradictions')
        }
      }
    ]
  };
};

const loadSampleProject = async (req, res, next) => {
  const created = {
    documentIds: [],
    knowledgeIds: [],
    gapIds: [],
    conflictIds: [],
    handoverIds: [],
    activityIds: [],
    filePaths: [],
  };

  let project = null;
  let projectWasCreated = false;
  let projectSnapshot = null;
  let previousRecords = null;

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
    project = await Project.findOne({
      name: 'FinPulse: Next-Gen Core Banking Platform',
      owner: req.user._id,
    });

    if (project) {
      projectSnapshot = {
        status: project.status,
        healthScore: project.healthScore,
        stats: project.stats?.toObject
          ? project.stats.toObject()
          : { ...project.stats },
        lastReconstructedAt: project.lastReconstructedAt,
      };

      previousRecords = {
        documents: await Document.find({ project: project._id })
          .select('_id filePath storageProvider')
          .lean(),
        knowledgeIds: await ExtractedKnowledge.distinct('_id', { project: project._id }),
        gapIds: await KnowledgeGap.distinct('_id', { project: project._id }),
        conflictIds: await Conflict.distinct('_id', { project: project._id }),
        handoverIds: await Handover.distinct('_id', { project: project._id }),
        activityIds: await ActivityLog.distinct('_id', { project: project._id }),
      };
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
      projectWasCreated = true;
    }

    const initialActivity = await ActivityLog.create({
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
    created.activityIds.push(initialActivity._id);

    // 2. Ingest and parse each sample file
    const docRecords = [];
    for (const file of sampleFiles) {
      const srcPath = path.join(SAMPLE_FILES_DIR, file.name);
      const destPath = path.join(UPLOAD_DIR, `sample-${Date.now()}-${file.name}`);
      fs.copyFileSync(srcPath, destPath);
      created.filePaths.push(destPath);

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
      created.documentIds.push(docRecord._id);

      const uploadActivity = await ActivityLog.create({
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
      created.activityIds.push(uploadActivity._id);
    }

    // 3. Generate structured AI analysis from sample documents
    const documentContext = docRecords.map((doc, index) => ({
      index: index + 1,
      documentName: doc.originalName,
      documentId: String(doc._id),
      content: doc.rawText || ''
    }));

    const samplePrompt = `
You are THREADKEEP Intelligence, an evidence-based project knowledge reconstruction system.

PROJECT:
${JSON.stringify({
  name: project.name,
  description: project.description,
  projectId: String(project._id)
}, null, 2)}

DOCUMENTS:
${JSON.stringify(documentContext, null, 2)}

TASK:
Analyze ONLY the supplied FinPulse project documents.
Return one valid JSON object with these top-level fields:

{
  "overview": {
    "summary": "string",
    "problemStatement": "string",
    "targetAudience": "string",
    "status": "confirmed | inferred | unknown",
    "sources": []
  },
  "objectives": [],
  "technicalArchitecture": {
    "overview": "string",
    "pattern": "string",
    "components": [],
    "diagramNodes": [],
    "diagramEdges": [],
    "sources": []
  },
  "technologyStack": [],
  "decisions": [],
  "completedTasks": [],
  "pendingTasks": [],
  "teamResponsibilities": [],
  "dependencies": [],
  "risks": [],
  "milestones": [],
  "gaps": [],
  "conflicts": []
}

ITEM FIELD REQUIREMENTS:

- objectives: id, title, description, category, status, confidenceScore, sources.
- technologyStack: category, technology, version, status, confidenceScore, sources.
- decisions: decision, rationale, alternativesConsidered, decidedBy, date, status, sources.
- completedTasks and pendingTasks: id, title, description, category, status, confidenceScore, owner, sources.
- teamResponsibilities: name, role, responsibilities, ownershipAreas, status, sources.
- dependencies: item, dependsOn, type, status, impact, sources.
- risks: title, description, impact, likelihood, mitigation, status, sources.
- milestones: title, targetDate, status, sources.
- technicalArchitecture.components: name, role, technologies, dependencies, status, sources.

ENUM RULES:
- Common knowledge status: confirmed, inferred, unknown.
- dependencies.type: internal, external, third_party ONLY.
- dependencies.status: resolved, pending, blocked ONLY.
- risks.impact: critical, high, medium, low ONLY.
- risks.likelihood: high, medium, low ONLY.
- milestones.status: completed, in_progress, delayed, unknown ONLY.
- Never use "unknown" for dependency type/status or risk impact/likelihood. Use an allowed value only when evidence supports it; otherwise omit the item or use an empty array.

GAP FORMAT:
Each gap must contain title, category, severity, explanation, whyItMatters, relatedInfo, evidence, suggestedQuestion, recommendedAction.
Use severity critical, high, medium or low.
Use category general when no more specific supported category is available.

CONFLICT FORMAT:
Each conflict must contain topic, category, severity, statementA, statementB, conflictReason.
Each statement must contain claim, documentName, documentId, pageNumber, sectionTitle, lineRange, excerpt.
Both excerpts must be exact continuous text from two independently supported contradictory claims.
Use category other when no more specific supported category is available.

SOURCE FORMAT:
Every source must contain documentName, documentId, pageNumber, sectionTitle and excerpt.
Use exact document names and IDs from the supplied documents.
Never invent citations, people, owners, dates, technologies or facts.
Use empty arrays when evidence is unavailable.
Do not create artificial gaps or conflicts.
Return JSON only. No Markdown fences.
`;

    const sampleSystemPrompt = `
You are THREADKEEP Intelligence.
Analyze only the supplied project documents.
Never mix unrelated project information.
Never invent facts, owners, citations or implementation status.
Every extracted knowledge item must have verifiable evidence.
Every excerpt must be copied exactly from the supplied documents.
Accuracy is more important than completeness.
Return valid JSON only.
`;

    let geminiResult;
    let analysisMode = 'ai';

    try {
      geminiResult = await generateStructuredAI(
        samplePrompt,
        sampleSystemPrompt
      );
    } catch (aiError) {
      console.warn(
        '[Sample Loader] AI providers unavailable; using evidence-backed deterministic analysis:',
        aiError.message
      );
      geminiResult = buildFinPulseFallback(docRecords);
      analysisMode = 'rule_based';
    }

    if (
      !geminiResult ||
      typeof geminiResult !== 'object' ||
      Array.isArray(geminiResult)
    ) {
      throw new Error('Sample AI analysis returned an invalid structured response.');
    }

    // 4. AI Project Knowledge Reconstruction
    const knowledgeData = await reconstructProjectKnowledge(
      project,
      docRecords,
      geminiResult
    );

    const knowledgeRecord = await ExtractedKnowledge.create(knowledgeData);
    created.knowledgeIds.push(knowledgeRecord._id);

    // 5. Knowledge Gap Radar
    const rawGaps = await detectKnowledgeGaps(
      project,
      docRecords,
      geminiResult
    );

    const insertedGaps = rawGaps.length
      ? await KnowledgeGap.insertMany(rawGaps)
      : [];
    created.gapIds.push(...insertedGaps.map(item => item._id));

    // 6. Conflict Detection
    const rawConflicts = await detectConflicts(
      project,
      docRecords,
      geminiResult
    );

    const insertedConflicts = rawConflicts.length
      ? await Conflict.insertMany(rawConflicts)
      : [];
    created.conflictIds.push(...insertedConflicts.map(item => item._id));

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
    const handoverRecord = await Handover.create({
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
    created.handoverIds.push(handoverRecord._id);

    const completionActivity = await ActivityLog.create({
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
    created.activityIds.push(completionActivity._id);

    // 9. New reconstruction is complete. Old records can now be retired.
    if (previousRecords) {
      try {
        await Promise.all([
          Document.deleteMany({ _id: { $in: previousRecords.documents.map(d => d._id) } }),
          ExtractedKnowledge.deleteMany({ _id: { $in: previousRecords.knowledgeIds } }),
          KnowledgeGap.deleteMany({ _id: { $in: previousRecords.gapIds } }),
          Conflict.deleteMany({ _id: { $in: previousRecords.conflictIds } }),
          Handover.deleteMany({ _id: { $in: previousRecords.handoverIds } }),
          ActivityLog.deleteMany({ _id: { $in: previousRecords.activityIds } }),
        ]);

        for (const oldDoc of previousRecords.documents) {
          if (
            oldDoc.storageProvider !== 'cloudinary' &&
            oldDoc.filePath &&
            fs.existsSync(oldDoc.filePath)
          ) {
            try {
              fs.unlinkSync(oldDoc.filePath);
            } catch (fileError) {
              console.warn('[Sample Cleanup] Could not remove old file:', fileError.message);
            }
          }
        }
      } catch (cleanupError) {
        // New sample is already complete. Keep it even if old-data cleanup fails.
        console.warn('[Sample Cleanup] Previous records were not fully retired:', cleanupError.message);
      }
    }

    res.status(201).json({
      success: true,
      message: analysisMode === 'ai' ? 'Realistic sample banking project loaded successfully with AI analysis.' : 'Sample project loaded with evidence-backed rule-based analysis because AI providers were unavailable.',
      analysisMode,
      project,
      documentsCount: docRecords.length,
      gapsCount: insertedGaps.length,
      conflictsCount: insertedConflicts.length,
      health: healthResult,
    });
  } catch (err) {
    console.error('[Sample Loader] Failed:', err.message);

    const cleanupTasks = [
      Document.deleteMany({ _id: { $in: created.documentIds } }),
      ExtractedKnowledge.deleteMany({ _id: { $in: created.knowledgeIds } }),
      KnowledgeGap.deleteMany({ _id: { $in: created.gapIds } }),
      Conflict.deleteMany({ _id: { $in: created.conflictIds } }),
      Handover.deleteMany({ _id: { $in: created.handoverIds } }),
      ActivityLog.deleteMany({ _id: { $in: created.activityIds } }),
    ];

    await Promise.allSettled(cleanupTasks);

    for (const filePath of created.filePaths) {
      try {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      } catch (fileError) {
        console.warn('[Sample Rollback] File cleanup failed:', fileError.message);
      }
    }

    if (projectWasCreated && project?._id) {
      await Project.deleteOne({ _id: project._id }).catch(() => {});
    } else if (project && projectSnapshot) {
      try {
        project.status = projectSnapshot.status;
        project.healthScore = projectSnapshot.healthScore;
        project.stats = projectSnapshot.stats;
        project.lastReconstructedAt = projectSnapshot.lastReconstructedAt;
        await project.save();
      } catch (restoreError) {
        console.error('[Sample Rollback] Project restore failed:', restoreError.message);
      }
    }

    next(err);
  }
};

module.exports = { loadSampleProject };


