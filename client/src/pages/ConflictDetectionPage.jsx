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
  const [searchTerm, setSearchTerm] = useState('');

  // Resolution Modal
  const [selectedConflict, setSelectedConflict] = useState(null);
  const [chosenStatement, setChosenStatement] = useState('A');
  const [resolutionStatus, setResolutionStatus] = useState('confirmed');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [resolving, setResolving] = useState(false);

  const fetchConflicts = async () => {
    if (!currentProject) return;
    setLoading(true);
    try {
      const res = await api.get(`/conflicts/project/${currentProject._id}`);
      if (res.data?.success) {
        setConflicts(res.data.conflicts || []);
      }
    } catch (err) {
      console.error('Failed to load conflicts:', err);
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
    const matchesSearch = c.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.conflictReason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.statementA.claim.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.statementB.claim.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return <Badge variant="teal">Confirmed Resolution</Badge>;
      case 'rejected':
        return <Badge variant="coral">Rejected Both</Badge>;
      case 'superseded':
        return <Badge variant="gold">Superseded Spec</Badge>;
      default:
        return <Badge variant="coral">Unresolved</Badge>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sage/30 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-charcoal">Conflict Detection Workspace</h1>
            <Badge variant="gold">
              {conflicts.filter(c => c.status === 'unresolved').length} Unresolved Contradictions
            </Badge>
          </div>
          <p className="text-xs text-charcoal-light mt-0.5">
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
          <Search className="w-4 h-4 text-charcoal-light absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search topic, claims, or reason..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-sage/40 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-teal/20 focus:border-teal transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          {['all', 'unresolved', 'confirmed', 'superseded'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                statusFilter === st ? 'bg-teal text-ivory' : 'bg-white border border-sage/30 text-charcoal hover:bg-ivory'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Conflict Cards */}
      {filteredConflicts.length > 0 ? (
        <div className="space-y-6">
          {filteredConflicts.map((conflict) => (
            <Card
              key={conflict._id}
              className={`p-6 space-y-5 transition-all ${
                conflict.status === 'unresolved' ? 'border-gold/40 bg-white' : 'border-teal/30 bg-mint-light/20'
              }`}
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-sage/20 pb-3">
                <div className="flex items-center gap-2">
                  <GitCompare className="w-4 h-4 text-gold-dark" />
                  <h3 className="font-bold text-base text-charcoal">{conflict.topic}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="gold">Severity: {conflict.severity.toUpperCase()}</Badge>
                  {getStatusBadge(conflict.status)}
                </div>
              </div>

              {/* Side-by-Side Statements */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Statement A */}
                <div className="p-4 rounded-xl border border-sage/30 bg-ivory space-y-2.5 text-xs">
                  <div className="flex items-center justify-between border-b border-sage/20 pb-2">
                    <span className="font-bold text-teal flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-teal text-ivory inline-flex items-center justify-center text-[10px]">
                        A
                      </span>
                      Statement A
                    </span>
                    <span className="font-mono text-[10px] text-charcoal-light truncate max-w-[180px]">
                      {conflict.statementA.documentName} (Pg {conflict.statementA.pageNumber || 1})
                    </span>
                  </div>

                  <p className="font-semibold text-charcoal leading-snug">
                    {conflict.statementA.claim}
                  </p>

                  <div className="p-3 rounded-lg bg-white border border-sage/20 text-[11px] text-charcoal-light italic font-serif leading-relaxed">
                    "{conflict.statementA.excerpt}"
                  </div>
                </div>

                {/* Statement B */}
                <div className="p-4 rounded-xl border border-sage/30 bg-ivory space-y-2.5 text-xs">
                  <div className="flex items-center justify-between border-b border-sage/20 pb-2">
                    <span className="font-bold text-coral-dark flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-coral-dark text-ivory inline-flex items-center justify-center text-[10px]">
                        B
                      </span>
                      Statement B
                    </span>
                    <span className="font-mono text-[10px] text-charcoal-light truncate max-w-[180px]">
                      {conflict.statementB.documentName} (Pg {conflict.statementB.pageNumber || 1})
                    </span>
                  </div>

                  <p className="font-semibold text-charcoal leading-snug">
                    {conflict.statementB.claim}
                  </p>

                  <div className="p-3 rounded-lg bg-white border border-sage/20 text-[11px] text-charcoal-light italic font-serif leading-relaxed">
                    "{conflict.statementB.excerpt}"
                  </div>
                </div>
              </div>

              {/* Conflict Rationale Box */}
              <div className="p-3.5 rounded-lg bg-amber-50/70 border border-gold/40 text-xs text-charcoal space-y-1">
                <div className="font-bold text-gold-dark uppercase tracking-wider text-[10px]">
                  Why They Conflict:
                </div>
                <p className="leading-relaxed">{conflict.conflictReason}</p>
              </div>

              {/* Existing Resolution Notes */}
              {conflict.resolutionNotes && (
                <div className="p-3 rounded-lg bg-mint border border-teal/20 text-xs text-charcoal space-y-1">
                  <div className="font-bold text-teal uppercase tracking-wider text-[10px]">
                    Current Resolution: {conflict.status.toUpperCase()} (Chosen: Statement {conflict.chosenStatement})
                  </div>
                  <p className="leading-relaxed text-[11px]">{conflict.resolutionNotes}</p>
                </div>
              )}

              {/* Action Bar */}
              <div className="flex items-center justify-between pt-2">
                <div className="text-[11px] text-charcoal-light font-mono">
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
          <GitCompare className="w-12 h-12 text-sage mx-auto" />
          <h3 className="text-base font-bold text-charcoal">No conflicts detected</h3>
          <p className="text-xs text-charcoal-light max-w-sm mx-auto">
            All ingested project specifications align without detected contradictions.
          </p>
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
            <div className="p-3 rounded-lg bg-ivory border border-sage/30">
              <div className="font-bold text-charcoal text-sm">{selectedConflict.topic}</div>
              <p className="text-charcoal-light text-[11px] mt-1">{selectedConflict.conflictReason}</p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-2">
                Select Authoritative Statement
              </label>
              <div className="space-y-2">
                <label className="flex items-start gap-2.5 p-3 rounded-lg border border-sage/30 bg-white hover:bg-mint/30 cursor-pointer">
                  <input
                    type="radio"
                    name="statement"
                    value="A"
                    checked={chosenStatement === 'A'}
                    onChange={() => setChosenStatement('A')}
                    className="mt-0.5 text-teal"
                  />
                  <div>
                    <span className="font-bold text-teal">Statement A:</span> {selectedConflict.statementA.claim}
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-3 rounded-lg border border-sage/30 bg-white hover:bg-mint/30 cursor-pointer">
                  <input
                    type="radio"
                    name="statement"
                    value="B"
                    checked={chosenStatement === 'B'}
                    onChange={() => setChosenStatement('B')}
                    className="mt-0.5 text-coral-dark"
                  />
                  <div>
                    <span className="font-bold text-coral-dark">Statement B:</span> {selectedConflict.statementB.claim}
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-3 rounded-lg border border-sage/30 bg-white hover:bg-mint/30 cursor-pointer">
                  <input
                    type="radio"
                    name="statement"
                    value="custom"
                    checked={chosenStatement === 'custom'}
                    onChange={() => setChosenStatement('custom')}
                    className="mt-0.5"
                  />
                  <div>
                    <span className="font-bold text-charcoal">Custom Unified Rationale</span> (Neither is strictly correct)
                  </div>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
                Resolution State
              </label>
              <select
                value={resolutionStatus}
                onChange={(e) => setResolutionStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-sage/40 bg-white text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-teal"
              >
                <option value="confirmed">Confirmed (Ratified Decision)</option>
                <option value="superseded">Superseded (Older Document Deprecated)</option>
                <option value="rejected">Rejected Both (Requires Redesign)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
                Architectural Resolution Notes *
              </label>
              <textarea
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                rows={3}
                placeholder="Explain why this statement was chosen for the team's ongoing implementation..."
                required
                className="w-full px-3 py-2 rounded-lg border border-sage/40 bg-white text-xs focus:outline-none focus:ring-1 focus:ring-teal"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-ivory-dark">
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
