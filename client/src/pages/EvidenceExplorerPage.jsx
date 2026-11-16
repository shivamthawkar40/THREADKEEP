
import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  AlertTriangle,
  BookOpen,
} from 'lucide-react';
import api from '../services/api';
import { useProject } from '../context/ProjectContext';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';

const EvidenceExplorerPage = () => {
  const { currentProject } = useProject();

  const [knowledge, setKnowledge] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedItemId, setSelectedItemId] = useState(null);

  useEffect(() => {
    let active = true;

    const loadEvidenceData = async () => {
      if (!currentProject?._id) {
        setKnowledge(null);
        setSelectedItemId(null);
        return;
      }

      setLoading(true);
      setError('');
      setKnowledge(null);
      setSelectedItemId(null);

      try {
        const response = await api.get(
          `/ai/knowledge/${currentProject._id}`
        );

        if (!active) return;

        if (response.data?.success) {
          setKnowledge(response.data.knowledge || null);
        } else {
          setKnowledge(null);
          setError('Knowledge data could not be loaded.');
        }
      } catch (err) {
        if (!active) return;

        console.error('Evidence Explorer error:', err);

        setError(
          err.response?.data?.message ||
          'Failed to load evidence data.'
        );
      } finally {
        if (active) setLoading(false);
      }
    };

    loadEvidenceData();

    return () => {
      active = false;
    };
  }, [currentProject?._id]);

  // Build findings using actual database fields.
  const allItems = useMemo(() => {
    if (!knowledge) return [];

    const items = [];

    knowledge.objectives?.forEach((item, index) => {
      items.push({
        id: `objective-${item._id || item.id || index}`,
        title: item.title || 'Untitled Objective',
        category: 'Objectives',
        status: item.status || 'unknown',
        description: item.description || '',
        confidenceScore: item.confidenceScore,
        citation: item.sources?.[0] || null,
      });
    });

    knowledge.technologyStack?.forEach((item, index) => {
      const technology = item.technology || item.name || '';

      items.push({
        id: `technology-${index}`,
        title: [
          item.category ? `${item.category}:` : '',
          technology,
          item.version ? `(${item.version})` : '',
        ].filter(Boolean).join(' '),

        category: 'Technology Stack',
        status: item.status || 'unknown',
        description: item.description || '',
        confidenceScore: item.confidenceScore,
        citation: item.sources?.[0] || null,
      });
    });

    knowledge.decisions?.forEach((item, index) => {
      items.push({
        id: `decision-${index}`,
        title: item.decision || 'Untitled Decision',
        category: 'Decisions',
        status: item.status || 'unknown',
        description: item.rationale || '',
        confidenceScore: item.confidenceScore,
        citation: item.sources?.[0] || null,
      });
    });

    knowledge.completedTasks?.forEach((item, index) => {
      items.push({
        id: `completed-task-${item._id || item.id || index}`,
        title: item.title || 'Untitled Task',
        category: 'Completed Tasks',
        status: item.status || 'unknown',
        description: item.description || '',
        confidenceScore: item.confidenceScore,
        citation: item.sources?.[0] || null,
      });
    });

    knowledge.pendingTasks?.forEach((item, index) => {
      items.push({
        id: `pending-task-${item._id || item.id || index}`,
        title: item.title || 'Untitled Task',
        category: 'Pending Tasks',
        status: item.status || 'unknown',
        description: item.description || '',
        confidenceScore: item.confidenceScore,
        citation: item.sources?.[0] || null,
      });
    });

    knowledge.risks?.forEach((item, index) => {
      items.push({
        id: `risk-${index}`,
        title: item.title || 'Untitled Risk',
        category: 'Risks',
        status: 'unknown',
        description: item.description || '',
        confidenceScore: undefined,
        citation: item.sources?.[0] || null,
      });
    });

    return items;
  }, [knowledge]);

  // Apply search and filters.
  const filteredItems = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return allItems.filter((item) => {
      const title = String(item.title || '').toLowerCase();
      const description = String(item.description || '').toLowerCase();
      const excerpt = String(
        item.citation?.excerpt || ''
      ).toLowerCase();

      const matchesSearch =
        !search ||
        title.includes(search) ||
        description.includes(search) ||
        excerpt.includes(search);

      const matchesStatus =
        statusFilter === 'all' ||
        item.status === statusFilter;

      const matchesCategory =
        categoryFilter === 'all' ||
        item.category === categoryFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesCategory
      );
    });
  }, [
    allItems,
    searchTerm,
    statusFilter,
    categoryFilter,
  ]);

  // Keep a valid selected finding.
  useEffect(() => {
    if (filteredItems.length === 0) {
      setSelectedItemId(null);
      return;
    }

    const selectionExists = filteredItems.some(
      (item) => item.id === selectedItemId
    );

    if (!selectionExists) {
      setSelectedItemId(filteredItems[0].id);
    }
  }, [filteredItems, selectedItemId]);

  const selectedItem = filteredItems.find(
    (item) => item.id === selectedItemId
  );

  const citation = selectedItem?.citation;

  const getStatusVariant = (status) => {
    if (status === 'confirmed') return 'aqua';
    return 'sage';
  };

  const formatConfidence = (score) => {
    if (
      score === undefined ||
      score === null ||
      score === ''
    ) {
      return 'Not calculated';
    }

    const value = Number(score);

    if (!Number.isFinite(value)) {
      return 'Not calculated';
    }

    return `${Math.max(0, Math.min(100, value))}%`;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#B7C5CC] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-[#181818]">
              Evidence Explorer
            </h1>

            <Badge variant="aqua">
              Verifiable Source Lineage
            </Badge>
          </div>

          <p className="text-xs text-[#737F85] mt-0.5">
            Audit extracted findings against original document
            sources and verified evidence.
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">

        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#737F85] absolute left-3 top-2.5" />

          <input
            type="text"
            placeholder="Search findings, keywords, or citations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-[#B7C5CC] bg-white text-xs focus:outline-none focus:ring-2 focus:ring-[#B8C8D7]/40 focus:border-[#737F85] transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-[#B7C5CC] bg-white text-xs font-semibold text-[#181818]"
          >
            <option value="all">All Categories</option>
            <option value="Objectives">Objectives</option>
            <option value="Technology Stack">Technology Stack</option>
            <option value="Decisions">Decisions</option>
            <option value="Completed Tasks">Completed Tasks</option>
            <option value="Pending Tasks">Pending Tasks</option>
            <option value="Risks">Risks</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-[#B7C5CC] bg-white text-xs font-semibold text-[#181818]"
          >
            <option value="all">All Statuses</option>
            <option value="confirmed">Confirmed</option>
            <option value="inferred">Inferred</option>
            <option value="unknown">Unknown</option>
          </select>

        </div>
      </div>

      {/* Error State */}
      {error && (
        <Card className="p-4 border border-red-200">
          <div className="flex items-center gap-2 text-sm text-red-600">
            <AlertTriangle className="w-4 h-4" />
            {error}
          </div>
        </Card>
      )}

      {/* Loading State */}
      {loading && (
        <Card className="p-8 text-center text-sm text-[#737F85]">
          Loading evidence data...
        </Card>
      )}

      {/* Main Explorer */}
      {!loading && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* Findings List */}
          <div className="lg:col-span-5 space-y-3 max-h-[75vh] overflow-y-auto pr-1">

            {filteredItems.length > 0 ? (
              filteredItems.map((item) => {
                const isSelected =
                  selectedItemId === item.id;

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedItemId(item.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-[#737F85] bg-[#B8C8D7]/40 shadow-soft ring-1 ring-[#B8C8D7]'
                        : 'border-[#B7C5CC] bg-white hover:bg-[#DEE5E8]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] mb-1.5">

                      <span className="font-bold text-[#525354]">
                        {item.category}
                      </span>

                      <Badge
                        variant={getStatusVariant(item.status)}
                        size="xs"
                      >
                        {item.status}
                      </Badge>

                    </div>

                    <h4 className="font-bold text-xs text-[#181818] line-clamp-2">
                      {item.title}
                    </h4>

                    <div className="text-[10px] text-[#737F85] mt-2 flex items-center justify-between font-mono">

                      <span className="truncate max-w-[180px]">
                        {item.citation?.documentName ||
                          'Citation unavailable'}
                      </span>

                      <span>
                        {item.citation?.pageNumber
                          ? `Pg ${item.citation.pageNumber}`
                          : 'Page N/A'}
                      </span>

                    </div>
                  </div>
                );
              })
            ) : (
              <Card className="p-8 text-center text-xs text-[#737F85]">
                {knowledge
                  ? 'No findings match your search or filter.'
                  : 'No reconstructed knowledge is available.'}
              </Card>
            )}

          </div>

          {/* Citation Inspector */}
          <div className="lg:col-span-7">

            {selectedItem ? (
              <Card className="p-6 space-y-5 sticky top-24">

                {/* Finding Details */}
                <div className="border-b border-[#B7C5CC] pb-4 space-y-2">

                  <div className="flex items-center justify-between">

                    <Badge variant="aqua">
                      {selectedItem.category}
                    </Badge>

                    <span className="font-mono text-xs font-semibold text-[#737F85] uppercase">
                      Status: {selectedItem.status}
                    </span>

                  </div>

                  <h3 className="font-bold text-lg text-[#181818]">
                    {selectedItem.title}
                  </h3>

                  {selectedItem.description && (
                    <p className="text-xs text-[#737F85] leading-relaxed">
                      {selectedItem.description}
                    </p>
                  )}

                </div>

                {/* Source Citation */}
                <div className="p-4 rounded-xl bg-[#DEE5E8] border border-[#B7C5CC] space-y-3">

                  <div className="flex items-center justify-between text-xs font-bold text-[#181818]">

                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-[#525354]" />
                      <span>Originating Source Document</span>
                    </div>

                    <span className="font-mono text-[11px] text-[#525354]">
                      {citation?.lineRange
                        ? `Line ${citation.lineRange}`
                        : 'Line N/A'}
                    </span>

                  </div>

                  {citation ? (
                    <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">

                      <div className="p-2 rounded bg-white border border-[#B7C5CC]">
                        <div className="text-[#737F85] text-[10px]">
                          Document
                        </div>

                        <div className="font-semibold text-[#181818] break-words">
                          {citation.documentName || 'Not available'}
                        </div>
                      </div>

                      <div className="p-2 rounded bg-white border border-[#B7C5CC]">
                        <div className="text-[#737F85] text-[10px]">
                          Page / Section
                        </div>

                        <div className="font-semibold text-[#181818] break-words">
                          {citation.pageNumber
                            ? `Page ${citation.pageNumber}`
                            : 'Page N/A'}

                          {citation.sectionTitle
                            ? ` Ã¢â‚¬Â¢ ${citation.sectionTitle}`
                            : ''}
                        </div>
                      </div>

                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-xs text-[#525354]">
                      <AlertTriangle className="w-4 h-4" />
                      No verified source citation is available.
                    </div>
                  )}

                </div>

                {/* Original Excerpt */}
                <div className="space-y-1.5">

                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#737F85]">
                    Original Document Excerpt
                  </div>

                  {citation?.excerpt ? (
                    <blockquote className="p-5 rounded-xl bg-[#B8C8D7]/40 border-l-4 border-[#737F85] text-[#181818] italic font-serif text-sm leading-relaxed break-words">
                      "{citation.excerpt}"
                    </blockquote>
                  ) : (
                    <div className="p-5 rounded-xl bg-[#DEE5E8] border border-[#B7C5CC] text-xs text-[#737F85]">
                      Original source excerpt is not available.
                    </div>
                  )}

                </div>

                {/* Actual Confidence */}
                <div className="pt-3 border-t border-[#B7C5CC] flex items-center justify-between text-xs text-[#737F85]">

                  <span>
                    Confidence: {formatConfidence(
                      selectedItem.confidenceScore
                    )}
                  </span>

                  <span className="font-semibold">
                    {citation
                      ? 'Source reference available'
                      : 'Evidence missing'}
                  </span>

                </div>

              </Card>
            ) : (
              <Card className="p-12 text-center text-xs text-[#737F85]">
                Select any finding on the left to inspect its source citations and original excerpts.
              </Card>
            )}

          </div>

        </div>
      )}

    </div>
  );
};

export default EvidenceExplorerPage;
