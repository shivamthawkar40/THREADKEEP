import React, { useCallback, useEffect, useState } from 'react';
import {
  Cpu,
  Sparkles,
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ShieldCheck,
  Layers,
  Target,
  Users,
  GitBranch,
  RefreshCw,
  CalendarDays,
  Info,
} from 'lucide-react';
import api from '../services/api';
import { useProject } from '../context/ProjectContext';
import { useToast } from '../context/ToastContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';

const STEPS = [
  'Document Ingestion',
  'Text Extraction',
  'Semantic Entity Linking',
  'Knowledge Reconstruction',
  'Gap Radar Analysis',
  'Conflict Detection',
  'Ready for Audit',
];

const TABS = [
  { id: 'architecture', label: 'Architecture', icon: Layers },
  { id: 'overview', label: 'Overview & Objectives', icon: Target },
  { id: 'techstack', label: 'Technology Stack', icon: Cpu },
  { id: 'decisions', label: 'Decisions', icon: ShieldCheck },
  { id: 'tasks', label: 'Tasks', icon: CheckCircle2 },
  { id: 'team', label: 'Team & Ownership', icon: Users },
  { id: 'risks', label: 'Dependencies & Risks', icon: AlertTriangle },
  { id: 'milestones', label: 'Milestones', icon: CalendarDays },
];

const asArray = (value) => (Array.isArray(value) ? value : []);
const valueOr = (value, fallback = 'Not available in verified sources') =>
  value === null || value === undefined || String(value).trim() === ''
    ? fallback
    : value;

const StatusBadge = ({ status }) => {
  const variant =
    status === 'confirmed' ? 'aqua' : status === 'inferred' ? 'sage' : 'sage';
  const label = status
    ? status.charAt(0).toUpperCase() + status.slice(1)
    : 'Unknown';
  return <Badge variant={variant}>{label}</Badge>;
};

const EmptyState = ({ title = 'No verified information yet', detail, compact = false }) => (
  <div className={`rounded-xl border border-dashed border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-center ${compact ? 'p-5' : 'p-8'}`}>
    <Info className="w-5 h-5 text-slate-500 dark:text-slate-400 mx-auto mb-2" />
    <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{title}</p>
    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-lg mx-auto">
      {detail || 'This section has no facts that passed evidence verification. Add relevant project documentation and run reconstruction again.'}
    </p>
  </div>
);

const SectionHeading = ({ title, count, children }) => (
  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-white/10 pb-3">
    <div className="flex items-center gap-2">
      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{title}</h3>
      {count !== undefined && <Badge variant="sage">{count}</Badge>}
    </div>
    {children}
  </div>
);

const ReconstructionPage = () => {
  const { currentProject, fetchProjects } = useProject();
  const { addToast } = useToast();

  const [knowledge, setKnowledge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reconstructing, setReconstructing] = useState(false);
  const [activeTab, setActiveTab] = useState('architecture');
  const [currentStep, setCurrentStep] = useState(0);
  const [partialAnalysis, setPartialAnalysis] = useState(false);
  const [citationModal, setCitationModal] = useState({ open: false, citation: null });

  const fetchKnowledge = useCallback(async (projectId) => {
    if (!projectId) {
      setKnowledge(null);
      setLoading(false);
      return null;
    }

    setLoading(true);
    try {
      const response = await api.get(`/ai/knowledge/${projectId}`);
      const nextKnowledge = response.data?.success
        ? response.data.knowledge ?? null
        : null;
      setKnowledge(nextKnowledge);
      return nextKnowledge;
    } catch (error) {
      setKnowledge(null);
      console.warn(
        'Knowledge fetch failed:',
        error.response?.data?.message || error.message
      );
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setKnowledge(null);
    setPartialAnalysis(false);
    fetchKnowledge(currentProject?._id);
  }, [currentProject?._id, fetchKnowledge]);

  const handleRunReconstruction = async () => {
    if (!currentProject?._id || reconstructing) {
      if (!currentProject?._id) addToast('Please select a project first.', 'warning');
      return;
    }

    const projectId = currentProject._id;
    setReconstructing(true);
    setCurrentStep(0);
    setPartialAnalysis(false);

    const stepInterval = window.setInterval(() => {
      setCurrentStep((previous) =>
        previous < STEPS.length - 1 ? previous + 1 : previous
      );
    }, 900);

    try {
      const response = await api.post(`/ai/reconstruct/${projectId}`);

      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Reconstruction could not be completed.');
      }

      if (response.data.partial) {
        setPartialAnalysis(true);
        addToast(
          'Partial analysis completed. Gemini was unavailable, so full knowledge reconstruction and gap detection were skipped.',
          'warning'
        );
      } else {
        addToast('Knowledge reconstruction completed. Verified facts are now available below.', 'success');
      }

      await fetchKnowledge(projectId);
      await fetchProjects(projectId);
    } catch (error) {
      addToast(
        error.response?.data?.message || error.message || 'Reconstruction failed.',
        'error'
      );
    } finally {
      window.clearInterval(stepInterval);
      setCurrentStep(STEPS.length - 1);
      setReconstructing(false);
    }
  };

  const openCitation = (citation) => {
    if (citation) setCitationModal({ open: true, citation });
  };

  const CitationButton = ({ citation, label = 'View source' }) => (
    citation ? (
      <button
        type="button"
        onClick={() => openCitation(citation)}
        className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-600 dark:text-slate-300 transition-colors hover:text-slate-900 dark:hover:text-white hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 rounded-sm"
      >
        <FileText className="w-3.5 h-3.5" />
        {label}
      </button>
    ) : null
  );

  const renderFactCard = (item, title, description, meta = null, key = title) => (
    <Card key={key} className="p-4 space-y-3 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 break-words">{valueOr(title, 'Untitled fact')}</h4>
          {meta && <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">{meta}</p>}
        </div>
        <StatusBadge status={item?.status} />
      </div>
      {description && (
        <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
          {description}
        </p>
      )}
      <div className="flex justify-end">
        <CitationButton citation={item?.sources?.[0]} />
      </div>
    </Card>
  );

  const stats = knowledge?.confidenceStats || {};
  const objectives = asArray(knowledge?.objectives);
  const technologyStack = asArray(knowledge?.technologyStack);
  const decisions = asArray(knowledge?.decisions);
  const completedTasks = asArray(knowledge?.completedTasks);
  const pendingTasks = asArray(knowledge?.pendingTasks);
  const team = asArray(knowledge?.teamResponsibilities);
  const dependencies = asArray(knowledge?.dependencies);
  const risks = asArray(knowledge?.risks);
  const milestones = asArray(knowledge?.milestones);
  const architecture = knowledge?.technicalArchitecture || {};
  const components = asArray(architecture.components);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-5">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">AI Project Reconstruction</h1>
            <Badge variant="aqua">Evidence-verified</Badge>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-2xl">
            Rebuild project knowledge from uploaded documents, with verified citations and transparent unknowns.
          </p>
          {currentProject?.name && (
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
              Active project: <strong className="text-slate-600 dark:text-slate-300">{currentProject.name}</strong>
            </p>
          )}
        </div>
        <Button
          variant="dark"
          size="sm"
          icon={reconstructing ? RefreshCw : Sparkles}
          loading={reconstructing}
          onClick={handleRunReconstruction}
          disabled={!currentProject?._id || reconstructing}
        >
          {knowledge ? 'Re-run Reconstruction' : 'Run Reconstruction'}
        </Button>
      </header>

      {reconstructing && (
        <Card className="p-5 space-y-4 animate-fade-in">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100">
              <Cpu className="w-5 h-5 animate-spin text-slate-600 dark:text-slate-300" />
              Reconstruction pipeline running
            </div>
            <span className="text-[11px] font-mono text-slate-600 dark:text-slate-300">
              Step {currentStep + 1}/{STEPS.length}: {STEPS[currentStep]}
            </span>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
            {STEPS.map((step, index) => (
              <div key={step} className="space-y-1">
                <div className={`h-1.5 rounded-full ${index <= currentStep ? 'bg-[#525354]' : 'bg-[#B7C5CC]'}`} />
                <p className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 truncate">{step}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {partialAnalysis && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-xs text-amber-900">
          <strong>Partial analysis:</strong> local evidence checks ran, but full Gemini reconstruction and knowledge-gap analysis were skipped. Previously saved knowledge, if any, remains visible below.
        </div>
      )}

      {loading ? (
        <Card className="p-10 text-center space-y-3">
          <RefreshCw className="w-7 h-7 animate-spin text-slate-500 dark:text-slate-400 mx-auto" />
          <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Loading reconstructed knowledge…</p>
          <p className="text-xs text-slate-600 dark:text-slate-300">Checking the latest saved reconstruction for this project.</p>
        </Card>
      ) : !currentProject ? (
        <EmptyState
          title="Select a project to continue"
          detail="Choose a project from the project selector to view or reconstruct its knowledge."
        />
      ) : !knowledge ? (
        <Card className="p-8 sm:p-12 text-center space-y-4">
          <Cpu className="w-10 h-10 text-slate-500 dark:text-slate-400 mx-auto" />
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">No reconstructed knowledge yet</h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 max-w-lg mx-auto">
            Upload and process project documents first, then run reconstruction. Only facts supported by verifiable document evidence will be displayed.
          </p>
          <div className="flex justify-center">
            <Button variant="primary" size="md" icon={Sparkles} onClick={handleRunReconstruction} loading={reconstructing}>
              Run Reconstruction Pipeline
            </Button>
          </div>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: 'Knowledge Health', value: stats.overallHealthScore, suffix: '%', note: 'Evidence-backed confidence' },
              { label: 'Confirmed Facts', value: stats.confirmedPercentage, suffix: '%', note: `${stats.confirmedCount ?? 0} verified facts` },
              { label: 'Inferred Facts', value: stats.inferredPercentage, suffix: '%', note: `${stats.inferredCount ?? 0} contextual facts` },
              { label: 'Unknown Facts', value: stats.unknownPercentage, suffix: '%', note: `${stats.unknownCount ?? 0} unverified facts` },
            ].map((stat) => (
              <Card key={stat.label} className="p-4 space-y-1">
                <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400">{stat.label}</p>
                <p className="text-2xl font-black text-slate-600 dark:text-slate-300">
                  {stat.value === undefined || stat.value === null ? '—' : `${stat.value}${stat.suffix}`}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">{stat.note}</p>
              </Card>
            ))}
          </div>

          <div role="tablist" aria-label="Reconstructed project information" className="flex gap-1 overflow-x-auto border-b border-slate-200 dark:border-white/10 pb-px scrollbar-thin">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center gap-2 whitespace-nowrap px-3 py-3 text-xs font-bold border-b-2 transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'border-[#525354] text-slate-900 dark:text-slate-100 bg-slate-100/70 dark:bg-white/5'
                      : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:bg-white/5'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="space-y-5 min-w-0">
            {activeTab === 'architecture' && (
              <Card className="p-5 sm:p-6 space-y-5">
                <SectionHeading title="Technical Architecture" count={components.length} />
                {architecture.overview || architecture.pattern ? (
                  <div className="rounded-xl bg-slate-100 dark:bg-[#242729] border border-slate-200 dark:border-white/10 p-4 space-y-2">
                    {architecture.pattern && <Badge variant="sage">{architecture.pattern}</Badge>}
                    <p className="text-sm text-slate-900 dark:text-slate-100 leading-relaxed">{architecture.overview}</p>
                    <CitationButton citation={architecture.sources?.[0]} />
                  </div>
                ) : (
                  <EmptyState compact title="Architecture summary not verified" />
                )}
                {components.length ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {components.map((component, index) => (
                      <Card key={component._id || component.name || index} className="p-4 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{valueOr(component.name, 'Unnamed component')}</h4>
                          <StatusBadge status={component.status} />
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300">{valueOr(component.role, 'Role not specified')}</p>
                        {asArray(component.technologies).length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {component.technologies.map((technology, i) => (
                              <span key={`${technology}-${i}`} className="rounded-md border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-[#242729] px-2 py-1 text-[10px] font-mono">{technology}</span>
                            ))}
                          </div>
                        )}
                        <CitationButton citation={component.sources?.[0]} />
                      </Card>
                    ))}
                  </div>
                ) : (
                  <EmptyState compact title="No verified architecture components" />
                )}
                {(asArray(architecture.diagramNodes).length > 0 || asArray(architecture.diagramEdges).length > 0) && (
                  <div className="space-y-3">
                    <SectionHeading title="Extracted Diagram Structure" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="rounded-lg border border-slate-200 dark:border-white/10 p-3">
                        <p className="text-xs font-bold mb-2">Nodes</p>
                        {asArray(architecture.diagramNodes).map((node, i) => (
                          <p key={i} className="text-xs text-slate-600 dark:text-slate-300 py-1">{typeof node === 'string' ? node : valueOr(node.label || node.name || node.id, 'Unnamed node')}</p>
                        ))}
                      </div>
                      <div className="rounded-lg border border-slate-200 dark:border-white/10 p-3">
                        <p className="text-xs font-bold mb-2">Connections</p>
                        {asArray(architecture.diagramEdges).map((edge, i) => (
                          <p key={i} className="text-xs text-slate-600 dark:text-slate-300 py-1">
                            {typeof edge === 'string' ? edge : `${valueOr(edge.from || edge.source, '?')} → ${valueOr(edge.to || edge.target, '?')}`}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            )}

            {activeTab === 'overview' && (
              <div className="space-y-4">
                <Card className="p-5 sm:p-6 space-y-4">
                  <SectionHeading title="Project Overview" />
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 mb-1">Summary</p>
                    <p className="text-sm text-slate-900 dark:text-slate-100 leading-relaxed">{valueOr(knowledge.overview?.summary)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 mb-1">Problem Statement</p>
                    <p className="text-sm text-slate-900 dark:text-slate-100 leading-relaxed">{valueOr(knowledge.overview?.problemStatement)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 mb-1">Target Audience</p>
                    <p className="text-sm text-slate-900 dark:text-slate-100 leading-relaxed">{valueOr(knowledge.overview?.targetAudience)}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={knowledge.overview?.status} />
                    <CitationButton citation={knowledge.overview?.sources?.[0]} />
                  </div>
                </Card>
                <Card className="p-5 sm:p-6 space-y-4">
                  <SectionHeading title="Project Objectives" count={objectives.length} />
                  {objectives.length ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {objectives.map((objective, index) => renderFactCard(
                        objective,
                        objective.title,
                        objective.description,
                        objective.category,
                        objective._id || index
                      ))}
                    </div>
                  ) : <EmptyState compact title="No verified objectives" />}
                </Card>
              </div>
            )}

            {activeTab === 'techstack' && (
              <Card className="p-5 sm:p-6 space-y-4">
                <SectionHeading title="Technology Stack" count={technologyStack.length} />
                {technologyStack.length ? (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[560px] text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-white/10 text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          <th className="p-3">Category</th>
                          <th className="p-3">Technology</th>
                          <th className="p-3">Version</th>
                          <th className="p-3">Status</th>
                          <th className="p-3 text-right">Evidence</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#B7C5CC]">
                        {technologyStack.map((item, index) => (
                          <tr key={item._id || item.technology || index} className="hover:bg-slate-100/60 dark:bg-white/5">
                            <td className="p-3">{valueOr(item.category, '—')}</td>
                            <td className="p-3 font-bold font-mono">{valueOr(item.technology, '—')}</td>
                            <td className="p-3">{valueOr(item.version, 'Not specified')}</td>
                            <td className="p-3"><StatusBadge status={item.status} /></td>
                            <td className="p-3 text-right"><CitationButton citation={item.sources?.[0]} label="View" /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : <EmptyState compact title="No verified technologies" />}
              </Card>
            )}

            {activeTab === 'decisions' && (
              <div className="space-y-3">
                {decisions.length ? decisions.map((decision, index) => renderFactCard(
                  decision,
                  decision.decision,
                  decision.rationale,
                  [decision.decidedBy, decision.date].filter(Boolean).join(' • '),
                  decision._id || index
                )) : <EmptyState title="No verified technical decisions" />}
              </div>
            )}

            {activeTab === 'tasks' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {[
                  { title: 'Completed Tasks', items: completedTasks, icon: CheckCircle2, empty: 'No completed tasks were verified.' },
                  { title: 'Pending Tasks', items: pendingTasks, icon: Clock, empty: 'No pending tasks were verified.' },
                ].map((group) => {
                  const Icon = group.icon;
                  return (
                    <Card key={group.title} className="p-5 space-y-4">
                      <SectionHeading title={group.title} count={group.items.length}>
                        <Icon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                      </SectionHeading>
                      {group.items.length ? (
                        <div className="space-y-3">
                          {group.items.map((task, index) => (
                            <div key={task._id || index} className="rounded-lg border border-slate-200 dark:border-white/10 bg-slate-100/60 dark:bg-white/5 p-3 space-y-2">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{valueOr(task.title, 'Untitled task')}</p>
                                <StatusBadge status={task.status} />
                              </div>
                              <p className="text-xs text-slate-600 dark:text-slate-300">{valueOr(task.description, '')}</p>
                              <div className="flex flex-wrap justify-between gap-2 text-[10px] text-slate-500 dark:text-slate-400">
                                <span>Owner: {valueOr(task.owner, 'Not specified')}</span>
                                <CitationButton citation={task.sources?.[0]} label="Evidence" />
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : <EmptyState compact detail={group.empty} />}
                    </Card>
                  );
                })}
              </div>
            )}

            {activeTab === 'team' && (
              <Card className="p-5 sm:p-6 space-y-4">
                <SectionHeading title="Team Responsibilities & Ownership" count={team.length} />
                {team.length ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {team.map((member, index) => (
                      <Card key={member._id || member.name || index} className="p-4 space-y-3 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{valueOr(member.name, 'Unnamed member')}</h4>
                            <p className="text-xs text-slate-600 dark:text-slate-300">{valueOr(member.role, 'Role not specified')}</p>
                          </div>
                          <StatusBadge status={member.status} />
                        </div>
                        {member.responsibilities && (
                          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{member.responsibilities}</p>
                        )}
                        <div>
                          <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Ownership Areas</p>
                          {asArray(member.ownershipAreas).length ? (
                            <div className="flex flex-wrap gap-1.5">
                              {member.ownershipAreas.map((area, i) => <Badge key={`${area}-${i}`} variant="sage">{area}</Badge>)}
                            </div>
                          ) : <p className="text-xs text-slate-500 dark:text-slate-400">Not specified</p>}
                        </div>
                        <CitationButton citation={member.sources?.[0]} />
                      </Card>
                    ))}
                  </div>
                ) : <EmptyState compact title="No verified team ownership information" />}
              </Card>
            )}

            {activeTab === 'risks' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card className="p-5 space-y-4">
                  <SectionHeading title="Dependencies" count={dependencies.length} />
                  {dependencies.length ? dependencies.map((dependency, index) => (
                    <div key={dependency._id || index} className="rounded-lg border border-slate-200 dark:border-white/10 p-3 space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-xs font-bold">{valueOr(dependency.item, 'Unnamed dependency')}</p>
                        <StatusBadge status={dependency.status} />
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300">Depends on: {valueOr(dependency.dependsOn)}</p>
                      {dependency.impact && <p className="text-xs text-slate-600 dark:text-slate-300">{dependency.impact}</p>}
                      <CitationButton citation={dependency.sources?.[0]} />
                    </div>
                  )) : <EmptyState compact title="No verified dependencies" />}
                </Card>
                <Card className="p-5 space-y-4">
                  <SectionHeading title="Operational Risks" count={risks.length} />
                  {risks.length ? risks.map((risk, index) => (
                    <div key={risk._id || index} className="rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-3 space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-xs font-bold">{valueOr(risk.title, 'Unnamed risk')}</p>
                        {risk.impact && <Badge variant="sage">Impact: {risk.impact}</Badge>}
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300">{valueOr(risk.description, '')}</p>
                      {risk.mitigation && <p className="text-xs text-slate-600 dark:text-slate-300"><strong>Mitigation:</strong> {risk.mitigation}</p>}
                      <CitationButton citation={risk.sources?.[0]} />
                    </div>
                  )) : <EmptyState compact title="No verified risks" />}
                </Card>
              </div>
            )}

            {activeTab === 'milestones' && (
              <Card className="p-5 sm:p-6 space-y-4">
                <SectionHeading title="Project Milestones" count={milestones.length} />
                {milestones.length ? (
                  <div className="space-y-3">
                    {milestones.map((milestone, index) => (
                      <div key={milestone._id || index} className="flex gap-3 rounded-lg border border-slate-200 dark:border-white/10 p-4">
                        <div className="mt-0.5 rounded-full bg-slate-100 dark:bg-[#242729] p-2 h-fit"><CalendarDays className="w-4 h-4 text-slate-600 dark:text-slate-300" /></div>
                        <div className="min-w-0 flex-1 space-y-2">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{valueOr(milestone.title, 'Untitled milestone')}</p>
                            <StatusBadge status={milestone.status} />
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-300">{valueOr(milestone.description, '')}</p>
                          {(milestone.dueDate || milestone.date) && <p className="text-[11px] text-slate-500 dark:text-slate-400">Date: {milestone.dueDate || milestone.date}</p>}
                          <CitationButton citation={milestone.sources?.[0]} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : <EmptyState compact title="No verified milestones" />}
              </Card>
            )}
          </div>
        </>
      )}

      <Modal
        isOpen={citationModal.open}
        onClose={() => setCitationModal({ open: false, citation: null })}
        title="Verified Document Citation"
        maxWidth="max-w-xl"
      >
        {citationModal.citation && (
          <div className="space-y-4 text-xs">
            <div className="rounded-lg border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-[#242729] p-3 space-y-1">
              <p className="font-bold text-slate-900 dark:text-slate-100">{citationModal.citation.documentName || 'Source document'}</p>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 font-mono">
                {citationModal.citation.sectionTitle || 'Main Body'} • Page {citationModal.citation.pageNumber || 1} • {citationModal.citation.lineRange || 'Line range unavailable'}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 mb-2">Verified excerpt</p>
              <blockquote className="rounded-lg border-l-4 border-[#737F85] bg-slate-100/60 dark:bg-white/5 p-4 text-sm italic leading-relaxed text-slate-900 dark:text-slate-100">
                “{citationModal.citation.excerpt || 'No excerpt available.'}”
              </blockquote>
            </div>
            <div className="flex justify-end border-t border-slate-200 dark:border-white/10 pt-3">
              <Button variant="outline" size="sm" onClick={() => setCitationModal({ open: false, citation: null })}>Close</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ReconstructionPage;


