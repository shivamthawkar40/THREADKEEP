import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  CheckCircle2,
  XCircle,
  Edit3,
  Clock,
  MessageSquare,
  User,
  ShieldCheck,
  RefreshCw,
  Search,
} from 'lucide-react';
import api from '../services/api';
import { useProject } from '../context/ProjectContext';
import { useToast } from '../context/ToastContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';

const HumanReviewPage = () => {
  const { currentProject, fetchProjects } = useProject();
  const { addToast } = useToast();

  const [knowledge, setKnowledge] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('queue'); // 'queue' | 'history'

  // Modal State for Review Decision
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [reviewAction, setReviewAction] = useState('approved'); // approved | rejected | edited
  const [comment, setComment] = useState('');
  const [editedTitle, setEditedTitle] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchReviewData = async () => {
    if (!currentProject) return;
    setLoading(true);
    try {
      const [kRes, rRes] = await Promise.all([
        api.get(`/ai/knowledge/${currentProject._id}`),
        api.get(`/reviews/project/${currentProject._id}`),
      ]);

      if (kRes.data?.success) setKnowledge(kRes.data.knowledge);
      if (rRes.data?.success) setReviews(rRes.data.reviews || []);
    } catch (err) {
      console.warn('Failed to fetch review data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviewData();
  }, [currentProject]);

  const handleOpenReview = (item, type, action) => {
    setSelectedItem({ ...item, itemType: type });
    setReviewAction(action);
    setEditedTitle(item.title || item.decision || '');
    setComment('');
    setModalOpen(true);
  };

  const handleSubmitReview = async () => {
    if (!selectedItem || !currentProject) return;
    setSubmitting(true);
    try {
      const res = await api.post('/reviews', {
        projectId: currentProject._id,
        itemType: selectedItem.itemType,
        itemId: selectedItem.id || selectedItem._id || selectedItem.title,
        action: reviewAction,
        previousValue: { title: selectedItem.title || selectedItem.decision },
        newValue: reviewAction === 'edited' ? { title: editedTitle } : null,
        comment,
      });

      if (res.data?.success) {
        addToast(`Finding marked as ${reviewAction}. Audit record logged.`, 'success');
        setModalOpen(false);
        await fetchReviewData();
        await fetchProjects();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to submit review', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Build pending queue from objectives, decisions, and tasks
  const queueItems = [];
  if (knowledge) {
    knowledge.objectives?.forEach((o) => {
      queueItems.push({
        id: o.id,
        title: o.title,
        type: 'objective',
        description: o.description,
        reviewStatus: o.reviewStatus || 'unreviewed',
        citation: o.sources?.[0],
      });
    });

    knowledge.completedTasks?.forEach((t) => {
      queueItems.push({
        id: t.id,
        title: t.title,
        type: 'task',
        description: t.description,
        reviewStatus: t.reviewStatus || 'unreviewed',
        citation: t.sources?.[0],
      });
    });

    knowledge.decisions?.forEach((d, idx) => {
      queueItems.push({
        id: `dec-${idx}`,
        title: d.decision,
        type: 'decision',
        description: d.rationale,
        reviewStatus: d.reviewStatus || 'unreviewed',
        citation: d.sources?.[0],
      });
    });
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#B7C5CC] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-[#181818]">Human Review Center</h1>
            <Badge variant="aqua">Architect Verification Queue</Badge>
          </div>
          <p className="text-xs text-[#737F85] mt-0.5">
            Maintain high rigor: approve, reject, or edit extracted facts so AI inferences are never falsely represented as verified.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" icon={RefreshCw} onClick={fetchReviewData} loading={loading}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#B7C5CC] gap-2">
        <button
          onClick={() => setActiveTab('queue')}
          className={`px-4 py-2 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'queue'
              ? 'border-[#737F85] text-[#525354] bg-[#B8C8D7]/30'
              : 'border-transparent text-[#737F85] hover:text-[#181818]'
          }`}
        >
          Review Queue ({queueItems.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'history'
              ? 'border-[#737F85] text-[#525354] bg-[#B8C8D7]/30'
              : 'border-transparent text-[#737F85] hover:text-[#181818]'
          }`}
        >
          Audit History ({reviews.length})
        </button>
      </div>

      {/* Queue View */}
      {activeTab === 'queue' && (
        <div className="space-y-4">
          {queueItems.length > 0 ? (
            queueItems.map((item) => (
              <Card
                key={item.id}
                className={`p-5 space-y-3 transition-all ${
                  item.reviewStatus === 'approved'
                    ? 'border-[#737F85]/30 bg-[#B8C8D7]/30'
                    : item.reviewStatus === 'rejected'
                    ? 'border-[#B7C5CC] bg-[#B7C5CC]/40'
                    : 'border-[#B7C5CC] bg-white'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#B7C5CC] pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono uppercase font-bold text-[10px] px-2 py-0.5 rounded bg-[#B7C5CC] text-[#181818]">
                      {item.type}
                    </span>
                    <h3 className="font-bold text-sm text-[#181818]">{item.title}</h3>
                  </div>

                  <Badge
                    variant={
                      item.reviewStatus === 'approved'
                        ? 'aqua'
                        : item.reviewStatus === 'rejected'
                        ? 'sage'
                        : 'gray'
                    }
                  >
                    {item.reviewStatus}
                  </Badge>
                </div>

                <p className="text-xs text-[#737F85] leading-relaxed">
                  {item.description}
                </p>

                {item.citation && (
                  <div className="p-2.5 rounded bg-[#DEE5E8] border border-[#B7C5CC] text-[11px] text-[#181818] font-serif italic">
                    "{item.citation.excerpt}"
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <div className="text-[11px] text-[#737F85] font-mono">
                    Citation: {item.citation?.documentName || 'Document record'} Ã¢â‚¬Â¢ Pg {item.citation?.pageNumber || 1}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="xs"
                      icon={CheckCircle2}
                      onClick={() => handleOpenReview(item, item.type, 'approved')}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      size="xs"
                      icon={Edit3}
                      onClick={() => handleOpenReview(item, item.type, 'edited')}
                    >
                      Edit Finding
                    </Button>
                    <Button
                      variant="danger"
                      size="xs"
                      icon={XCircle}
                      onClick={() => handleOpenReview(item, item.type, 'rejected')}
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card className="p-12 text-center text-xs text-[#737F85]">
              No items in the review queue. Run reconstruction or load the sample banking dataset first.
            </Card>
          )}
        </div>
      )}

      {/* Audit History View */}
      {activeTab === 'history' && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#B7C5CC] pb-3">
            <h3 className="text-sm font-bold text-[#181818]">Human Audit & Ratification Trail</h3>
            <Badge variant="aqua">Tamper-Evident Records</Badge>
          </div>

          {reviews.length > 0 ? (
            <div className="space-y-3">
              {reviews.map((rev) => (
                <div key={rev._id} className="p-3.5 rounded-lg bg-[#DEE5E8] border border-[#B7C5CC] space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#181818]">
                        [{rev.itemType?.toUpperCase()}] {rev.itemId}
                      </span>
                      <Badge
                        variant={
                          rev.action === 'approved'
                            ? 'aqua'
                            : rev.action === 'rejected'
                            ? 'sage'
                            : 'sage'
                        }
                        size="xs"
                      >
                        {rev.action}
                      </Badge>
                    </div>
                    <span className="text-[10px] font-mono text-[#737F85]">
                      {new Date(rev.createdAt).toLocaleString()}
                    </span>
                  </div>

                  {rev.comment && (
                    <p className="text-[#181818] text-[11px] font-medium">
                      Note: "{rev.comment}"
                    </p>
                  )}

                  <div className="text-[10px] text-[#525354] font-semibold">
                    Audited by {rev.reviewerName || 'Team Lead'}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-xs text-[#737F85]">
              No review decisions recorded yet. Approve or edit items in the queue above.
            </div>
          )}
        </Card>
      )}

      {/* Review Action Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`Ratify Finding: ${reviewAction.toUpperCase()}`}
        maxWidth="max-w-md"
      >
        {selectedItem && (
          <div className="space-y-4 text-xs">
            <div className="p-3 rounded-lg bg-[#DEE5E8] border border-[#B7C5CC] space-y-1">
              <span className="font-bold text-[10px] uppercase tracking-wider text-[#737F85]">
                Item Under Review
              </span>
              <div className="font-semibold text-[#181818] text-xs">
                {selectedItem.title || selectedItem.decision}
              </div>
            </div>

            {reviewAction === 'edited' && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#181818] mb-1.5">
                  Revised Statement Text *
                </label>
                <textarea
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-[#B7C5CC] bg-white text-xs focus:outline-none focus:ring-1 focus:ring-[#B8C8D7]"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#181818] mb-1.5">
                Reviewer Comments & Justification
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={2}
                placeholder="Optional notes explaining the reason for this approval, rejection, or edit..."
                className="w-full px-3 py-2 rounded-lg border border-[#B7C5CC] bg-white text-xs focus:outline-none focus:ring-1 focus:ring-[#B8C8D7]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#B7C5CC]">
              <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant={reviewAction === 'rejected' ? 'danger' : 'primary'}
                size="sm"
                loading={submitting}
                onClick={handleSubmitReview}
              >
                Confirm {reviewAction}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default HumanReviewPage;

