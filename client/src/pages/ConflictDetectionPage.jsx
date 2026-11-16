import React, { useState, useEffect } from 'react';
import {
  GitCompare,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  FileText,
  Search,
  RefreshCw,
  SlidersHorizontal,
} from 'lucide-react';
import api from '../services/api';
import { useProject } from '../context/ProjectContext';
import { useToast } from '../context/ToastContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';

const ConflictDetectionPage = () => {
  const { currentProject, fetchProjects } = useProject();
  const { addToast } = useToast();

  const [conflicts, setConflicts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [loadError, setLoadError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Resolution Modal
  const [selectedConflict, setSelectedConflict] = useState(null);
  const [chosenStatement, setChosenStatement] = useState('A');
  const [resolutionStatus, setResolutionStatus] = useState('confirmed');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [resolving, setResolving] = useState(false);

  const fetchConflicts = async () => {
    if (!currentProject) {
      setConflicts([]);
      return;
    }

    setLoading(true);
    setLoadError('');

    try {
      const res = await api.get(`/conflicts/project/${currentProject._id}`);
      if (res.data?.success) {
        setConflicts(res.data.conflicts || []);
      }
    } catch (err) {
      console.error('Failed to load conflicts:', err);
      setLoadError(err.response?.data?.message || 'Could not load conflicts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConflicts();
  }, [currentProject]);

  const handleOpenResolveModal = (conflict) => {
    setSelectedConflict(conflict);
    setChosenStatement(conflict.chosenStatement || 'A');
    setResolutionStatus(conflict.status === 'unresolved' ? 'confirmed' : conflict.status);
    setResolutionNotes(conflict.resolutionNotes || '');
    setModalOpen(true);
  };

  const handleResolve = async () => {
    if (!selectedConflict) return;
    setResolving(true);
    try {
      const res = await api.put(`/conflicts/${selectedConflict._id}/resolve`, {
        status: resolutionStatus,
        chosenStatement,
        resolutionNotes,
      });

      if (res.data?.success) {
        addToast(`Conflict on "${selectedConflict.topic}" updated!`, 'success');
        setModalOpen(false);
        await fetchConflicts();
        await fetchProjects();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Resolution failed', 'error');
    } finally {
      setResolving(false);
    }
  };

  const filteredConflicts = conflicts.filter((c) => {
    const searchableText = [
      c.topic,
      c.conflictReason,
      c.statementA?.claim,
      c.statementB?.claim,
      c.statementA?.documentName,
      c.statementB?.documentName,
      c.resolutionNotes,
    ].map(value => String(value || '')).join(' ').toLowerCase();

    const matchesSearch = searchableText.includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchesSeverity = severityFilter === 'all' || c.severity === severityFilter;

    return matchesSearch && matchesStatus && matchesSeverity;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return <Badge variant="aqua">Confirmed Resolution</Badge>;
      case 'rejected':
        return <Badge variant="sage">Rejected Both</Badge>;
      case 'superseded':
        return <Badge variant="sage">Superseded Spec</Badge>;
      default:
        return <Badge variant="sage">Unresolved</Badge>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#B7C5CC] dark:border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-[#181818] dark:text-[#DEE5E8]">Conflict Detection Workspace</h1>
            <Badge variant="sage">
              {conflicts.filter(c => c.status === 'unresolved').length} Unresolved Contradictions
            </Badge>
          </div>
          <p className="text-xs text-[#525354] dark:text-[#B8C8D7] dark:text-[#B8C8D7] mt-0.5">
            Side-by-side inspection of contradictory claims across project document versions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" icon={RefreshCw} onClick={fetchConflicts} loading={loading}>
            Refresh Conflicts
          </Button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#525354] dark:text-[#B8C8D7] dark:text-[#B8C8D7] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search topic, claims, or reason..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-[#B7C5CC] dark:border-white/10 bg-white dark:bg-[#242729] text-xs focus:outline-none focus:ring-2 focus:ring-[#B8C8D7]/20 focus:border-[#737F85] transition-all"
          />
        </div>

        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <div className="flex flex-wrap items-center gap-1.5">
            {['all', 'unresolved', 'confirmed', 'rejected', 'superseded'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                  statusFilter === st ? 'bg-[#181818] text-white' : 'bg-white dark:bg-[#242729] border border-[#B7C5CC] dark:border-white/10 text-[#181818] dark:text-[#DEE5E8] hover:bg-[#DEE5E8] dark:bg-[#2B2C2C]'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-[#B7C5CC] dark:border-white/10 bg-white dark:bg-[#242729] text-xs text-[#181818] dark:text-[#DEE5E8] focus:outline-none focus:ring-1 focus:ring-[#B8C8D7]"
            aria-label="Filter by severity"
          >
            <option value="all">All severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Conflict Cards */}
      {loading ? (
        <Card className="p-12 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-[#737F85] dark:text-[#B8C8D7] mx-auto animate-spin" />
          <h3 className="text-sm font-bold text-[#181818] dark:text-[#DEE5E8]">Loading conflicts...</h3>
          <p className="text-xs text-[#737F85] dark:text-[#B8C8D7]">Fetching project evidence and resolution status.</p>
        </Card>
      ) : loadError ? (
        <Card className="p-12 text-center space-y-3">
          <AlertTriangle className="w-10 h-10 text-[#737F85] dark:text-[#B8C8D7] mx-auto" />
          <h3 className="text-base font-bold text-[#181818] dark:text-[#DEE5E8]">Unable to load conflicts</h3>
          <p className="text-xs text-[#737F85] dark:text-[#B8C8D7] max-w-sm mx-auto">{loadError}</p>
          <Button variant="outline" size="sm" icon={RefreshCw} onClick={fetchConflicts}>
            Try Again
          </Button>
        </Card>
      ) : filteredConflicts.length > 0 ? (
        <div className="space-y-6">
          {filteredConflicts.map((conflict) => (
            <Card
              key={conflict._id}
              className={`p-6 space-y-5 transition-all ${
                conflict.status === 'unresolved' ? 'border-[#B7C5CC] dark:border-white/10 bg-white dark:bg-[#242729]' : 'border-[#B7C5CC] dark:border-white/10 bg-[#B8C8D7] dark:bg-[#353B3E]/30 dark:bg-[#353B3E]'
              }`}
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#B7C5CC] dark:border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <GitCompare className="w-4 h-4 text-[#525354] dark:text-[#B8C8D7]" />
                  <h3 className="font-bold text-base text-[#181818] dark:text-[#DEE5E8]">{conflict.topic}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="sage">Severity: {conflict.severity.toUpperCase()}</Badge>
                  {getStatusBadge(conflict.status)}
                </div>
              </div>

              {/* Side-by-Side Statements */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Statement A */}
                <div className="p-4 rounded-xl border border-[#B7C5CC] dark:border-white/10 bg-[#DEE5E8] dark:bg-[#2B2C2C] space-y-2.5 text-xs">
                  <div className="flex items-center justify-between border-b border-[#B7C5CC] dark:border-white/10 pb-2">
                    <span className="font-bold text-[#525354] dark:text-[#B8C8D7] flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-[#181818] text-white inline-flex items-center justify-center text-[10px]">
                        A
                      </span>
                      Statement A
                    </span>
                    <span className="font-mono text-[10px] text-[#525354] dark:text-[#B8C8D7] dark:text-[#B8C8D7] truncate max-w-[180px]">
                      {conflict.statementA.documentName} (Pg {conflict.statementA.pageNumber || 1})
                    </span>
                  </div>

                  <p className="font-semibold text-[#181818] dark:text-[#DEE5E8] leading-snug">
                    {conflict.statementA.claim}
                  </p>

                  <div className="p-3 rounded-lg bg-white dark:bg-[#242729] border border-[#B7C5CC] dark:border-white/10 text-[11px] text-[#525354] dark:text-[#B8C8D7] dark:text-[#B8C8D7] italic font-serif leading-relaxed">
                    "{conflict.statementA.excerpt}"
                  </div>
                </div>

                {/* Statement B */}
                <div className="p-4 rounded-xl border border-[#B7C5CC] dark:border-white/10 bg-[#DEE5E8] dark:bg-[#2B2C2C] space-y-2.5 text-xs">
                  <div className="flex items-center justify-between border-b border-[#B7C5CC] dark:border-white/10 pb-2">
                    <span className="font-bold text-[#737F85] dark:text-[#B8C8D7] flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-[#737F85] text-white inline-flex items-center justify-center text-[10px]">
                        B
                      </span>
                      Statement B
                    </span>
                    <span className="font-mono text-[10px] text-[#525354] dark:text-[#B8C8D7] dark:text-[#B8C8D7] truncate max-w-[180px]">
                      {conflict.statementB.documentName} (Pg {conflict.statementB.pageNumber || 1})
                    </span>
                  </div>

                  <p className="font-semibold text-[#181818] dark:text-[#DEE5E8] leading-snug">
                    {conflict.statementB.claim}
                  </p>

                  <div className="p-3 rounded-lg bg-white dark:bg-[#242729] border border-[#B7C5CC] dark:border-white/10 text-[11px] text-[#525354] dark:text-[#B8C8D7] dark:text-[#B8C8D7] italic font-serif leading-relaxed">
                    "{conflict.statementB.excerpt}"
                  </div>
                </div>
              </div>

              {/* Conflict Rationale Box */}
              <div className="p-3.5 rounded-lg bg-[#DEE5E8] dark:bg-[#2B2C2C] border border-[#B7C5CC] dark:border-white/10 text-xs text-[#181818] dark:text-[#DEE5E8] space-y-1">
                <div className="font-bold text-[#525354] dark:text-[#B8C8D7] uppercase tracking-wider text-[10px]">
                  Why They Conflict:
                </div>
                <p className="leading-relaxed">{conflict.conflictReason}</p>
                {Number.isFinite(Number(conflict.verificationConfidence)) &&
                  conflict.verificationConfidence !== null &&
                  conflict.verificationConfidence !== undefined && (
                    <div className="pt-2 border-t border-[#B7C5CC] dark:border-white/10 flex items-center justify-between gap-3">
                      <span className="text-[10px] text-[#525354] dark:text-[#B8C8D7]">
                        AI review score (model estimate)
                      </span>
                      <span className="text-[10px] font-bold text-[#181818] dark:text-[#DEE5E8]">
                        {conflict.verificationConfidence}/100
                      </span>
                    </div>
                  )}
              </div>

              {/* Existing Resolution Notes */}
              {conflict.resolutionNotes && (
                <div className="p-3 rounded-lg bg-[#B8C8D7] dark:bg-[#353B3E] border border-[#B7C5CC] dark:border-white/10 text-xs text-[#181818] dark:text-[#DEE5E8] space-y-1">
                  <div className="font-bold text-[#525354] dark:text-[#B8C8D7] uppercase tracking-wider text-[10px]">
                    Current Resolution: {conflict.status.toUpperCase()} (Chosen: Statement {conflict.chosenStatement})
                  </div>
                  <p className="leading-relaxed text-[11px]">{conflict.resolutionNotes}</p>
                </div>
              )}

              {/* Action Bar */}
              <div className="flex items-center justify-between pt-2">
                <div className="text-[11px] text-[#525354] dark:text-[#B8C8D7] dark:text-[#B8C8D7] font-mono">
                  {conflict.resolvedAt
                    ? `Resolved: ${new Date(conflict.resolvedAt).toLocaleDateString()}`
                    : 'Awaiting architectural decision'}
                </div>

                <Button
                  variant="primary"
                  size="xs"
                  icon={CheckCircle2}
                  onClick={() => handleOpenResolveModal(conflict)}
                >
                  {conflict.status === 'unresolved' ? 'Resolve Conflict' : 'Edit Resolution'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center space-y-3">
          <GitCompare className="w-12 h-12 text-[#737F85] dark:text-[#B8C8D7] mx-auto" />
          <h3 className="text-base font-bold text-[#181818] dark:text-[#DEE5E8]">
            {conflicts.length === 0 ? 'No conflicts detected yet' : 'No matching conflicts'}
          </h3>
          <p className="text-xs text-[#737F85] dark:text-[#B8C8D7] max-w-sm mx-auto">
            {conflicts.length === 0
              ? 'Once project documents are reconstructed, detected contradictions will appear here with their supporting evidence.'
              : 'Try changing your search term or clearing the status and severity filters to see more results.'}
          </p>
          {conflicts.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setSeverityFilter('all');
              }}
            >
              Clear Filters
            </Button>
          )}
        </Card>
      )}

      {/* Resolve Conflict Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Resolve Architectural Contradiction"
        maxWidth="max-w-xl"
      >
        {selectedConflict && (
          <div className="space-y-4 text-xs">
            <div className="p-3 rounded-lg bg-[#DEE5E8] dark:bg-[#2B2C2C] border border-[#B7C5CC] dark:border-white/10">
              <div className="font-bold text-[#181818] dark:text-[#DEE5E8] text-sm">{selectedConflict.topic}</div>
              <p className="text-[#525354] dark:text-[#B8C8D7] dark:text-[#B8C8D7] text-[11px] mt-1">{selectedConflict.conflictReason}</p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#181818] dark:text-[#DEE5E8] mb-2">
                Select Authoritative Statement
              </label>
              <div className="space-y-2">
                <label className="flex items-start gap-2.5 p-3 rounded-lg border border-[#B7C5CC] dark:border-white/10 bg-white dark:bg-[#242729] hover:bg-[#B8C8D7] dark:bg-[#353B3E]/30 dark:bg-[#353B3E] cursor-pointer">
                  <input
                    type="radio"
                    name="statement"
                    value="A"
                    checked={chosenStatement === 'A'}
                    onChange={() => setChosenStatement('A')}
                    className="mt-0.5 text-[#525354] dark:text-[#B8C8D7]"
                  />
                  <div>
                    <span className="font-bold text-[#525354] dark:text-[#B8C8D7]">Statement A:</span> {selectedConflict.statementA.claim}
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-3 rounded-lg border border-[#B7C5CC] dark:border-white/10 bg-white dark:bg-[#242729] hover:bg-[#B8C8D7] dark:bg-[#353B3E]/30 dark:bg-[#353B3E] cursor-pointer">
                  <input
                    type="radio"
                    name="statement"
                    value="B"
                    checked={chosenStatement === 'B'}
                    onChange={() => setChosenStatement('B')}
                    className="mt-0.5 text-[#737F85] dark:text-[#B8C8D7]"
                  />
                  <div>
                    <span className="font-bold text-[#737F85] dark:text-[#B8C8D7]">Statement B:</span> {selectedConflict.statementB.claim}
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-3 rounded-lg border border-[#B7C5CC] dark:border-white/10 bg-white dark:bg-[#242729] hover:bg-[#B8C8D7] dark:bg-[#353B3E]/30 dark:bg-[#353B3E] cursor-pointer">
                  <input
                    type="radio"
                    name="statement"
                    value="custom"
                    checked={chosenStatement === 'custom'}
                    onChange={() => setChosenStatement('custom')}
                    className="mt-0.5"
                  />
                  <div>
                    <span className="font-bold text-[#181818] dark:text-[#DEE5E8]">Custom Unified Rationale</span> (Neither is strictly correct)
                  </div>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#181818] dark:text-[#DEE5E8] mb-1.5">
                Resolution State
              </label>
              <select
                value={resolutionStatus}
                onChange={(e) => setResolutionStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[#B7C5CC] dark:border-white/10 bg-white dark:bg-[#242729] text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#B8C8D7]"
              >
                <option value="confirmed">Confirmed (Ratified Decision)</option>
                <option value="superseded">Superseded (Older Document Deprecated)</option>
                <option value="rejected">Rejected Both (Requires Redesign)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#181818] dark:text-[#DEE5E8] mb-1.5">
                Architectural Resolution Notes *
              </label>
              <textarea
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                rows={3}
                placeholder="Explain why this statement was chosen for the team's ongoing implementation..."
                required
                className="w-full px-3 py-2 rounded-lg border border-[#B7C5CC] dark:border-white/10 bg-white dark:bg-[#242729] text-xs focus:outline-none focus:ring-1 focus:ring-[#B8C8D7]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#B7C5CC] dark:border-white/10">
              <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" loading={resolving} onClick={handleResolve}>
                Save Resolution
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ConflictDetectionPage;








