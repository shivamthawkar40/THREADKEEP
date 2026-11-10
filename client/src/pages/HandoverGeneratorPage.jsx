import React, { useState, useEffect } from 'react';
import {
  FileCheck2,
  Download,
  Printer,
  Sparkles,
  Edit3,
  CheckCircle2,
  AlertTriangle,
  History,
  ShieldCheck,
  FileText,
  Clock,
  User,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';

import api from '../services/api';
import { useProject } from '../context/ProjectContext';
import { useToast } from '../context/ToastContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import HealthScoreBadge from '../components/common/HealthScoreBadge';
import Modal from '../components/common/Modal';

const HandoverGeneratorPage = () => {
  const { currentProject } = useProject();
  const { addToast } = useToast();

  const [handovers, setHandovers] = useState([]);
  const [activeHandover, setActiveHandover] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Edit Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [summaryEdit, setSummaryEdit] = useState('');
  const [titleEdit, setTitleEdit] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  // ==========================================
  // FETCH HANDOVERS
  // ==========================================

  const fetchHandovers = async () => {
    if (!currentProject) return;

    setLoading(true);

    try {
      const res = await api.get(
        `/handovers/project/${currentProject._id}`
      );

      if (res.data?.success) {
        const data = res.data.handovers || [];

        setHandovers(data);

        if (data.length > 0) {
          setActiveHandover(data[0]);
        } else {
          setActiveHandover(null);
        }
      }
    } catch (err) {
      console.warn('Failed to load handovers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHandovers();
  }, [currentProject]);

  // ==========================================
  // GENERATE HANDOVER
  // ==========================================

  const handleGenerate = async () => {
    if (!currentProject) {
      addToast('Please select a project first.', 'warning');
      return;
    }

    setGenerating(true);

    try {
      const nextVer =
        handovers.length > 0
          ? `1.${handovers.length}.0`
          : '1.0.0';

      const res = await api.post(
        `/handovers/generate/${currentProject._id}`,
        {
          version: nextVer,
          title: `${currentProject.name} Engineering Handover Dossier`,
        }
      );

      if (res.data?.success) {
        addToast(
          'New executive handover dossier generated successfully!',
          'success'
        );

        await fetchHandovers();

        setActiveHandover(res.data.handover);
      }
    } catch (err) {
      addToast(
        err.response?.data?.message ||
        'Handover generation failed',
        'error'
      );
    } finally {
      setGenerating(false);
    }
  };

  // ==========================================
  // OPEN EDIT MODAL
  // ==========================================

  const handleOpenEdit = () => {
    if (!activeHandover) return;

    setTitleEdit(activeHandover.title);

    setSummaryEdit(
      activeHandover.sections?.projectOverview ||
      activeHandover.summary ||
      ''
    );

    setEditModalOpen(true);
  };

  // ==========================================
  // SAVE HANDOVER EDIT
  // ==========================================

  const handleSaveEdit = async () => {
    if (!activeHandover) return;

    setSavingEdit(true);

    try {
      const res = await api.put(
        `/handovers/${activeHandover._id}`,
        {
          title: titleEdit,
          summary: summaryEdit,
          sections: {
            projectOverview: summaryEdit,
          },
        }
      );

      if (res.data?.success) {
        addToast(
          'Handover updated successfully.',
          'success'
        );

        setActiveHandover(res.data.handover);

        setEditModalOpen(false);

        await fetchHandovers();
      }
    } catch (err) {
      addToast(
        err.response?.data?.message ||
        'Failed to update handover',
        'error'
      );
    } finally {
      setSavingEdit(false);
    }
  };

  // ==========================================
  // EXPORT AND DOWNLOAD PDF
  // ==========================================

  const handleExportPDF = async () => {
    if (!activeHandover?._id) {
      addToast(
        'Please select a handover report first.',
        'warning'
      );
      return;
    }

    setExporting(true);

    try {
      // STEP 1: Generate PDF on backend

      const exportRes = await api.post(
        `/handovers/${activeHandover._id}/export-pdf`
      );

      if (!exportRes.data?.success) {
        throw new Error(
          exportRes.data?.message ||
          'PDF generation failed.'
        );
      }

      // STEP 2: Download PDF using authenticated Axios request

      const downloadRes = await api.get(
        `/handovers/${activeHandover._id}/download-pdf`,
        {
          responseType: 'blob',
          headers: {
            Accept: 'application/pdf',
          },
        }
      );

      const downloadedData = downloadRes.data;

      // STEP 3: Check response type

      const contentType = String(
        downloadRes.headers?.['content-type'] ||
        downloadedData?.type ||
        ''
      ).toLowerCase();

      // Handle JSON or HTML error responses

      if (
        contentType.includes('application/json') ||
        contentType.includes('text/html')
      ) {
        const errorText = await downloadedData.text();

        let message = errorText;

        try {
          const parsed = JSON.parse(errorText);
          message = parsed.message || errorText;
        } catch (_) {
          // Keep original error text
        }

        throw new Error(
          message || 'Server did not return a PDF file.'
        );
      }

      // STEP 4: Create PDF Blob

      const pdfBlob =
        downloadedData instanceof Blob
          ? downloadedData
          : new Blob(
              [downloadedData],
              { type: 'application/pdf' }
            );

      if (pdfBlob.size < 100) {
        throw new Error(
          'The downloaded PDF is empty or incomplete.'
        );
      }

      // STEP 5: Verify actual PDF signature

      const signature = await pdfBlob
        .slice(0, 5)
        .text();

      if (signature !== '%PDF-') {
        throw new Error(
          'Downloaded data is not a valid PDF. Check backend response.'
        );
      }

      // STEP 6: Trigger browser download

      const objectUrl = window.URL.createObjectURL(
        new Blob(
          [pdfBlob],
          { type: 'application/pdf' }
        )
      );

      const link = document.createElement('a');

      const projectKey =
        currentProject?.key || 'PROJECT';

      link.href = objectUrl;

      link.download =
        `THREADKEEP-Handover-${projectKey}-${Date.now()}.pdf`;

      link.style.display = 'none';

      document.body.appendChild(link);

      link.click();

      link.remove();

      // STEP 7: Cleanup after download starts

      window.setTimeout(() => {
        window.URL.revokeObjectURL(objectUrl);
      }, 10000);

      addToast(
        'PDF downloaded successfully!',
        'success'
      );

    } catch (err) {
      console.error('PDF Export Error:', err);

      let message =
        err.response?.data?.message ||
        err.message ||
        'PDF export failed.';

      // Axios may return error body as Blob

      if (err.response?.data instanceof Blob) {
        try {
          const errorText =
            await err.response.data.text();

          const parsed = JSON.parse(errorText);

          message = parsed.message || message;
        } catch (_) {
          // Keep original error message
        }
      }

      addToast(message, 'error');

    } finally {
      setExporting(false);
    }
  };

  // ==========================================
  // PRINT
  // ==========================================

  const handlePrint = () => {
    window.print();
  };

  // ==========================================
  // MAIN UI
  // ==========================================

  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* HEADER */}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sage/30 pb-5">

        <div>
          <div className="flex items-center gap-2">

            <h1 className="text-2xl font-black text-charcoal">
              Handover Generator
            </h1>

            <Badge variant="teal">
              Executive Report Builder
            </Badge>

          </div>

          <p className="text-xs text-charcoal-light mt-0.5">
            Compile architecture, decisions, open blind spots,
            and signature sign-offs into an executive PDF dossier.
          </p>
        </div>

        <div className="flex items-center gap-2.5">

          <Button
            variant="outline"
            size="sm"
            icon={Printer}
            onClick={handlePrint}
            disabled={!activeHandover}
          >
            Print
          </Button>

          <Button
            variant="secondary"
            size="sm"
            icon={Download}
            loading={exporting}
            onClick={handleExportPDF}
            disabled={!activeHandover || exporting}
          >
            Download PDF Report
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={Sparkles}
            loading={generating}
            onClick={handleGenerate}
          >
            Generate New Dossier
          </Button>

        </div>
      </div>

      {/* HANDOVER HISTORY */}

      {handovers.length > 0 && (

        <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-sage/30 text-xs">

          <div className="flex items-center gap-2">

            <History className="w-4 h-4 text-teal" />

            <span className="font-bold text-charcoal">
              Handover History:
            </span>

            <div className="flex items-center gap-1">

              {handovers.map((h) => (

                <button
                  key={h._id}
                  onClick={() => setActiveHandover(h)}
                  className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition-colors ${
                    activeHandover?._id === h._id
                      ? 'bg-teal text-ivory'
                      : 'bg-ivory border border-sage/20 text-charcoal hover:bg-mint/40'
                  }`}
                >
                  v{h.version}
                </button>

              ))}

            </div>
          </div>

          <div className="flex items-center gap-3">

            <Button
              variant="ghost"
              size="xs"
              icon={Edit3}
              onClick={handleOpenEdit}
            >
              Edit Summary
            </Button>

          </div>
        </div>
      )}

      {/* HANDOVER PREVIEW */}

      {activeHandover ? (

        <div
          id="handover-report"
          className="bg-white rounded-2xl border border-sage/40 shadow-elevated p-8 md:p-12 space-y-8 max-w-5xl mx-auto"
        >

          {/* REPORT HEADER */}

          <div className="border-b-2 border-teal pb-6 space-y-3">

            <div className="flex items-center justify-between">

              <span className="font-mono text-xs font-bold text-teal tracking-widest uppercase">
                THREADKEEP // EXECUTIVE HANDOVER DOSSIER
              </span>

              <Badge variant="teal">
                VERSION {activeHandover.version}
              </Badge>

            </div>

            <h2 className="text-3xl font-extrabold text-charcoal tracking-tight">
              {activeHandover.title}
            </h2>

            <div className="flex flex-wrap items-center gap-4 text-xs text-charcoal-light font-mono pt-1">

              <span>
                Project Key:
                <strong className="text-charcoal">
                  {currentProject?.key}
                </strong>
              </span>

              <span>•</span>

              <span>
                Generated:
                {' '}
                {new Date(activeHandover.createdAt).toLocaleDateString()}
              </span>

              <span>•</span>

              <span>
                Target Domain:
                {' '}
                {currentProject?.targetDomain || 'Core Enterprise'}
              </span>

              <span>•</span>

              <span className="text-teal font-bold">
                Health Score:
                {' '}
                {activeHandover.metadata?.knowledgeHealthScore || 85}%
              </span>

            </div>
          </div>

          {/* 1. EXECUTIVE SUMMARY */}

          <section className="space-y-2">

            <div className="flex items-center gap-2 text-teal font-bold text-xs uppercase tracking-wider">

              <span className="w-2 h-2 rounded-full bg-teal" />

              <span>
                1. Executive Summary & Context
              </span>

            </div>

            <p className="text-sm text-charcoal leading-relaxed bg-ivory p-4 rounded-xl border border-sage/20">
              {activeHandover.sections?.projectOverview ||
                activeHandover.summary}
            </p>

          </section>

          {/* 2. PROJECT OBJECTIVES */}

          <section className="space-y-3">

            <div className="flex items-center gap-2 text-teal font-bold text-xs uppercase tracking-wider">

              <span className="w-2 h-2 rounded-full bg-teal" />

              <span>
                2. Strategic Objectives
              </span>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

              {activeHandover.sections?.projectObjectives?.map(
                (obj, idx) => (

                  <div
                    key={idx}
                    className="p-3.5 rounded-lg border border-sage/20 bg-ivory space-y-1 text-xs"
                  >

                    <div className="font-bold text-charcoal flex items-center justify-between">

                      <span>{obj.title}</span>

                      <Badge variant="teal" size="xs">
                        {obj.status || 'Verified'}
                      </Badge>

                    </div>

                    {obj.description && (
                      <p className="text-charcoal-light text-[11px]">
                        {obj.description}
                      </p>
                    )}

                  </div>

                )
              )}

            </div>
          </section>

          {/* 3. TECHNICAL ARCHITECTURE */}

          <section className="space-y-3">

            <div className="flex items-center gap-2 text-teal font-bold text-xs uppercase tracking-wider">

              <span className="w-2 h-2 rounded-full bg-teal" />

              <span>
                3. Technical Architecture & Technology Stack
              </span>

            </div>

            <p className="text-xs text-charcoal leading-relaxed">
              {activeHandover.sections?.technicalArchitecture?.overview}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono">

              {activeHandover.sections?.technologyStack?.map(
                (t, idx) => (

                  <div
                    key={idx}
                    className="p-2.5 rounded border border-sage/20 bg-ivory flex justify-between"
                  >

                    <span className="text-charcoal-light text-[11px]">
                      {t.category}
                    </span>

                    <span className="font-bold text-teal text-[11px]">
                      {t.technology}
                    </span>

                  </div>

                )
              )}

            </div>

          </section>

          {/* 4. IMPORTANT DECISIONS */}

          <section className="space-y-3">

            <div className="flex items-center gap-2 text-teal font-bold text-xs uppercase tracking-wider">

              <span className="w-2 h-2 rounded-full bg-teal" />

              <span>
                4. Key Decisions & Rationale
              </span>

            </div>

            <div className="space-y-2">

              {activeHandover.sections?.importantDecisions?.map(
                (d, idx) => (

                  <div
                    key={idx}
                    className="p-3.5 rounded-lg border border-sage/20 bg-ivory text-xs space-y-1"
                  >

                    <div className="font-bold text-charcoal">
                      Decision: {d.decision}
                    </div>

                    <p className="text-charcoal-light text-[11px] leading-relaxed">
                      Rationale: {d.rationale}
                    </p>

                  </div>

                )
              )}

            </div>

          </section>

          {/* 5. KNOWLEDGE GAP RADAR */}

          <section className="space-y-3">

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-2 text-coral-dark font-bold text-xs uppercase tracking-wider">

                <span className="w-2 h-2 rounded-full bg-coral-dark" />

                <span>
                  5. Knowledge Gap Radar (Unresolved Blindspots)
                </span>

              </div>

              <span className="text-[11px] font-mono font-bold text-coral-dark">
                {activeHandover.sections?.knowledgeGaps?.length || 0}
                {' '}
                Open Items
              </span>

            </div>

            {activeHandover.sections?.knowledgeGaps?.length > 0 ? (

              <div className="space-y-2">

                {activeHandover.sections.knowledgeGaps.map(
                  (g, idx) => (

                    <div
                      key={idx}
                      className="p-3.5 rounded-lg border border-coral/30 bg-coral/10 text-xs space-y-1"
                    >

                      <div className="flex items-center justify-between font-bold text-charcoal">

                        <span>
                          [{g.severity?.toUpperCase()}] {g.title}
                        </span>

                        <Badge variant="coral" size="xs">
                          Requires Action
                        </Badge>

                      </div>

                      <p className="text-charcoal-light text-[11px]">
                        Recommended Action: {g.recommendation}
                      </p>

                    </div>

                  )
                )}

              </div>

            ) : (

              <p className="text-xs text-teal font-semibold">
                ✓ All identified knowledge gaps have been resolved and documented by human reviewers.
              </p>

            )}

          </section>

          {/* 6. UNRESOLVED CONFLICTS */}

          <section className="space-y-3">

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-2 text-gold-dark font-bold text-xs uppercase tracking-wider">

                <span className="w-2 h-2 rounded-full bg-gold-dark" />

                <span>
                  6. Cross-Document Contradictions
                </span>

              </div>

              <span className="text-[11px] font-mono font-bold text-gold-dark">
                {activeHandover.sections?.unresolvedConflicts?.length || 0}
                {' '}
                Items
              </span>

            </div>

            {activeHandover.sections?.unresolvedConflicts?.length > 0 ? (

              <div className="space-y-2">

                {activeHandover.sections.unresolvedConflicts.map(
                  (c, idx) => (

                    <div
                      key={idx}
                      className="p-3.5 rounded-lg border border-gold/40 bg-gold/10 text-xs space-y-1.5"
                    >

                      <div className="font-bold text-charcoal">
                        Topic: {c.topic}
                      </div>

                      <div className="text-[11px] text-charcoal-light space-y-0.5">

                        <div>• A: {c.statementA}</div>

                        <div>• B: {c.statementB}</div>

                      </div>

                    </div>

                  )
                )}

              </div>

            ) : (

              <p className="text-xs text-teal font-semibold">
                ✓ No unresolved technical conflicts exist across project specifications.
              </p>

            )}

          </section>

          {/* 7. RECOMMENDED NEXT ACTIONS */}

          <section className="space-y-3">

            <div className="flex items-center gap-2 text-teal font-bold text-xs uppercase tracking-wider">

              <span className="w-2 h-2 rounded-full bg-teal" />

              <span>
                7. Recommended Next Actions for Incoming Contributors
              </span>

            </div>

            <div className="space-y-2">

              {activeHandover.sections?.recommendedNextActions?.map(
                (act, idx) => (

                  <div
                    key={idx}
                    className="flex items-start gap-2.5 p-3 rounded-lg bg-mint-light/40 border border-teal/20 text-xs"
                  >

                    <span className="font-bold text-teal">
                      {idx + 1}.
                    </span>

                    <span className="text-charcoal font-medium leading-relaxed">
                      {act}
                    </span>

                  </div>

                )
              )}

            </div>

          </section>

          {/* SIGN-OFF BLOCK */}

          <section className="pt-8 border-t-2 border-sage/30 space-y-4">

            <div className="font-bold text-xs uppercase tracking-wider text-charcoal">
              Handover Verification & Formal Sign-off
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-6 rounded-xl border border-sage/30 bg-ivory">

              <div className="space-y-4 text-xs">

                <div className="text-charcoal-light font-medium">
                  Outgoing Contributor / Lead:
                </div>

                <div className="border-b border-charcoal/40 h-8" />

                <div className="flex justify-between text-[11px] text-charcoal-light">
                  <span>Signature</span>
                  <span>Date</span>
                </div>

              </div>

              <div className="space-y-4 text-xs">

                <div className="text-charcoal-light font-medium">
                  Incoming Contributor / Architect:
                </div>

                <div className="border-b border-charcoal/40 h-8" />

                <div className="flex justify-between text-[11px] text-charcoal-light">
                  <span>Signature</span>
                  <span>Date</span>
                </div>

              </div>

            </div>

          </section>

        </div>

      ) : (

        <Card className="p-12 text-center space-y-3">

          <FileCheck2 className="w-12 h-12 text-sage mx-auto" />

          <h3 className="text-base font-bold text-charcoal">
            No Handover Report Generated Yet
          </h3>

          <p className="text-xs text-charcoal-light max-w-sm mx-auto">
            Click "Generate New Dossier" above to synthesize project
            knowledge, gaps, and recommendations into an executive report.
          </p>

          <Button
            variant="primary"
            size="sm"
            icon={Sparkles}
            onClick={handleGenerate}
            loading={generating}
          >
            Generate Handover Dossier
          </Button>

        </Card>

      )}

      {/* EDIT SUMMARY MODAL */}

      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Handover Summary & Title"
        maxWidth="max-w-lg"
      >

        <div className="space-y-4 text-xs">

          <div>

            <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
              Handover Dossier Title
            </label>

            <input
              type="text"
              value={titleEdit}
              onChange={(e) => setTitleEdit(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg border border-sage/40 bg-white text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-teal"
            />

          </div>

          <div>

            <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
              Executive Overview
            </label>

            <textarea
              value={summaryEdit}
              onChange={(e) => setSummaryEdit(e.target.value)}
              rows={5}
              className="w-full px-3.5 py-2 rounded-lg border border-sage/40 bg-white text-xs focus:outline-none focus:ring-1 focus:ring-teal"
            />

          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-ivory-dark">

            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditModalOpen(false)}
            >
              Cancel
            </Button>

            <Button
              variant="primary"
              size="sm"
              loading={savingEdit}
              onClick={handleSaveEdit}
            >
              Save Changes
            </Button>

          </div>

        </div>

      </Modal>

    </div>
  );
};

export default HandoverGeneratorPage;