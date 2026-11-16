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
  const [loadError, setLoadError] = useState('');
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
    if (!currentProject) {
      setGaps([]);
      return;
    }

    setLoading(true);
    setLoadError('');

    try {
      const res = await api.get(`/gaps/project/${currentProject._id}`);
      if (res.data?.success) {
        setGaps(res.data.gaps || []);
      }
    } catch (err) {
      console.error('Failed to load gaps:', err);
      setLoadError(err.response?.data?.message || 'Could not load knowledge gaps. Please try again.');
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
    const searchableText = [
      g.title, g.explanation, g.whyItMatters,
      g.recommendedAction, g.relatedInfo, g.suggestedQuestion,
    ].map(value => String(value || '')).join(' ').toLowerCase();
    const matchesSearch = searchableText.includes(searchTerm.toLowerCase());
    const matchesSeverity = severityFilter === 'all' || g.severity === severityFilter;
    const matchesStatus = statusFilter === 'all' || g.status === statusFilter;
    return matchesSearch && matchesSeverity && matchesStatus;
  });

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'critical':
        return <Badge variant="sage">Critical</Badge>;
      case 'high':
        return <Badge variant="sage">High</Badge>;
      case 'medium':
        return <Badge variant="sage">Medium</Badge>;
      default:
        return <Badge variant="gray">Low</Badge>;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'resolved':
        return <Badge variant="aqua">Resolved</Badge>;
      case 'not_applicable':
        return <Badge variant="gray">Not Applicable</Badge>;
      case 'reopened':
        return <Badge variant="sage">Reopened</Badge>;
      default:
        return <Badge variant="sage">Open</Badge>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#B7C5CC] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-[#181818]">Knowledge Gap Radar</h1>
            <Badge variant="sage">{gaps.filter(g => ['open', 'reopened'].includes(g.status)).length} Active Blindspots</Badge>
          </div>
          <p className="text-xs text-[#737F85] mt-0.5">
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
          <Search className="w-4 h-4 text-[#737F85] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search gaps, reasons, or recommended actions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-[#B7C5CC] bg-white text-xs focus:outline-none focus:ring-2 focus:ring-[#B8C8D7]/20 focus:border-[#737F85] transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-[#B7C5CC] text-xs">
            {['all', 'open', 'reopened', 'resolved', 'not_applicable'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold capitalize transition-colors ${
                  statusFilter === st ? 'bg-[#181818] text-white' : 'text-[#181818] hover:bg-[#DEE5E8]'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Severity Filter */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-[#B7C5CC] text-xs">
            {['all', 'critical', 'high', 'medium', 'low'].map((sev) => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold capitalize transition-colors ${
                  severityFilter === sev ? 'bg-[#2B2C2C] text-white' : 'text-[#181818] hover:bg-[#DEE5E8]'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Gaps List */}
      {loadError ? (
        <Card className="p-8 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-[#737F85] mx-auto" />
          <h3 className="font-bold text-[#181818]">Unable to load knowledge gaps</h3>
          <p className="text-xs text-[#737F85]">{loadError}</p>
          <Button variant="outline" size="sm" onClick={fetchGaps} loading={loading}>Try Again</Button>
        </Card>
      ) : filteredGaps.length > 0 ? (
        <div className="space-y-4">
          {filteredGaps.map((gap) => (
            <Card
              key={gap._id}
              className={`p-6 space-y-4 transition-all ${
                gap.status === 'resolved'
                  ? 'bg-[#B8C8D7]/30 border-[#B7C5CC] opacity-80'
                  : gap.severity === 'critical'
                  ? 'border-[#B7C5CC]/40 bg-[#B7C5CC]/40'
                  : 'border-[#B7C5CC]'
              }`}
            >
              {/* Header row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#B7C5CC] pb-3">
                <div className="flex items-center gap-2.5">
                  <Radar className={`w-4 h-4 ${gap.severity === 'critical' ? 'text-[#737F85]' : 'text-[#525354]'}`} />
                  <h3 className="font-bold text-base text-[#181818]">{gap.title}</h3>
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
                  <div className="font-bold uppercase tracking-wider text-[10px] text-[#737F85]">
                    What is missing
                  </div>
                  <p className="text-[#181818] leading-relaxed">{gap.explanation}</p>
                </div>

                {/* Why It Matters */}
                <div className="space-y-1">
                  <div className="font-bold uppercase tracking-wider text-[10px] text-[#737F85]">
                    Why It Matters
                  </div>
                  <p className="text-[#737F85] leading-relaxed">{gap.whyItMatters}</p>
                </div>
              </div>

              {/* Suggested Question & Action */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-[#B7C5CC] text-xs">
                <div className="p-3 rounded-lg bg-[#DEE5E8] border border-[#B7C5CC] space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-[#525354]">
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Suggested Question for Departing Contributor:</span>
                  </div>
                  <p className="text-[#181818] italic font-serif text-[11px] leading-relaxed">
                    "{gap.suggestedQuestion}"
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-[#B8C8D7]/40 border border-[#B7C5CC] space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-[#525354]-deep">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Recommended Continuity Action:</span>
                  </div>
                  <p className="text-[#181818] leading-relaxed text-[11px]">
                    {gap.recommendedAction}
                  </p>
                </div>
              </div>

              {/* Reviewer Note if any */}
              {gap.reviewerComment && (
                <div className="p-2.5 rounded bg-[#B8C8D7]/30 border border-[#B7C5CC] text-xs text-[#181818] flex items-start gap-2">
                  <MessageSquare className="w-4 h-4 text-[#525354] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Reviewer Note:</span> {gap.reviewerComment}
                  </div>
                </div>
              )}

              {/* Evidence & Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <div className="text-[11px] text-[#737F85] flex items-center gap-2">
                  {gap.evidence?.[0] && (
                    <span className="inline-flex items-center gap-1 text-[#525354] font-medium">
                      <FileText className="w-3.5 h-3.5" />
                      Ref: {gap.evidence[0].documentName || 'Document record'}
                    </span>
                  )}
                  {gap.relatedInfo && <span>• Related: {gap.relatedInfo}</span>}
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  {['open', 'reopened'].includes(gap.status) ? (
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
                      onClick={() => handleOpenActionModal(gap, 'reopened')}
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
          <Radar className="w-12 h-12 text-[#737F85] mx-auto" />
          <h3 className="text-base font-bold text-[#181818]">No knowledge gaps match your filter</h3>
          <p className="text-xs text-[#737F85] max-w-sm mx-auto">
{gaps.length === 0 ? 'No knowledge gaps have been identified for this project yet. Run knowledge reconstruction after uploading project documents.' : 'Try changing your search or filters to find the gap you need.'}
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
            <div className="p-3 rounded-lg bg-[#DEE5E8] border border-[#B7C5CC]">
              <div className="font-bold text-[#181818] text-sm">{selectedGap.title}</div>
              <div className="text-[#737F85] text-[11px] mt-0.5">
                Severity: {selectedGap.severity.toUpperCase()}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#181818] mb-1.5">
                Resolution Action
              </label>
              <select
                value={actionStatus}
                onChange={(e) => setActionStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[#B7C5CC] bg-white text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#B8C8D7]"
              >
                <option value="resolved">Mark as Resolved (Documented & Assigned)</option>
                <option value="not_applicable">Mark as Not Applicable (Deprioritized)</option>
                <option value="reopened">Reopen (Requires Further Investigation)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#181818] mb-1.5">
                Reviewer Comments & Resolution Notes
              </label>
              <textarea
                value={reviewerComment}
                onChange={(e) => setReviewerComment(e.target.value)}
                rows={3}
                placeholder="Explain how this gap was resolved (e.g. Assigned to Lead QA, staging runbook documented)..."
                className="w-full px-3 py-2 rounded-lg border border-[#B7C5CC] bg-white text-xs focus:outline-none focus:ring-1 focus:ring-[#B8C8D7]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#B7C5CC]">
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





