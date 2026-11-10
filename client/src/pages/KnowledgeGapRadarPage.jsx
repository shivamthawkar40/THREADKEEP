import React, { useState, useEffect } from 'react';
import {
  Radar,
  AlertTriangle,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  Filter,
  MessageSquare,
  ArrowRight,
  ShieldAlert,
  Search,
  RefreshCw,
  FileText,
} from 'lucide-react';
import api from '../services/api';
import { useProject } from '../context/ProjectContext';
import { useToast } from '../context/ToastContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';

const KnowledgeGapRadarPage = () => {
  const { currentProject, fetchProjects } = useProject();
  const { addToast } = useToast();

  const [gaps, setGaps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [severityFilter, setSeverityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Status Action Modal
  const [selectedGap, setSelectedGap] = useState(null);
  const [actionStatus, setActionStatus] = useState('resolved');
  const [reviewerComment, setReviewerComment] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  const fetchGaps = async () => {
    if (!currentProject) return;
    setLoading(true);
    try {
      const res = await api.get(`/gaps/project/${currentProject._id}`);
      if (res.data?.success) {
        setGaps(res.data.gaps || []);
      }
    } catch (err) {
      console.error('Failed to load gaps:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGaps();
  }, [currentProject]);

  const handleOpenActionModal = (gap, newStatus = 'resolved') => {
    setSelectedGap(gap);
    setActionStatus(newStatus);
    setReviewerComment(gap.reviewerComment || '');
    setModalOpen(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedGap) return;
    setUpdating(true);
    try {
      const res = await api.put(`/gaps/${selectedGap._id}/status`, {
        status: actionStatus,
        reviewerComment,
      });
      if (res.data?.success) {
        addToast(`Knowledge gap marked as ${actionStatus}.`, 'success');
        setModalOpen(false);
        await fetchGaps();
        await fetchProjects();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update gap status', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const filteredGaps = gaps.filter((g) => {
    const matchesSearch = g.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.explanation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.whyItMatters.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = severityFilter === 'all' || g.severity === severityFilter;
    const matchesStatus = statusFilter === 'all' || g.status === statusFilter;
    return matchesSearch && matchesSeverity && matchesStatus;
  });

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'critical':
        return <Badge variant="coral">Critical</Badge>;
      case 'high':
        return <Badge variant="gold">High</Badge>;
      case 'medium':
        return <Badge variant="sage">Medium</Badge>;
      default:
        return <Badge variant="gray">Low</Badge>;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'resolved':
        return <Badge variant="teal">Resolved</Badge>;
      case 'not_applicable':
        return <Badge variant="gray">Not Applicable</Badge>;
      case 'reopened':
        return <Badge variant="gold">Reopened</Badge>;
      default:
        return <Badge variant="coral">Open</Badge>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sage/30 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-charcoal">Knowledge Gap Radar</h1>
            <Badge variant="coral">{gaps.filter(g => g.status === 'open').length} Open Blindspots</Badge>
          </div>
          <p className="text-xs text-charcoal-light mt-0.5">
            Surfaces missing task owners, undocumented deployments, incomplete tests, and unanswered questions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" icon={RefreshCw} onClick={fetchGaps} loading={loading}>
            Refresh Radar
          </Button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-charcoal-light absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search gaps, reasons, or recommended actions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-sage/40 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-teal/20 focus:border-teal transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-sage/30 text-xs">
            {['all', 'open', 'resolved', 'not_applicable'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold capitalize transition-colors ${
                  statusFilter === st ? 'bg-teal text-ivory' : 'text-charcoal hover:bg-ivory'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Severity Filter */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-sage/30 text-xs">
            {['all', 'critical', 'high', 'medium'].map((sev) => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold capitalize transition-colors ${
                  severityFilter === sev ? 'bg-charcoal text-ivory' : 'text-charcoal hover:bg-ivory'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Gaps List */}
      {filteredGaps.length > 0 ? (
        <div className="space-y-4">
          {filteredGaps.map((gap) => (
            <Card
              key={gap._id}
              className={`p-6 space-y-4 transition-all ${
                gap.status === 'resolved'
                  ? 'bg-mint-light/20 border-teal/30 opacity-80'
                  : gap.severity === 'critical'
                  ? 'border-coral/40 bg-coral/10'
                  : 'border-sage/40'
              }`}
            >
              {/* Header row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-sage/20 pb-3">
                <div className="flex items-center gap-2.5">
                  <Radar className={`w-4 h-4 ${gap.severity === 'critical' ? 'text-coral-dark' : 'text-gold-dark'}`} />
                  <h3 className="font-bold text-base text-charcoal">{gap.title}</h3>
                </div>
                <div className="flex items-center gap-2">
                  {getSeverityBadge(gap.severity)}
                  {getStatusBadge(gap.status)}
                </div>
              </div>

              {/* Main content grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Explanation */}
                <div className="space-y-1">
                  <div className="font-bold uppercase tracking-wider text-[10px] text-charcoal-light">
                    What is missing
                  </div>
                  <p className="text-charcoal leading-relaxed">{gap.explanation}</p>
                </div>

                {/* Why It Matters */}
                <div className="space-y-1">
                  <div className="font-bold uppercase tracking-wider text-[10px] text-coral-dark">
                    Why It Matters
                  </div>
                  <p className="text-charcoal-light leading-relaxed">{gap.whyItMatters}</p>
                </div>
              </div>

              {/* Suggested Question & Action */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-sage/20 text-xs">
                <div className="p-3 rounded-lg bg-ivory border border-sage/20 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-teal">
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Suggested Question for Departing Contributor:</span>
                  </div>
                  <p className="text-charcoal italic font-serif text-[11px] leading-relaxed">
                    "{gap.suggestedQuestion}"
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-mint-light/40 border border-teal/20 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-teal-deep">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Recommended Continuity Action:</span>
                  </div>
                  <p className="text-charcoal leading-relaxed text-[11px]">
                    {gap.recommendedAction}
                  </p>
                </div>
              </div>

              {/* Reviewer Note if any */}
              {gap.reviewerComment && (
                <div className="p-2.5 rounded bg-gold/10 border border-gold/30 text-xs text-charcoal flex items-start gap-2">
                  <MessageSquare className="w-4 h-4 text-gold-dark shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Reviewer Note:</span> {gap.reviewerComment}
                  </div>
                </div>
              )}

              {/* Evidence & Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <div className="text-[11px] text-charcoal-light flex items-center gap-2">
                  {gap.evidence?.[0] && (
                    <span className="inline-flex items-center gap-1 text-teal font-medium">
                      <FileText className="w-3.5 h-3.5" />
                      Ref: {gap.evidence[0].documentName || 'Document record'}
                    </span>
                  )}
                  {gap.relatedInfo && <span>• Related: {gap.relatedInfo}</span>}
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  {gap.status === 'open' ? (
                    <>
                      <Button
                        variant="secondary"
                        size="xs"
                        icon={CheckCircle2}
                        onClick={() => handleOpenActionModal(gap, 'resolved')}
                      >
                        Resolve Gap
                      </Button>
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => handleOpenActionModal(gap, 'not_applicable')}
                      >
                        Mark N/A
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => handleOpenActionModal(gap, 'open')}
                    >
                      Reopen Gap
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center space-y-3">
          <Radar className="w-12 h-12 text-sage mx-auto" />
          <h3 className="text-base font-bold text-charcoal">No knowledge gaps match your filter</h3>
          <p className="text-xs text-charcoal-light max-w-sm mx-auto">
            All identified blindspots are resolved or filtered out.
          </p>
        </Card>
      )}

      {/* Resolve / Status Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Update Knowledge Gap State"
        maxWidth="max-w-md"
      >
        {selectedGap && (
          <div className="space-y-4 text-xs">
            <div className="p-3 rounded-lg bg-ivory border border-sage/30">
              <div className="font-bold text-charcoal text-sm">{selectedGap.title}</div>
              <div className="text-charcoal-light text-[11px] mt-0.5">
                Severity: {selectedGap.severity.toUpperCase()}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
                Resolution Action
              </label>
              <select
                value={actionStatus}
                onChange={(e) => setActionStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-sage/40 bg-white text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-teal"
              >
                <option value="resolved">Mark as Resolved (Documented & Assigned)</option>
                <option value="not_applicable">Mark as Not Applicable (Deprioritized)</option>
                <option value="open">Reopen (Requires Further Investigation)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
                Reviewer Comments & Resolution Notes
              </label>
              <textarea
                value={reviewerComment}
                onChange={(e) => setReviewerComment(e.target.value)}
                rows={3}
                placeholder="Explain how this gap was resolved (e.g. Assigned to Lead QA, staging runbook documented)..."
                className="w-full px-3 py-2 rounded-lg border border-sage/40 bg-white text-xs focus:outline-none focus:ring-1 focus:ring-teal"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-ivory-dark">
              <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" loading={updating} onClick={handleUpdateStatus}>
                Save Resolution
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default KnowledgeGapRadarPage;
