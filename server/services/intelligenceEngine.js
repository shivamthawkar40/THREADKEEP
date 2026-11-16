/**
 * THREADKEEP Intelligence Engine
 *
 * Features:
 * 1. AI Knowledge Reconstruction
 * 2. Evidence and Citation Verification
 * 3. Knowledge Gap Detection
 * 4. Cross-document Conflict Detection
 * 5. Confidence Statistics
 * 6. Knowledge Health Calculation
 */

// ======================================================
// 1. COMMON HELPERS
// ======================================================

const normalizeText = (value = '') =>
  String(value).replace(/\s+/g, ' ').trim();

const normalizeForMatch = (value = '') =>
  normalizeText(value).toLowerCase();

const isValidObject = (value) =>
  value !== null &&
  typeof value === 'object' &&
  !Array.isArray(value);

const safeArray = (value) =>
  Array.isArray(value) ? value : [];

const unique = (items) =>
  [...new Set(items.filter(Boolean))];

const getDocumentId = (doc) =>
  doc?._id ? String(doc._id) : '';

const getDocumentText = (doc) =>
  typeof doc?.rawText === 'string' ? doc.rawText : '';

const validStatus = (status) =>
  ['confirmed', 'inferred', 'unknown'].includes(status)
    ? status
    : 'unknown';

const validSeverity = (severity) =>
  ['critical', 'high', 'medium', 'low'].includes(severity)
    ? severity
    : 'medium';

const findDocument = (documents, source) => {
  if (!source) return null;

  const documentId = source.documentId
    ? String(source.documentId).trim()
    : '';

  // If an ID is supplied, require an exact ID match.
  // Never fall back to filename after an ID mismatch.
  if (documentId) {
    return documents.find(
      doc => getDocumentId(doc) === documentId
    ) || null;
  }

  // Filename fallback is allowed only when no ID is supplied.
  const documentName = normalizeForMatch(
    source.documentName || ''
  );

  if (!documentName) return null;

  const matches = documents.filter(
    doc => normalizeForMatch(doc.originalName || '') === documentName
  );

  return matches.length === 1 ? matches[0] : null;
};

// ======================================================
// 2. CITATION HELPERS
// ======================================================

const findCitation = (documents = [], keywords = []) => {
  for (const doc of documents) {
    const rawText = getDocumentText(doc);

    if (!rawText) continue;

    const lowerText = rawText.toLowerCase();

    for (const keyword of keywords) {
      if (!keyword) continue;

      const index = lowerText.indexOf(
        String(keyword).toLowerCase()
      );

      if (index === -1) continue;

      const start = Math.max(0, index - 80);
      const end = Math.min(rawText.length, index + 200);

      const excerpt = normalizeText(
        rawText.substring(start, end)
      );

      const section = safeArray(doc.sections).find(
        item =>
          item.content &&
          item.content.toLowerCase().includes(
            String(keyword).toLowerCase()
          )
      );

      return {
        documentId: doc._id,
        documentName: doc.originalName || 'Untitled Document',
        pageNumber: section?.page || 1,
        sectionTitle: section?.title || 'Main Body',
        lineRange: section?.lineStart
          ? `L${section.lineStart}-L${section.lineStart + 8}`
          : 'Not available',
        excerpt
      };
    }
  }

  return null;
};

// ======================================================
// 3. EVIDENCE VERIFICATION
// ======================================================

const verifyEvidence = (documents = [], evidence = {}) => {
  if (!isValidObject(evidence)) return null;

  const excerpt = normalizeText(evidence.excerpt);

  if (!excerpt) return null;

  const document = findDocument(documents, evidence);

  if (!document) return null;

  const rawText = normalizeText(getDocumentText(document));

  if (!rawText) return null;

  const cleanExcerpt = excerpt
    .replace(/^\.{3,}/, '')
    .replace(/\.{3,}$/, '')
    .trim();

  if (!cleanExcerpt) return null;

  const normalizedRaw = normalizeForMatch(rawText);
  const normalizedExcerpt = normalizeForMatch(cleanExcerpt);

  const hasExactShortMatch = (text, term) => {
    let start = 0;

    while (true) {
      const index = text.indexOf(term, start);
      if (index === -1) return false;

      const before = index > 0 ? text[index - 1] : '';
      const after = text[index + term.length] || '';
      const isWordCharacter = char => /[a-z0-9]/i.test(char);

      if (!isWordCharacter(before) && !isWordCharacter(after)) {
        return true;
      }

      start = index + 1;
    }
  };

  const evidenceMatches = normalizedExcerpt.length >= 15
    ? normalizedRaw.includes(normalizedExcerpt)
    : hasExactShortMatch(normalizedRaw, normalizedExcerpt);

  if (!evidenceMatches) {
    return null;
  }

  return {
    documentId: document._id,
    documentName: document.originalName || 'Untitled Document',
    pageNumber: Number(evidence.pageNumber) || 1,
    sectionTitle: evidence.sectionTitle || 'Main Body',
    lineRange: evidence.lineRange || 'Not available',
    excerpt
  };
};

const validateSources = (documents = [], sources = []) => {
  return safeArray(sources)
    .map(source => verifyEvidence(documents, source))
    .filter(Boolean);
};

// ======================================================
// 4. KNOWLEDGE ITEM VALIDATION
// ======================================================

const validateKnowledgeItems = (
  items,
  documents,
  titleField
) => {
  return safeArray(items)
    .filter(isValidObject)
    .map(item => {
      const sources = validateSources(
        documents,
        item.sources
      );

      const itemTitle = normalizeText(item[titleField] || '');

      if (!itemTitle) {
        console.warn(`[Knowledge Validation] Rejected item: missing ${titleField}.`);
        return null;
      }

      if (sources.length === 0) {
        console.warn(
          `[Knowledge Validation] Rejected "${itemTitle}" (${titleField}): no evidence source passed verification.`,
          {
            sourceCount: safeArray(item.sources).length,
            sourceDetails: safeArray(item.sources).map(source => ({
              documentId: source?.documentId ? String(source.documentId) : null,
              documentName: source?.documentName || null,
              excerptLength: normalizeText(source?.excerpt || '').length
            })),
            availableDocuments: documents.map(doc => ({
              id: getDocumentId(doc),
              name: doc.originalName || null
            }))
          }
        );
        return null;
      }

      return {
        ...item,
        [titleField]: normalizeText(item[titleField]),
        status: validStatus(item.status),
        confidenceScore: Number.isFinite(
          Number(item.confidenceScore)
        )
          ? Math.max(0, Math.min(100, Number(item.confidenceScore)))
          : 0,
        sources
      };
    })
    .filter(Boolean);
};

// ======================================================
// ======================================================
// 5. DEPENDENCY AND RISK NORMALIZATION
// ======================================================

const validateDependencies = (items, documents) => {
  const validItems = validateKnowledgeItems(items, documents, 'item');

  return validItems.map(item => {
    const rawType = normalizeForMatch(item.type).replace(/-/g, '_');
    const rawStatus = normalizeForMatch(item.status).replace(/-/g, '_');

    return {
      ...item,
      type: ['internal', 'external', 'third_party'].includes(rawType)
        ? rawType
        : undefined,
      status: ['resolved', 'pending', 'blocked'].includes(rawStatus)
        ? rawStatus
        : undefined
    };
  });
};

const validateRisks = (items, documents) => {
  const validItems = validateKnowledgeItems(items, documents, 'title');

  return validItems.map(item => {
    const impact = normalizeForMatch(item.impact);
    const likelihood = normalizeForMatch(item.likelihood);

    return {
      ...item,
      impact: ['critical', 'high', 'medium', 'low'].includes(impact)
        ? impact
        : undefined,
      likelihood: ['high', 'medium', 'low'].includes(likelihood)
        ? likelihood
        : undefined
    };
  });
};

// ======================================================
// 6. OVERVIEW VALIDATION
// ======================================================
// ======================================================

const validateOverview = (overview, documents) => {
  if (!isValidObject(overview)) {
    return {
      summary: '',
      problemStatement: '',
      targetAudience: '',
      status: 'unknown',
      sources: []
    };
  }

  const sources = validateSources(
    documents,
    overview.sources
  );

  if (!sources.length) {
    return {
      summary: '',
      problemStatement: '',
      targetAudience: '',
      status: 'unknown',
      sources: []
    };
  }

  return {
    summary: normalizeText(overview.summary || ''),
    problemStatement: normalizeText(
      overview.problemStatement || ''
    ),
    targetAudience: normalizeText(
      overview.targetAudience || ''
    ),
    status: 'confirmed',
    sources
  };
};

// ======================================================
// 6. CONFIDENCE STATISTICS
// ======================================================

const calculateConfidenceStats = (knowledge = {}) => {
  const collectionNames = [
    'objectives',
    'technologyStack',
    'decisions',
    'completedTasks',
    'pendingTasks',
    'teamResponsibilities',
    'dependencies',
    'risks',
    'milestones'
  ];

  const facts = collectionNames.flatMap(
    key => safeArray(knowledge[key])
  ).concat(
    safeArray(knowledge.technicalArchitecture?.components)
  );

  const totalFacts = facts.length;

  const confirmedCount = facts.filter(
    item => item.status === 'confirmed'
  ).length;

  const inferredCount = facts.filter(
    item => item.status === 'inferred'
  ).length;

  const unknownCount = totalFacts -
    confirmedCount -
    inferredCount;

  const percentage = count =>
    totalFacts
      ? Math.round((count / totalFacts) * 100)
      : 0;

  const confirmedPercentage = percentage(confirmedCount);
  const inferredPercentage = percentage(inferredCount);

  const unknownPercentage = totalFacts
    ? 100 - confirmedPercentage - inferredPercentage
    : 100;

  return {
    totalFacts,
    confirmedCount,
    inferredCount,
    unknownCount,
    confirmedPercentage,
    inferredPercentage,
    unknownPercentage,
    overallHealthScore: totalFacts
      ? Math.round(
          (
            confirmedCount +
            inferredCount * 0.5
          ) / totalFacts * 100
        )
      : 0
  };
};

// ======================================================
// 7. RECONSTRUCT PROJECT KNOWLEDGE
// ======================================================

const reconstructProjectKnowledge = async (
  project,
  documents = [],
  geminiResult = null
) => {
  if (!project) {
    throw new Error('Project is required.');
  }

  if (!Array.isArray(documents) || documents.length === 0) {
    throw new Error('No processed documents found.');
  }

  if (!isValidObject(geminiResult)) {
    throw new Error('Invalid Gemini analysis response.');
  }

  const overview = validateOverview(
    geminiResult.overview,
    documents
  );

  const objectives = validateKnowledgeItems(
    geminiResult.objectives,
    documents,
    'title'
  );

  const technologyStack = validateKnowledgeItems(
    geminiResult.technologyStack,
    documents,
    'technology'
  );

  const decisions = validateKnowledgeItems(
    geminiResult.decisions,
    documents,
    'decision'
  );

  const completedTasks = validateKnowledgeItems(
    geminiResult.completedTasks,
    documents,
    'title'
  );

  const pendingTasks = validateKnowledgeItems(
    geminiResult.pendingTasks,
    documents,
    'title'
  );

  const teamResponsibilities = validateKnowledgeItems(
    geminiResult.teamResponsibilities,
    documents,
    'name'
  );

  const dependencies = validateDependencies(
    geminiResult.dependencies,
    documents,
    'item'
  );

  const risks = validateRisks(
    geminiResult.risks,
    documents,
    'title'
  );

  const milestones = validateKnowledgeItems(
    geminiResult.milestones,
    documents,
    'title'
  ).map(milestone => {
    const milestoneStatus = String(milestone.status || '')
      .trim()
      .toLowerCase()
      .replace(/[\s-]+/g, '_');

    return {
      ...milestone,
      status: ['completed', 'in_progress', 'delayed'].includes(milestoneStatus)
        ? milestoneStatus
        : 'unknown'
    };
  });

  const architecture = isValidObject(
    geminiResult.technicalArchitecture
  )
    ? geminiResult.technicalArchitecture
    : {};

  const architectureSources = validateSources(
    documents,
    architecture.sources
  );

  const technicalArchitecture = {
    overview: architectureSources.length
      ? normalizeText(architecture.overview || '')
      : '',
    pattern: architectureSources.length
      ? normalizeText(architecture.pattern || '')
      : '',
    components: validateKnowledgeItems(
      architecture.components,
      documents,
      'name'
    ),
    diagramNodes: safeArray(architecture.diagramNodes),
    diagramEdges: safeArray(architecture.diagramEdges),
    sources: architectureSources
  };

  const knowledge = {
    project: project._id,

    overview,

    objectives,

    technicalArchitecture,

    technologyStack,

    decisions,

    completedTasks,

    pendingTasks,

    teamResponsibilities,

    dependencies,

    risks,

    milestones,

    extractedBy: 'Google Gemini + THREADKEEP Evidence Verifier'
  };

  knowledge.confidenceStats =
    calculateConfidenceStats(knowledge);

  return knowledge;
};

// ======================================================
// 8. KNOWLEDGE GAP DETECTION
// ======================================================

const detectKnowledgeGaps = async (
  project,
  documents = [],
  geminiResult = null
) => {
  if (!project || !isValidObject(geminiResult)) {
    return [];
  }

  const aiGaps = safeArray(geminiResult.gaps).length
    ? safeArray(geminiResult.gaps)
    : safeArray(geminiResult.knowledgeGaps);

  // No generic absence-based fallback: a random citation cannot prove
  // that ownership, testing, deployment, or decisions are undocumented.
  if (aiGaps.length === 0) {
    console.log(
      '[Knowledge Gaps] No AI-supported gap candidates. Returning zero new gaps.'
    );
    return [];
  }

  const validCategories = [
    'missing_ownership',
    'unanswered_question',
    'missing_documentation',
    'unknown_task_status',
    'missing_technical_decision',
    'unclear_dependency',
    'missing_deployment_instructions',
    'incomplete_testing',
    'general',
  ];

  return aiGaps
    .filter(isValidObject)
    .map(gap => {
      const title = normalizeText(gap.title || '');
      const explanation = normalizeText(gap.explanation || '');
      const whyItMatters = normalizeText(gap.whyItMatters || '');
      const suggestedQuestion = normalizeText(gap.suggestedQuestion || '');
      const recommendedAction = normalizeText(gap.recommendedAction || '');

      const evidence = validateSources(
        documents,
        gap.evidence || gap.sources
      );

      if (
        !title ||
        !explanation ||
        !whyItMatters ||
        !suggestedQuestion ||
        !recommendedAction ||
        evidence.length === 0
      ) {
        console.warn(
          '[Knowledge Gaps] Rejected candidate without complete fields and verified evidence:',
          title || '(missing title)'
        );
        return null;
      }

      return {
        ...gap,
        project: project._id,
        title,
        category: validCategories.includes(gap.category)
          ? gap.category
          : 'general',
        explanation,
        whyItMatters,
        suggestedQuestion,
        recommendedAction,
        relatedInfo: normalizeText(gap.relatedInfo || ''),
        evidence,
        severity: validSeverity(gap.severity),
        status: 'open'
      };
    })
    .filter(Boolean);
};

// 9. CONFLICT DETECTION
// ======================================================

const detectConflicts = async (
  project,
  documents = [],
  geminiResult = null
) => {
  if (!project || !isValidObject(geminiResult)) {
    return [];
  }

  const aiConflicts = safeArray(geminiResult.conflicts);

  return aiConflicts
    .filter(isValidObject)
    .map(conflict => {
      const statementA = conflict.statementA || {};
      const statementB = conflict.statementB || {};

      const verifiedA = verifyEvidence(
        documents,
        statementA
      );

      const verifiedB = verifyEvidence(
        documents,
        statementB
      );

      // Both claims must have independently verified evidence.
      if (!verifiedA || !verifiedB) {
        return null;
      }

      if (
        String(verifiedA.documentId) ===
          String(verifiedB.documentId) &&
        normalizeForMatch(verifiedA.excerpt) ===
          normalizeForMatch(verifiedB.excerpt)
      ) {
        return null;
      }

      return {
        ...conflict,
        project: project._id,

        statementA: {
          ...statementA,
          ...verifiedA
        },

        statementB: {
          ...statementB,
          ...verifiedB
        },

        severity: validSeverity(conflict.severity),

        status: 'unresolved'
      };
    })
    .filter(Boolean);
};

// ======================================================
// 10. KNOWLEDGE HEALTH CALCULATION
// ======================================================

const calculateKnowledgeHealth = (
  stats = {},
  totalItems = 0,
  confirmed = 0,
  inferred = 0,
  unknown = 0,
  gaps = [],
  conflicts = []
) => {
  const factsTotal = confirmed + inferred + unknown;

  const factCompleteness = factsTotal > 0
    ? (
        (confirmed + inferred * 0.5) /
        factsTotal
      ) * 100
    : 0;

  const openGaps = safeArray(gaps).filter(
    gap => gap.status === 'open'
  );

  const openCriticalGaps = openGaps.filter(
    gap => gap.severity === 'critical'
  ).length;

  const openHighGaps = openGaps.filter(
    gap => gap.severity === 'high'
  ).length;

  const unresolvedConflicts = safeArray(conflicts).filter(
    conflict => conflict.status === 'unresolved'
  ).length;

  const gapPenalty =
    openCriticalGaps * 8 +
    openHighGaps * 4;

  const conflictPenalty =
    unresolvedConflicts * 6;

  let finalScore = Math.round(
    factCompleteness - gapPenalty - conflictPenalty
  );

  finalScore = Math.max(
    0,
    Math.min(100, finalScore)
  );

  let rating = 'Healthy';

  if (finalScore < 40) {
    rating = 'Critical Attention Needed';
  } else if (finalScore < 60) {
    rating = 'Needs Improvement';
  } else if (finalScore < 75) {
    rating = 'Moderate Gaps';
  } else if (finalScore < 90) {
    rating = 'Good Quality';
  }

  return {
    score: finalScore,
    rating,

    metrics: {
      factCompleteness: Math.round(factCompleteness),

      totalFacts: factsTotal,

      confirmedFacts: confirmed,

      inferredFacts: inferred,

      unknownFacts: unknown,

      openCriticalGaps,

      openHighGaps,

      unresolvedConflicts,

      deductions: {
        gapPenalty,
        conflictPenalty
      }
    }
  };
};

// ======================================================
// 11. MODULE EXPORTS
// Keep this block at the very bottom.
// ======================================================

module.exports = {
  reconstructProjectKnowledge,
  detectKnowledgeGaps,
  detectConflicts,
  calculateKnowledgeHealth,
  calculateConfidenceStats,
  verifyEvidence,
  validateSources,
  findCitation
};




