
const Project = require('../models/Project');
const Document = require('../models/Document');
const ExtractedKnowledge = require('../models/ExtractedKnowledge');
const KnowledgeGap = require('../models/KnowledgeGap');
const Conflict = require('../models/Conflict');
const ActivityLog = require('../models/ActivityLog');

const {
  generateStructuredAI,
  isAIConfigured,
} = require('../services/geminiService');

const {
  reconstructProjectKnowledge,
  detectKnowledgeGaps,
  detectConflicts,
  calculateKnowledgeHealth,
  verifyEvidence,
} = require('../services/intelligenceEngine');

// ======================================================
// HELPERS
// ======================================================

const safeArray = (value) =>
  Array.isArray(value) ? value : [];

const normalizeText = (value) =>
  typeof value === 'string' ? value.trim() : '';

const buildDocumentContext = (documents) => {
  return documents.map((doc, index) => {
    return `
==================================================
DOCUMENT ${index + 1}
==================================================

DOCUMENT NAME: ${doc.originalName || 'Untitled'}
DOCUMENT ID: ${doc._id}

DOCUMENT CONTENT:
${doc.rawText || ''}
`;
  }).join('\n\n');
};

// ======================================================
// GEMINI SYSTEM INSTRUCTIONS
// ======================================================

const SYSTEM_PROMPT = `
You are THREADKEEP Intelligence.

You are an evidence-based project knowledge reconstruction system.

Your job is to analyze project documents and extract accurate,
traceable and structured project knowledge.

STRICT RULES:

1. Analyze only the specified project.
2. Never mix information from unrelated projects.
3. Never invent facts, objectives, technologies, tasks or people.
4. Every extracted knowledge item must contain at least one source.
5. Every source excerpt must be copied exactly from the original document.
6. Do not create fictional document names or IDs.
7. Use confirmed only when directly supported by evidence.
8. Use inferred only when a reasonable inference is supported by evidence.
9. Use unknown when information cannot be established.
10. Do not treat a technology mention as proof of implementation.
11. Do not generate fake conflicts.
12. A conflict requires two independently supported contradictory claims.
13. Different technologies are not automatically conflicting.
14. Do not generate placeholder objectives or tasks.
15. Empty arrays are correct when information is unavailable.
16. Return valid JSON only.
17. Never use Markdown code fences.

ACCURACY IS MORE IMPORTANT THAN COMPLETENESS.
`;

// ======================================================
// GEMINI EXTRACTION SCHEMA
// ======================================================

const RESPONSE_SCHEMA = `
Return one JSON object with the following structure.

{
  "overview": {
    "summary": "string",
    "problemStatement": "string",
    "targetAudience": "string",
    "status": "confirmed | inferred | unknown",
    "sources": []
  },

  "objectives": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "category": "string",
      "status": "confirmed | inferred | unknown",
      "confidenceScore": 0,
      "sources": []
    }
  ],

  "technicalArchitecture": {
    "overview": "string",
    "pattern": "string",
    "components": [
      {
        "name": "string",
        "role": "string",
        "technologies": [],
        "dependencies": [],
        "status": "confirmed | inferred | unknown",
        "sources": []
      }
    ],
    "diagramNodes": [],
    "diagramEdges": [],
    "sources": []
  },

  "technologyStack": [
    {
      "category": "string",
      "technology": "string",
      "version": "string",
      "status": "confirmed | inferred | unknown",
      "confidenceScore": 0,
      "sources": []
    }
  ],

  "decisions": [
    {
      "decision": "string",
      "rationale": "string",
      "alternativesConsidered": "string",
      "decidedBy": "string",
      "date": "string",
      "status": "confirmed | inferred | unknown",
      "sources": []
    }
  ],

  "completedTasks": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "category": "string",
      "status": "confirmed | inferred | unknown",
      "confidenceScore": 0,
      "owner": "string",
      "sources": []
    }
  ],

  "pendingTasks": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "category": "string",
      "status": "confirmed | inferred | unknown",
      "confidenceScore": 0,
      "owner": "string",
      "sources": []
    }
  ],

  "teamResponsibilities": [
    {
      "name": "string",
      "role": "string",
      "responsibilities": [],
      "ownershipAreas": [],
      "status": "confirmed | inferred | unknown",
      "sources": []
    }
  ],

  "dependencies": [
    {
      "item": "string",
      "dependsOn": "string",
      "type": "string",
      "status": "string",
      "impact": "string",
      "sources": []
    }
  ],

  "risks": [
    {
      "title": "string",
      "description": "string",
      "impact": "string",
      "likelihood": "string",
      "mitigation": "string",
      "status": "confirmed | inferred | unknown",
      "sources": []
    }
  ],

  "milestones": [
    {
      "title": "string",
      "targetDate": "string",
      "status": "string",
      "sources": []
    }
  ],

  "gaps": [
    {
      "title": "string",
      "category": "general",
      "severity": "critical | high | medium | low",
      "explanation": "string",
      "whyItMatters": "string",
      "relatedInfo": "string",
      "evidence": [],
      "suggestedQuestion": "string",
      "recommendedAction": "string"
    }
  ],

  "conflicts": [
    {
      "topic": "string",
      "category": "other",
      "severity": "critical | high | medium | low",
      "statementA": {
        "claim": "string",
        "documentName": "string",
        "documentId": "string",
        "pageNumber": 1,
        "sectionTitle": "string",
        "lineRange": "string",
        "excerpt": "EXACT TEXT FROM DOCUMENT"
      },
      "statementB": {
        "claim": "string",
        "documentName": "string",
        "documentId": "string",
        "pageNumber": 1,
        "sectionTitle": "string",
        "lineRange": "string",
        "excerpt": "EXACT TEXT FROM DOCUMENT"
      },
      "conflictReason": "string"
    }
  ]
}

SOURCE FORMAT:

Every source must contain:

{
  "documentName": "exact document name",
  "documentId": "exact document ID",
  "pageNumber": 1,
  "sectionTitle": "section name",
  "lineRange": "optional line range",
  "excerpt": "exact continuous text copied from document"
}

FIELD RULES:

- objectives use title.
- technologyStack uses technology.
- decisions use decision.
- completedTasks and pendingTasks use title.
- teamResponsibilities use name.
- dependencies use item.
- risks and milestones use title.
- technicalArchitecture.components use name.
- Every knowledge item must have verified evidence.
- Do not invent owners or completion status.
- If owner is unavailable, use an empty string.
- If version is unavailable, use an empty string.
- If no objectives exist, return [].
- If no decisions exist, return [].
- If no conflicts exist, return [].
- If no gaps exist, return [].

Return JSON only.
`;

// ======================================================
// CONFLICT CANDIDATE VERIFICATION
// ======================================================

const extractExplicitDatabaseClaim = (text = '') => {
  const valuePatterns = [
    /(?:the\s+)?(?:application|project)\s+database\s+(?:is|:)\s*([a-z][a-z0-9._-]*)/i,
    /([a-z][a-z0-9._-]*)\s+is\s+the\s+(?:primary\s+and\s+only|only|primary)\s+database\s+(?:used\s+by|for)\s+(?:the\s+)?(?:application|project)/i,
    /(?:uses|using)\s+([a-z][a-z0-9._-]*)\s+as\s+(?:its\s+)?(?:primary\s+and\s+only|only|primary)\s+database/i
  ];

  for (const pattern of valuePatterns) {
    const match = normalizeText(text).match(pattern);
    if (match?.[1]) {
      return {
        attribute: 'application_database',
        value: match[1].toLowerCase().replace(/[.,;:!?]+$ /g, '').trim()
      };
    }
  }

  return null;
};

const buildConflictKey = item => {
  const sideKey = statement => {
    const claimText = statement?.claim || statement?.excerpt || '';
    const extracted = extractExplicitDatabaseClaim(claimText);
    const documentKey =
      statement?.documentId || statement?.documentName || 'unknown-document';
    const claimKey = extracted
      ? `${extracted.attribute}:${extracted.value}`
      : normalizeText(claimText).toLowerCase();

    return `${String(documentKey)}:${claimKey}`;
  };

  return [
    sideKey(item.statementA),
    sideKey(item.statementB)
  ].sort().join('|');
};
const detectLocalDatabaseConflicts = (project, documents = []) => {
  if (!project || !Array.isArray(documents) || documents.length < 2) {
    return [];
  }

  const claims = [];

  for (const doc of documents) {
    const rawText = normalizeText(doc.rawText || '');
    if (!rawText) continue;

    const sentences = rawText
      .split(/(?<=[.!?])\s+|\r?\n+/)
      .map(sentence => sentence.trim())
      .filter(sentence => sentence.length >= 10 && sentence.length <= 500);

    for (const sentence of sentences) {
      if (/\b(previously|formerly|earlier|used to|planned|will use|future|migrat(?:ed|ing|ion)?|replac(?:ed|ing)|deprecated|historical|20\d{2})\b/i.test(sentence)) {
        continue;
      }

      const extracted = extractExplicitDatabaseClaim(sentence);
      if (!extracted) continue;

      claims.push({
        value: extracted.value,
        documentId: doc._id,
        documentName: doc.originalName || 'Untitled Document',
        excerpt: sentence
      });
    }
  }

  const candidates = [];
  const seenConflictPairs = new Set();

  for (let i = 0; i < claims.length; i++) {
    for (let j = i + 1; j < claims.length; j++) {
      const a = claims[i];
      const b = claims[j];

      if (
        String(a.documentId) === String(b.documentId) ||
        a.value === b.value
      ) {
        continue;
      }

      const pairKey = [
        String(a.documentId) + ':' + String(a.value).toLowerCase(),
        String(b.documentId) + ':' + String(b.value).toLowerCase()
      ].sort().join('|');
      if (seenConflictPairs.has(pairKey)) continue;
      seenConflictPairs.add(pairKey);

      candidates.push({
        project: project._id,
        topic: 'Primary Application Database',
        category: 'technology_selection',
        severity: 'medium',
        status: 'unresolved',
        statementA: {
          claim: a.excerpt,
          documentId: a.documentId,
          documentName: a.documentName,
          pageNumber: 1,
          sectionTitle: 'Main Body',
          lineRange: 'Not available',
          excerpt: a.excerpt
        },
        statementB: {
          claim: b.excerpt,
          documentId: b.documentId,
          documentName: b.documentName,
          pageNumber: 1,
          sectionTitle: 'Main Body',
          lineRange: 'Not available',
          excerpt: b.excerpt
        },
        conflictReason: 'Two documents explicitly identify different primary application databases.'
      });
    }
  }

  return verifyConflictCandidatesLocally(candidates, documents);
};
const verifyConflictCandidatesLocally = (candidates, documents = []) => {
  if (!Array.isArray(candidates) || !Array.isArray(documents)) {
    return [];
  }

  const temporalPattern =
    /\b(previously|formerly|earlier|previous|now|currently|as of|since|before|after|migrat(?:ed|ing|ion)?|replac(?:ed|ing)|updat(?:ed|ing)|version\s*\d|phase\s*\d|20\d{2})\b/i;

  return candidates.filter(candidate => {
    const statementA = candidate?.statementA || {};
    const statementB = candidate?.statementB || {};

    const verifiedA = verifyEvidence(documents, statementA);
    const verifiedB = verifyEvidence(documents, statementB);

    if (!verifiedA || !verifiedB) return false;

    if (
      !verifiedA.documentId ||
      !verifiedB.documentId ||
      String(verifiedA.documentId) === String(verifiedB.documentId)
    ) {
      return false;
    }

    const claimA = extractExplicitDatabaseClaim(statementA.claim);
    const claimB = extractExplicitDatabaseClaim(statementB.claim);
    const excerptA = extractExplicitDatabaseClaim(verifiedA.excerpt);
    const excerptB = extractExplicitDatabaseClaim(verifiedB.excerpt);

    if (!claimA || !claimB || !excerptA || !excerptB) return false;

    if (
      claimA.attribute !== claimB.attribute ||
      claimA.value !== excerptA.value ||
      claimB.value !== excerptB.value ||
      claimA.value === claimB.value
    ) {
      return false;
    }

    const combinedEvidence =
      `${statementA.claim} ${verifiedA.excerpt} ${statementB.claim} ${verifiedB.excerpt}`;

    if (temporalPattern.test(combinedEvidence)) return false;

    candidate.conflictReason =
      `The documents independently identify different primary application databases: ${claimA.value} and ${claimB.value}. Both claims were matched against their original document excerpts.`;

    candidate.verificationConfidence = null;
    candidate.verificationMethod = 'local_evidence_rule';

    return true;
  });
};
const verifyConflictCandidates = async (candidates, documents = []) => {
  if (!Array.isArray(candidates) || candidates.length === 0) {
    return [];
  }

  const verificationPrompt = `
Review the following candidate project-document conflicts.

You are a conservative contradiction verifier.
Do not invent facts or use information outside the supplied claims and excerpts.

For each candidate, determine:
1. Do both claims concern the same subject and attribute?
2. Do the claims directly contradict each other?
3. Could the difference be explained by a chronological update?
4. Is there enough evidence to confidently classify this as a contradiction?

Different technologies, complementary facts, different scopes,
or updated information are NOT automatically contradictions.

Return JSON only in this exact structure:
{
  "results": [
    {
      "index": 0,
      "sameSubject": false,
      "directContradiction": false,
      "temporalUpdate": false,
      "confidenceScore": 0,
      "reason": ""
    }
  ]
}

Only assign a high confidence score when the contradiction is explicit.
If uncertain, set directContradiction to false.

CANDIDATES:
${JSON.stringify(candidates.map((item, index) => ({
  index,
  topic: item.topic,
  claimA: item.statementA.claim,
  excerptA: item.statementA.excerpt,
  documentA: item.statementA.documentName,
  claimB: item.statementB.claim,
  excerptB: item.statementB.excerpt,
  documentB: item.statementB.documentName,
  proposedReason: item.conflictReason
})), null, 2)}
`;

  try {
    const verification = await generateStructuredAI(
      verificationPrompt,
      'You are THREADKEEP conflict verification. Be conservative and evidence-bound.'
    );

    console.log('CONFLICT VERIFIER RAW RESPONSE:', JSON.stringify(verification, null, 2));

    const results = safeArray(verification?.results);
    const resultByIndex = new Map(
      results
        .filter(item =>
          Number.isInteger(item.index) &&
          item.index >= 0 &&
          item.index < candidates.length
        )
        .map(item => [item.index, item])
    );

    return candidates.filter((candidate, index) => {
      const result = resultByIndex.get(index);
      const rawScore = Number(result?.confidenceScore);

      const score =
        Number.isFinite(rawScore) && rawScore >= 0 && rawScore <= 1
          ? rawScore * 100
          : rawScore;

      const accepted =
        result?.sameSubject === true &&
        result?.directContradiction === true &&
        result?.temporalUpdate === false &&
        Number.isFinite(score) &&
        score >= 85 &&
        normalizeText(result?.reason).length >= 10;

      if (accepted) {
        candidate.conflictReason = normalizeText(result.reason);
        candidate.verificationConfidence = score;
      }

      return accepted;
    });
  } catch (error) {
    console.error(
      'Gemini conflict verification unavailable. Trying conservative local verification:',
      error.message
    );

    const locallyVerified = verifyConflictCandidatesLocally(candidates, documents);

    console.log(
      `Local conflict verification: ${locallyVerified.length}/${candidates.length} candidates accepted.`
    );

    return locallyVerified;
  }
};

// ======================================================
// DEDICATED AI CONFLICT DISCOVERY
// ======================================================

const detectConflictCandidatesWithAI = async (project, documents = []) => {
  if (!Array.isArray(documents) || documents.length < 2) {
    return [];
  }

  const documentEvidence = documents.map(doc => ({
    documentName: doc.originalName || 'Untitled Document',
    documentId: String(doc._id),
    content: doc.rawText || ''
  }));


  const prompt = `
Analyze the following documents belonging to one project.

PROJECT:
${JSON.stringify({
  name: project.name,
  description: project.description
})}

DOCUMENTS:
${JSON.stringify(documentEvidence, null, 2)}

TASK:
Find explicit contradictions between independent documents.

A conflict exists only when two documents make incompatible claims
about the SAME subject and SAME attribute.

Examples:
- Database is MongoDB vs database is PostgreSQL: possible conflict.
- Backend uses Node.js vs frontend uses React: not a conflict.
- Version 1 was used earlier and version 2 later: not automatically a conflict.
- Planned technology vs implemented technology: not automatically a conflict.

STRICT RULES:
1. Compare claims across different document IDs.
2. Use only claims explicitly supported by document content.
3. Copy each excerpt exactly and continuously from its source document.
4. Include the exact document name and document ID.
5. Never invent page numbers, section names, claims, or evidence.
6. Do not treat missing information as contradictory evidence.
7. Reject differences explained by dates, versions, scope, or project phases.
8. If uncertain, do not report a conflict.
9. Return an empty conflicts array when no genuine contradiction exists.

Return JSON only in this structure:
{
  "conflicts": [
    {
      "topic": "short topic",
      "category": "other",
      "severity": "critical | high | medium | low",
      "statementA": {
        "claim": "first claim",
        "documentName": "exact document name",
        "documentId": "exact document ID",
        "pageNumber": 1,
        "sectionTitle": "",
        "lineRange": "",
        "excerpt": "exact continuous source text"
      },
      "statementB": {
        "claim": "second claim",
        "documentName": "exact document name",
        "documentId": "exact document ID",
        "pageNumber": 1,
        "sectionTitle": "",
        "lineRange": "",
        "excerpt": "exact continuous source text"
      },
      "conflictReason": "why these claims contradict"
    }
  ]
}
`;

  try {
    const result = await generateStructuredAI(
      prompt,
      'You are THREADKEEP dedicated conflict discovery. Compare evidence conservatively. Never invent claims or citations.'
    );

    console.log('Dedicated detector raw response:', JSON.stringify(result, null, 2));
    return safeArray(result?.conflicts);
  } catch (error) {
    console.error('Dedicated conflict discovery failed:', error.message);
    return [];
  }
};
// ======================================================
// 1. TRIGGER AI KNOWLEDGE RECONSTRUCTION
// ======================================================

const triggerReconstruction = async (req, res, next) => {
  try {
    const { projectId } = req.params;

    // ----------------------------------------------
    // 1. Verify project ownership
    // ----------------------------------------------

    const project = await Project.findOne({
      _id: projectId,
      owner: req.user._id,
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found.',
      });
    }

    // ----------------------------------------------
    // 2. Verify AI provider configuration
    // ----------------------------------------------
    // AI unavailable? Continue with local evidence-based analysis.


    // ----------------------------------------------
    // 3. Fetch processed project documents
    // ----------------------------------------------

    const documents = await Document.find({
      project: projectId,
      status: 'processed',
    });

    if (!documents.length) {
      return res.status(400).json({
        success: false,
        message: 'No processed documents found.',
      });
    }

    const usableDocuments = documents.filter(
      doc => normalizeText(doc.rawText).length > 0
    );

    if (!usableDocuments.length) {
      return res.status(400).json({
        success: false,
        message: 'No readable document content found.',
      });
    }

    // ----------------------------------------------
    // 4. Log reconstruction start
    // ----------------------------------------------

    await ActivityLog.create({
      project: project._id,
      user: req.user._id,
      userName: req.user.name,
      action: 'reconstruction_started',
      entityType: 'reconstruction',
      title: 'AI Knowledge Reconstruction Started',
      details:
        `Analyzing ${usableDocuments.length} project documents.`,
      severity: 'info',
    });

    // ----------------------------------------------
    // 5. Prepare document context
    // ----------------------------------------------

    const docSummaries = buildDocumentContext(
      usableDocuments
    );

    // ----------------------------------------------
    // 6. Build project-specific prompt
    // ----------------------------------------------



  const prompt = `
PROJECT IDENTITY
================

Project Name:
${project.name}

Project Description:
${project.description || 'Not provided'}

Project ID:
${project._id}

PROJECT IDENTITY RULES
=====================

1. Analyze only this project.
2. Project name and description provide context, not proof.
3. Documents are the primary source of evidence.
4. Do not mix unrelated project information.
5. If a document is unrelated, do not use it as evidence.
6. Do not assume a technology is implemented because it is mentioned.
7. Do not invent missing objectives, tasks or decisions.
8. Do not reuse previous reconstruction results.
9. If information is unavailable, return an empty value or array.

DOCUMENTS
=========

${docSummaries}

RECONSTRUCTION TASK
===================

Analyze all relevant documents.

Extract:

1. Project overview.
2. Project objectives.
3. Technical architecture.
4. Technology stack.
5. Important decisions and rationale.
6. Completed tasks.
7. Pending tasks.
8. Team responsibilities.
9. Dependencies.
10. Risks.
11. Milestones.
12. Genuine knowledge gaps.
13. Genuine document conflicts.

Use the following required response structure:

${RESPONSE_SCHEMA}

FINAL VALIDATION
================

Before returning your response:

- Verify that each citation exists in the supplied documents.
- Verify that each document ID belongs to the supplied document list.
- Verify that every excerpt is exact and continuous.
- Verify that every conflict has two independently supported claims.
- Remove unsupported information.
- Do not create artificial gaps or conflicts.
- Return JSON only.
`;

    // ----------------------------------------------
    // 7. Generate structured Gemini response
    // ----------------------------------------------

    let geminiResult;
    let analysisMode = 'gemini';

    try {
      geminiResult = await generateStructuredAI(prompt, SYSTEM_PROMPT);
    } catch (geminiError) {
      console.error(
        'AI reconstruction unavailable. Switching to local analysis:',
        geminiError.message
      );

      analysisMode = 'rule_based';

      geminiResult = {
        overview: {},
        objectives: [],
        technicalArchitecture: {},
        technologyStack: [],
        decisions: [],
        completedTasks: [],
        pendingTasks: [],
        teamResponsibilities: [],
        dependencies: [],
        risks: [],
        milestones: [],
        gaps: [],
        conflicts: []
      };
    }
    if (
      !geminiResult ||
      typeof geminiResult !== 'object' ||
      Array.isArray(geminiResult)
    ) {
      throw new Error('Gemini returned an invalid response.');
    }

    console.log("GEMINI CONFLICT DIAGNOSTIC:", JSON.stringify({
      conflictCount: Array.isArray(geminiResult.conflicts) ? geminiResult.conflicts.length : "missing or invalid",
      conflicts: geminiResult.conflicts || []
    }, null, 2));

    // 8. Reconstruct and verify knowledge
    // ----------------------------------------------

    const knowledgeData = await reconstructProjectKnowledge(
      project,
      usableDocuments,
      geminiResult
    );

    if (!knowledgeData || typeof knowledgeData !== 'object') {
      throw new Error(
        'Knowledge reconstruction returned invalid data.'
      );
    }


    // 9. Detect genuine knowledge gaps
    // ----------------------------------------------

    const rawGaps = await detectKnowledgeGaps(
      project,
      usableDocuments,
      geminiResult
    );

    // ----------------------------------------------
    // 10. Detect genuine document conflicts
    // ----------------------------------------------

    const dedicatedConflictCandidates =
      await detectConflictCandidatesWithAI(
        project,
        usableDocuments
      );
    console.log('Dedicated conflict candidates:', dedicatedConflictCandidates.length);

    const combinedConflictCandidates = [
      ...safeArray(geminiResult.conflicts),
      ...dedicatedConflictCandidates
    ];

    const conflictCandidateKey = item => buildConflictKey(item);

    const uniqueConflictMap = new Map();

    for (const item of combinedConflictCandidates) {
      if (!item || typeof item !== 'object') continue;

      const key = conflictCandidateKey(item);

      if (!uniqueConflictMap.has(key)) {
        uniqueConflictMap.set(key, item);
      }
    }

    const uniqueConflictCandidates = [...uniqueConflictMap.values()];
    const conflictCandidates = await detectConflicts(
      project,
      usableDocuments,
      { conflicts: uniqueConflictCandidates }
    );

    const rawConflicts = await verifyConflictCandidates(
      conflictCandidates,
      usableDocuments
    );

    console.log(
      `Conflict verification: ${rawConflicts.length}/${conflictCandidates.length} candidates accepted.`
    );

    // ----------------------------------------------
    // 11. Use one consistent confidence calculation
    // ----------------------------------------------

    const confidenceStats =
      knowledgeData.confidenceStats;

    const confirmedCount =
      confidenceStats.confirmedCount;

    const inferredCount =
      confidenceStats.inferredCount;

    const unknownCount =
      confidenceStats.unknownCount;

    const totalFacts =
      confidenceStats.totalFacts;

    // ----------------------------------------------
    // 12. Calculate knowledge health
    // ----------------------------------------------

    const healthResult = calculateKnowledgeHealth(
      confidenceStats,
      totalFacts,
      confirmedCount,
      inferredCount,
      unknownCount,
      rawGaps,
      rawConflicts
    );

    // ----------------------------------------------
    // 13. Generate knowledge version
    // ----------------------------------------------

    const previousKnowledge = await ExtractedKnowledge.findOne({
      project: projectId,
    }).sort({
      version: -1,
    });

    knowledgeData.version = previousKnowledge
      ? previousKnowledge.version + 1
      : 1;

    knowledgeData.project = project._id;

    // ----------------------------------------------
    // 14. Save extracted knowledge
    // ----------------------------------------------

    const knowledgeRecord = await ExtractedKnowledge.create(
      knowledgeData
    );

    // ----------------------------------------------
    // 15. Safely preserve and synchronize knowledge gaps

    const existingGaps = await KnowledgeGap.find({ project: projectId });

    const normalizeGapKey = value =>
      String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().replace(/\s+/g, ' ');

    const getGapKey = gap => [
      normalizeGapKey(gap.title),
      normalizeGapKey(gap.category || 'general'),
      (gap.evidence || [])
        .map(item => String(item.documentId || item.documentName || '').trim())
        .sort()
        .join('|')
    ].join('::');

    const existingGapMap = new Map();

    for (const gap of existingGaps) {
      const key = getGapKey(gap);
      if (!existingGapMap.has(key)) existingGapMap.set(key, gap);
    }

    const seenGapKeys = new Set();
    const newGapCandidates = [];
    const updatedGapRecords = [];

    for (const candidate of rawGaps) {
      const key = getGapKey(candidate);
      if (seenGapKeys.has(key)) continue;
      seenGapKeys.add(key);

      const existing = existingGapMap.get(key);

      if (existing) {
        existing.title = candidate.title;
        existing.category = candidate.category || existing.category;
        existing.severity = candidate.severity;
        existing.explanation = candidate.explanation;
        existing.whyItMatters = candidate.whyItMatters;
        existing.relatedInfo = candidate.relatedInfo || '';
        existing.evidence = candidate.evidence;
        await existing.save();
        updatedGapRecords.push(existing);
      } else {
        const { status, reviewerComment, resolvedBy, resolvedAt, ...newGap } = candidate;
        newGapCandidates.push({ ...newGap, status: 'open' });
      }
    }

    const insertedGaps = newGapCandidates.length
      ? await KnowledgeGap.insertMany(newGapCandidates)
      : [];

    console.log(
      `Gap persistence: ${insertedGaps.length} new, ${updatedGapRecords.length} updated, ${existingGaps.length} existing preserved.`
    );

    // 16. Replace old unresolved conflicts
    // ----------------------------------------------

    const existingUnresolvedConflicts = await Conflict.find({
      project: projectId,
      status: 'unresolved',
    });

    const existingConflictKeys = new Set(
      existingUnresolvedConflicts.map(buildConflictKey)
    );

    const newVerifiedConflicts = rawConflicts.filter(item => {
      const key = buildConflictKey(item);
      if (existingConflictKeys.has(key)) return false;
      existingConflictKeys.add(key);
      return true;
    });

    const insertedConflicts = newVerifiedConflicts.length
      ? await Conflict.insertMany(newVerifiedConflicts)
      : [];

    console.log(
      `Conflict persistence: ${insertedConflicts.length} new, ${existingUnresolvedConflicts.length} existing preserved.`
    );

    // ----------------------------------------------
    // 17. Update project health
    // ----------------------------------------------

    project.healthScore = healthResult.score;

    project.status = 'reconstructed';

    project.lastReconstructedAt = new Date();

    project.stats = project.stats || {};

    project.stats.confirmedFacts =
      confidenceStats.confirmedPercentage;

    project.stats.inferredFacts =
      confidenceStats.inferredPercentage;

    project.stats.openGaps = await KnowledgeGap.countDocuments({ project: projectId, status: { $in: ['open', 'reopened'] } });

    project.stats.unresolvedConflicts =
      await Conflict.countDocuments({
        project: projectId,
        status: 'unresolved',
      });

    await project.save();

    // ----------------------------------------------
    // 18. Log reconstruction completion
    // ----------------------------------------------

    await ActivityLog.create({
      project: project._id,
      user: req.user._id,
      userName: req.user.name,
      action: 'reconstruction_completed',
      entityType: 'reconstruction',
      entityId: knowledgeRecord._id,
      title: 'AI Knowledge Reconstruction Completed',
      details:
        `Health Score: ${healthResult.score}%. ` +
        `${insertedGaps.length} gaps identified. ` +
        `${insertedConflicts.length} conflicts identified.`,
      severity: 'success',
    });

    // ----------------------------------------------
    // 19. Return results
    // ----------------------------------------------

    return res.json({
      success: true,
      message: analysisMode === 'gemini' ? 'Knowledge reconstructed successfully using AI.' : 'Knowledge reconstructed using local evidence-based rules. AI provider was unavailable.',
      analysisMode,
      partial: analysisMode !== 'gemini',

      knowledge: knowledgeRecord,

      gaps: [...updatedGapRecords, ...insertedGaps],

      conflicts: insertedConflicts,

      health: healthResult,

      statistics: {
        documentsAnalyzed: usableDocuments.length,
        totalFacts,
        confirmedFacts: confirmedCount,
        inferredFacts: inferredCount,
        unknownFacts: unknownCount,
        confirmedPercentage:
          confidenceStats.confirmedPercentage,
        inferredPercentage:
          confidenceStats.inferredPercentage,
        unknownPercentage:
          confidenceStats.unknownPercentage,
        gapsDetected: insertedGaps.length,
        conflictsDetected: insertedConflicts.length,
      },
    });

  } catch (err) {
    console.error(
      'Reconstruction Error:',
      err.message
    );

    next(err);
  }
};

// ======================================================
// 2. GET EXTRACTED PROJECT KNOWLEDGE
// ======================================================

const getExtractedKnowledge = async (req, res, next) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findOne({
      _id: projectId,
      owner: req.user._id,
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found.',
      });
    }

    const knowledge = await ExtractedKnowledge.findOne({
      project: projectId,
    }).sort({
      version: -1,
    });

    if (!knowledge) {
      return res.status(404).json({
        success: false,
        message: 'No reconstructed knowledge found.',
      });
    }

    return res.json({
      success: true,
      knowledge,
    });

  } catch (err) {
    next(err);
  }
};

// ======================================================
// 3. EXPORT CONTROLLERS
// ======================================================

module.exports = {
  triggerReconstruction,
  getExtractedKnowledge,
};































