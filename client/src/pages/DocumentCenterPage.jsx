import React, { useState, useEffect, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  Trash2,
  Eye,
  FileCode,
  FileSpreadsheet,
  FileBox,
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

const DocumentCenterPage = () => {
  const { currentProject, fetchProjects } = useProject();
  const { addToast } = useToast();

  const fileInputRef = useRef(null);

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [viewerModalOpen, setViewerModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch project documents
  const fetchDocs = async () => {
    if (!currentProject) {
      setDocuments([]);
      return;
    }

    setLoading(true);

    try {
      const res = await api.get(
        `/documents/project/${currentProject._id}`
      );

      if (res.data?.success) {
        setDocuments(res.data.documents || []);
      }
    } catch (err) {
      console.error('Failed to fetch documents:', err);

      addToast(
        err.response?.data?.message || 'Failed to load documents.',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, [currentProject?._id]);

  // Drag and drop
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    setDragActive(false);

    if (e.dataTransfer.files?.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  // File input
  const handleFileInput = (e) => {
    if (e.target.files?.length > 0) {
      handleFiles(e.target.files);
    }
  };

  // Upload files
  const handleFiles = async (files) => {
    if (!currentProject) {
      addToast(
        'Please select or create an active project first.',
        'warning'
      );
      return;
    }

    const validFiles = [];
    const allowed = ['.pdf', '.docx', '.csv', '.txt', '.md'];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = '.' + file.name.split('.').pop().toLowerCase();

      if (!allowed.includes(ext)) {
        addToast(
          `Unsupported file: ${file.name}. Only PDF, DOCX, CSV, TXT and MD allowed.`,
          'error'
        );
        continue;
      }

      if (file.size === 0) {
        addToast(`File ${file.name} is empty.`, 'error');
        continue;
      }

      if (file.size > 25 * 1024 * 1024) {
        addToast(`File ${file.name} exceeds 25MB limit.`, 'error');
        continue;
      }

      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    if (validFiles.length > 15) {
      addToast(
        'Maximum 15 documents can be uploaded at once.',
        'warning'
      );
      return;
    }

    const formData = new FormData();

    validFiles.forEach((file) => {
      formData.append('files', file);
    });

    setUploading(true);

    try {
      const res = await api.post(
        `/documents/upload/${currentProject._id}`,
        formData
      );

      if (res.data?.success) {
        const uploadedDocuments = res.data.documents || [];

        const successCount = uploadedDocuments.filter(
          (doc) => doc.status === 'processed'
        ).length;

        const failedCount =
          uploadedDocuments.length - successCount;

        if (failedCount === 0) {
          addToast(
            `Successfully uploaded and processed ${successCount} documents!`,
            'success'
          );
        } else {
          addToast(
            `${successCount} documents processed, ${failedCount} failed.`,
            'warning'
          );
        }

        await fetchDocs();
        await fetchProjects();
      } else {
        addToast(
          res.data?.message || 'Document upload failed.',
          'error'
        );
      }
    } catch (err) {
      console.error('Document upload error:', err);

      addToast(
        err.response?.data?.message ||
          err.message ||
          'Error uploading documents.',
        'error'
      );
    } finally {
      setUploading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Delete document
  const handleDelete = async (docId, docName) => {
    if (!window.confirm(`Delete document "${docName}"?`)) {
      return;
    }

    try {
      await api.delete(`/documents/${docId}`);

      addToast(
        `Document "${docName}" removed.`,
        'success'
      );

      await fetchDocs();
      await fetchProjects();
    } catch (err) {
      addToast(
        err.response?.data?.message || 'Delete failed.',
        'error'
      );
    }
  };

  // Document icons
  const getDocIcon = (type) => {
    switch (type) {
      case 'pdf':
        return <FileBox className="w-5 h-5 text-coral-dark" />;

      case 'docx':
        return <FileText className="w-5 h-5 text-teal" />;

      case 'csv':
        return (
          <FileSpreadsheet className="w-5 h-5 text-gold-dark" />
        );

      default:
        return <FileCode className="w-5 h-5 text-sage-dark" />;
    }
  };

  const filteredDocs = documents.filter((doc) =>
    (doc.originalName || '')
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sage/30 pb-5">

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-charcoal">
              Document Center
            </h1>

            <Badge variant="teal">
              Ingestion & Extraction
            </Badge>
          </div>

          <p className="text-xs text-charcoal-light mt-1">
            Upload PDF, DOCX, CSV, or TXT project records.
            THREADKEEP extracts text and maps line citations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            onClick={fetchDocs}
            loading={loading}
          >
            Refresh
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={UploadCloud}
            onClick={() => fileInputRef.current?.click()}
            loading={uploading}
          >
            Upload Files
          </Button>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.docx,.csv,.txt,.md"
            onChange={handleFileInput}
            className="hidden"
          />
        </div>
      </div>

      {/* Drag and Drop Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
          dragActive
            ? 'border-teal bg-mint/50 scale-[1.01]'
            : 'border-sage/50 bg-white hover:bg-ivory/50'
        }`}
      >
        <div className="max-w-md mx-auto space-y-3">

          <div className="w-12 h-12 rounded-xl bg-mint text-teal flex items-center justify-center mx-auto shadow-soft">
            <UploadCloud className="w-6 h-6" />
          </div>

          <div>
            <h3 className="text-sm font-bold text-charcoal">
              Drag & Drop Project Documents Here
            </h3>

            <p className="text-xs text-charcoal-light mt-1">
              Supports{' '}
              <strong className="text-teal">
                PDF, Word (DOCX), CSV tables, and TXT
              </strong>{' '}
              notes up to 25MB each.
            </p>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            loading={uploading}
          >
            Browse Local Files
          </Button>
        </div>
      </div>

      {/* Documents List */}
      <Card className="p-6 space-y-4">

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-ivory-dark pb-4">

          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-charcoal">
              Project Records ({documents.length})
            </h3>

            <span className="text-[11px] font-mono text-charcoal-light">
              Workspace: {currentProject?.key || 'None'}
            </span>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-charcoal-light absolute left-3 top-2.5" />

            <input
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-sage/40 bg-ivory text-xs focus:outline-none focus:ring-1 focus:ring-teal"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-10 text-sm text-charcoal-light">
            Loading documents...
          </div>
        ) : filteredDocs.length > 0 ? (

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">

              <thead>
                <tr className="border-b border-sage/20 text-charcoal-light uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3">Document</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Word Count</th>
                  <th className="py-2.5 px-3">Pages / Sections</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-sage/10">
                {filteredDocs.map((doc) => (
                  <tr
                    key={doc._id}
                    className="hover:bg-ivory/80 transition-colors"
                  >

                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        {getDocIcon(doc.fileType)}

                        <div>
                          <div className="font-semibold text-charcoal">
                            {doc.originalName}
                          </div>

                          <div className="text-[10px] text-charcoal-light font-mono">
                            {((doc.size || 0) / 1024).toFixed(1)} KB
                            {' • '}
                            {doc.createdAt
                              ? new Date(doc.createdAt).toLocaleDateString()
                              : ''}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <span className="font-mono uppercase font-bold text-[10px] px-2 py-0.5 rounded bg-sage/20 text-charcoal">
                        {doc.fileType}
                      </span>
                    </td>

                    <td className="py-3 px-3 font-mono text-charcoal">
                      {doc.wordCount?.toLocaleString() || 0}
                    </td>

                    <td className="py-3 px-3 font-mono text-charcoal">
                      {doc.pageCount || 1} pgs (
                      {doc.sections?.length || 1} sec)
                    </td>

                    <td className="py-3 px-3">
                      <Badge
                        variant={
                          doc.status === 'processed'
                            ? 'teal'
                            : 'coral'
                        }
                      >
                        {doc.status}
                      </Badge>
                    </td>

                    <td className="py-3 px-3 text-right space-x-1">
                      <button
                        onClick={() => {
                          setSelectedDoc(doc);
                          setViewerModalOpen(true);
                        }}
                        className="p-1.5 rounded text-charcoal hover:text-teal hover:bg-mint"
                        title="Inspect Extracted Text"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() =>
                          handleDelete(doc._id, doc.originalName)
                        }
                        className="p-1.5 rounded text-charcoal-light hover:text-coral-dark hover:bg-rose-50"
                        title="Delete Document"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        ) : (
          <div className="text-center py-10 text-xs text-charcoal-light">
            No documents found. Drag & drop files above to start extraction.
          </div>
        )}
      </Card>

      {/* Document Viewer Modal */}
      <Modal
        isOpen={viewerModalOpen}
        onClose={() => setViewerModalOpen(false)}
        title={selectedDoc?.originalName || 'Document Content'}
        maxWidth="max-w-4xl"
      >
        {selectedDoc && (
          <div className="space-y-4">

            <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-lg bg-ivory border border-sage/20 text-xs">

              <div className="flex items-center gap-2">
                <Badge variant="teal">
                  {selectedDoc.fileType?.toUpperCase()}
                </Badge>

                <span className="font-mono text-charcoal font-semibold">
                  {selectedDoc.wordCount || 0} words
                </span>

                <span>•</span>

                <span className="font-mono text-charcoal font-semibold">
                  {selectedDoc.pageCount || 1} pages
                </span>
              </div>

              <div className="text-[11px] text-charcoal-light font-mono">
                Ingested:{' '}
                {selectedDoc.createdAt
                  ? new Date(selectedDoc.createdAt).toLocaleString()
                  : 'Unknown'}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-charcoal-light">
                Extracted Sections with Line References
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                {selectedDoc.sections?.length > 0 ? (
                  selectedDoc.sections.map((sec, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-lg border border-sage/20 bg-ivory/60 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs text-teal">
                          § {sec.title || `Section ${idx + 1}`}
                        </span>

                        <span className="font-mono text-[10px] text-charcoal-light bg-white px-2 py-0.5 rounded border border-sage/20">
                          Page {sec.page || 1} • Line{' '}
                          {sec.lineStart || 1}
                        </span>
                      </div>

                      <pre className="text-xs font-mono text-charcoal whitespace-pre-wrap leading-relaxed">
                        {sec.content}
                      </pre>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-charcoal-light">
                    No extracted sections available.
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-ivory-dark">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewerModalOpen(false)}
              >
                Close Viewer
              </Button>
            </div>

          </div>
        )}
      </Modal>
    </div>
  );
};

export default DocumentCenterPage;