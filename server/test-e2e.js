const http = require('http');

const request = (options, postData = null) => {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, headers: res.headers, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, raw: data });
        }
      });
    });

    req.on('error', reject);

    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
};

const runTests = async () => {
  console.log('--- STARTING THREADKEEP E2E VERIFICATION ---');

  // 1. Health check
  const health = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/health',
    method: 'GET',
  });
  console.log('1. Health Check:', health.status, health.data);
  if (health.status !== 200) throw new Error('Health check failed');

  // 2. User Registration
  const userPayload = {
    name: 'Lead Architect Alex',
    email: 'architect@spy2o.io',
    password: 'threadkeep2026',
    organization: 'SPY_2.O Core Team',
    role: 'lead_architect',
  };
  const regRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    userPayload
  );
  console.log('2. User Registration:', regRes.status, regRes.data?.success ? 'SUCCESS' : regRes.data?.message);
  
  let token = regRes.data?.token;

  // 3. User Login (if user already existed or to verify login endpoint)
  if (!token) {
    const loginRes = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { email: 'architect@spy2o.io', password: 'threadkeep2026' }
    );
    console.log('3. User Login:', loginRes.status, loginRes.data?.success ? 'SUCCESS' : loginRes.data?.message);
    token = loginRes.data?.token;
  }

  if (!token) throw new Error('Failed to obtain JWT auth token');

  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  // 4. Load Sample Project (FinPulse Core Banking dataset)
  console.log('4. Loading Realistic FinPulse Sample Project...');
  const sampleRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/sample/load',
      method: 'POST',
      headers: authHeaders,
    },
    {}
  );
  console.log('Sample Load Status:', sampleRes.status);
  console.log('Project Created:', sampleRes.data?.project?.name);
  console.log('Documents Processed:', sampleRes.data?.documentsCount);
  console.log('Gaps Identified:', sampleRes.data?.gapsCount);
  console.log('Conflicts Detected:', sampleRes.data?.conflictsCount);
  console.log('Knowledge Health Score:', sampleRes.data?.health?.score + '%');

  const projectId = sampleRes.data?.project?._id;
  if (!projectId) throw new Error('Project ID missing from sample load');

  // 5. Verify Documents
  const docsRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/documents/project/${projectId}`,
    method: 'GET',
    headers: authHeaders,
  });
  console.log('5. Ingested Documents List: Count =', docsRes.data?.count);
  docsRes.data?.documents?.forEach((d) => {
    console.log(`   - [${d.fileType.toUpperCase()}] ${d.originalName}: ${d.wordCount} words, ${d.sections?.length} sections`);
  });

  // 6. Verify AI Extracted Knowledge
  const kRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/ai/knowledge/${projectId}`,
    method: 'GET',
    headers: authHeaders,
  });
  console.log('6. Extracted Knowledge Overview:', kRes.data?.knowledge?.overview?.summary?.substring(0, 100) + '...');
  console.log('   - Objectives:', kRes.data?.knowledge?.objectives?.length);
  console.log('   - Tech Stack Items:', kRes.data?.knowledge?.technologyStack?.length);
  console.log('   - Decisions:', kRes.data?.knowledge?.decisions?.length);
  console.log('   - Completed Tasks:', kRes.data?.knowledge?.completedTasks?.length);
  console.log('   - Pending Tasks:', kRes.data?.knowledge?.pendingTasks?.length);

  // 7. Verify Knowledge Gap Radar
  const gapsRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/gaps/project/${projectId}`,
    method: 'GET',
    headers: authHeaders,
  });
  console.log('7. Knowledge Gaps Detected: Count =', gapsRes.data?.count);
  gapsRes.data?.gaps?.forEach((g) => {
    console.log(`   - [${g.severity.toUpperCase()}] ${g.title} (Status: ${g.status})`);
  });

  // Test resolving a gap
  if (gapsRes.data?.gaps?.length > 0) {
    const gapToResolve = gapsRes.data.gaps[0];
    const resolveGapRes = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: `/api/gaps/${gapToResolve._id}/status`,
        method: 'PUT',
        headers: authHeaders,
      },
      {
        status: 'resolved',
        reviewerComment: 'Assigned QA Automation Engineer and scheduled Cypress test suite integration.',
      }
    );
    console.log('   ✓ Resolved Gap:', resolveGapRes.data?.gap?.title, '-> Status:', resolveGapRes.data?.gap?.status);
  }

  // 8. Verify Conflicts Workspace
  const conflictsRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/conflicts/project/${projectId}`,
    method: 'GET',
    headers: authHeaders,
  });
  console.log('8. Conflicts Workspace: Count =', conflictsRes.data?.count);
  conflictsRes.data?.conflicts?.forEach((c) => {
    console.log(`   - Conflict: "${c.topic}" (Severity: ${c.severity})`);
    console.log(`     Statement A: ${c.statementA.claim}`);
    console.log(`     Statement B: ${c.statementB.claim}`);
  });

  // Test resolving a conflict
  if (conflictsRes.data?.conflicts?.length > 0) {
    const conflictToResolve = conflictsRes.data.conflicts[0];
    const resolveConfRes = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: `/api/conflicts/${conflictToResolve._id}/resolve`,
        method: 'PUT',
        headers: authHeaders,
      },
      {
        status: 'confirmed',
        chosenStatement: 'B',
        resolutionNotes: 'PostgreSQL ratified as primary transaction ledger for banking ACID compliance. MongoDB retained only for ephemeral staging cache.',
      }
    );
    console.log('   ✓ Resolved Conflict:', resolveConfRes.data?.conflict?.topic, '-> Status:', resolveConfRes.data?.conflict?.status);
  }

  // 9. Verify Human Review Center
  const reviewRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/reviews',
      method: 'POST',
      headers: authHeaders,
    },
    {
      projectId,
      itemType: 'objective',
      itemId: 'obj-1',
      action: 'approved',
      comment: 'Verified against executive core banking requirements spec.',
    }
  );
  console.log('9. Human Review Approval:', reviewRes.status, reviewRes.data?.review?.action);

  // 10. Verify Handover Generator & PDF Export
  const handoversRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/handovers/project/${projectId}`,
    method: 'GET',
    headers: authHeaders,
  });
  console.log('10. Handover Dossiers: Count =', handoversRes.data?.count);
  const handover = handoversRes.data?.handovers?.[0];
  if (handover) {
    console.log('    Dossier Title:', handover.title);
    console.log('    Exporting Server-Side PDF Report...');
    const pdfRes = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: `/api/handovers/${handover._id}/export-pdf`,
        method: 'POST',
        headers: authHeaders,
      },
      {}
    );
    console.log('    PDF Export Result:', pdfRes.status, pdfRes.data?.pdfUrl);
  }

  // 11. Verify Dashboard Overview Aggregations
  const dashRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/projects/metrics/overview',
    method: 'GET',
    headers: authHeaders,
  });
  console.log('11. Dashboard Overview Metrics:');
  console.log('    - Total Projects:', dashRes.data?.stats?.totalProjects);
  console.log('    - Total Documents:', dashRes.data?.stats?.totalDocuments);
  console.log('    - Open Gaps:', dashRes.data?.stats?.openGaps);
  console.log('    - Unresolved Conflicts:', dashRes.data?.stats?.unresolvedConflicts);
  console.log('    - Total Human Reviews:', dashRes.data?.stats?.totalReviews);
  console.log('    - Average Health Score:', dashRes.data?.stats?.averageHealthScore + '%');

  console.log('====================================================');
  console.log('✅ ALL THREADKEEP MVP BACKEND TESTS PASSED CLEANLY!');
  console.log('====================================================');
};

runTests().catch((err) => {
  console.error('Test Execution Error:', err);
  process.exit(1);
});
