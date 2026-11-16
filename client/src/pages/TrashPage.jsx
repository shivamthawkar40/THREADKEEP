import React, { useCallback, useEffect, useState } from 'react';
import { Trash2, RotateCcw, RefreshCw, FileText, AlertTriangle } from 'lucide-react';
import api from '../services/api';
import { useProject } from '../context/ProjectContext';
import { useToast } from '../context/ToastContext';

const TrashPage = () => {
  const { currentProject, fetchProjects } = useProject();
  const { addToast } = useToast();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const fetchTrash = useCallback(async () => {
    if (!currentProject?._id) {
      setDocuments([]);
      return;
    }

    setLoading(true);
    try {
      const response = await api.get(`/documents/trash/${currentProject._id}`);
      const data = response.data;
      const list = Array.isArray(data)
        ? data
        : data?.documents || data?.data?.documents || data?.data || [];
      setDocuments(Array.isArray(list) ? list : []);
    } catch (error) {
      addToast(error.response?.data?.message || 'Could not load Trash.', 'error');
    } finally {
      setLoading(false);
    }
  }, [currentProject?._id]);

  useEffect(() => {
    fetchTrash();
  }, [fetchTrash]);

  const handleRestore = async (doc) => {
    const name = doc.originalName || doc.name || 'this document';
    if (!window.confirm(`Restore "${name}"?`)) return;

    setBusyId(doc._id);
    try {
      await api.patch(`/documents/${doc._id}/restore`);
      addToast('Document restored successfully.', 'success');
      await fetchTrash();
      await fetchProjects();
    } catch (error) {
      addToast(error.response?.data?.message || 'Restore failed.', 'error');
    } finally {
      setBusyId(null);
    }
  };

  const handlePermanentDelete = async (doc) => {
    const name = doc.originalName || doc.name || 'this document';
    if (!window.confirm(
      `Permanently delete "${name}"? This cannot be undone.`
    )) return;

    setBusyId(doc._id);
    try {
      await api.delete(`/documents/${doc._id}/permanent`);
      addToast('Document permanently deleted.', 'success');
      await fetchTrash();
      await fetchProjects();
    } catch (error) {
      addToast(error.response?.data?.message || 'Permanent deletion failed.', 'error');
    } finally {
      setBusyId(null);
    }
  };

  if (!currentProject?._id) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <div className="rounded-2xl border border-[#E1E8E0] bg-white p-8 text-center dark:border-[#525C58] dark:bg-[#202B27]">
          <Trash2 className="mx-auto mb-3 h-9 w-9 text-[#648579]" />
          <h2 className="text-lg font-bold text-[#263B33] dark:text-[#E5EEE8]">Select a project</h2>
          <p className="mt-2 text-sm text-[#71847B] dark:text-[#B5C4BD]">
            Choose a project to view its deleted documents.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Trash2 className="h-6 w-6 text-[#39766A]" />
            <h1 className="text-2xl font-bold text-[#263B33] dark:text-[#E5EEE8]">Trash</h1>
          </div>
          <p className="mt-1 text-sm text-[#71847B] dark:text-[#B5C4BD]">
            Deleted documents for {currentProject.name || 'this project'}.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchTrash}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-[#DCE6DE] bg-white px-4 py-2 text-sm font-semibold text-[#42695B] hover:bg-[#F2F7F3] disabled:opacity-50 dark:border-[#525C58] dark:bg-[#293631] dark:text-[#C0D4CA]"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-[#E8D7A9] bg-[#FFF9E9] p-4 text-sm text-[#806326] dark:border-[#786A46] dark:bg-[#393428] dark:text-[#E8D39B]">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
        <p>Restore returns a document to the project. Permanent deletion cannot be undone.</p>
      </div>

      <div className="rounded-2xl border border-[#E1E8E0] bg-white p-5 dark:border-[#525C58] dark:bg-[#202B27]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-bold text-[#263B33] dark:text-[#E5EEE8]">Deleted documents</h2>
          <span className="rounded-full bg-[#EDF4EF] px-3 py-1 text-xs font-bold text-[#42695B] dark:bg-[#35453D] dark:text-[#C0D4CA]">
            {documents.length} items
          </span>
        </div>

        {loading ? (
          <p className="py-10 text-center text-sm text-[#71847B]">Loading Trash...</p>
        ) : documents.length === 0 ? (
          <div className="py-12 text-center">
            <Trash2 className="mx-auto mb-3 h-10 w-10 text-[#A5B5AA]" />
            <p className="font-semibold text-[#426052] dark:text-[#D0E0D5]">Trash is empty</p>
            <p className="mt-1 text-sm text-[#84948B]">Documents moved here will appear in this list.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#E8EEE9] dark:divide-[#46534C]">
            {documents.map((doc) => (
              <div key={doc._id} className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="rounded-xl bg-[#EDF4EF] p-3 dark:bg-[#35453D]">
                    <FileText className="h-5 w-5 text-[#548071]" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-[#2D4339] dark:text-[#E5EEE8]">
                      {doc.originalName || doc.name || 'Untitled document'}
                    </p>
                    <p className="mt-1 text-xs text-[#84948B]">
                      Deleted {doc.deletedAt ? new Date(doc.deletedAt).toLocaleString() : 'date unavailable'}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={busyId === doc._id}
                    onClick={() => handleRestore(doc)}
                    className="inline-flex items-center gap-2 rounded-lg border border-[#CFE2D5] px-3 py-2 text-xs font-bold text-[#39745D] hover:bg-[#EFF8F1] disabled:opacity-50 dark:border-[#526D5D] dark:text-[#B9E5C8]"
                  >
                    <RotateCcw className="h-4 w-4" /> Restore
                  </button>
                  <button
                    type="button"
                    disabled={busyId === doc._id}
                    onClick={() => handlePermanentDelete(doc)}
                    className="inline-flex items-center gap-2 rounded-lg border border-[#E8CFCB] px-3 py-2 text-xs font-bold text-[#A34E46] hover:bg-[#FFF3F1] disabled:opacity-50 dark:border-[#76514C] dark:text-[#E9AAA2]"
                  >
                    <Trash2 className="h-4 w-4" /> Delete permanently
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TrashPage;
