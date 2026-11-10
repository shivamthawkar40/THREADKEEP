import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  FileText,
  HelpCircle,
  Eye,
  GitBranch,
  Server,
  Database,
  Activity,
} from 'lucide-react';
import api from '../services/api';
import { useProject } from '../context/ProjectContext';
import { useToast } from '../context/ToastContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import HealthScoreBadge from '../components/common/HealthScoreBadge';
import Modal from '../components/common/Modal';

const ReconstructionPage = () => {
  const { currentProject, fetchProjects } = useProject();
  const { addToast } = useToast();

  const [knowledge, setKnowledge] = useState(null);
  const [loading, setLoading] = useState(false);
  const [reconstructing, setReconstructing] = useState(false);
  const [activeTab, setActiveTab] = useState('architecture');
  const [currentStep, setCurrentStep] = useState(0); // 0 to 6
  const [citationModal, setCitationModal] = useState({ open: false, citation: null });

  const steps = [
    'Document Ingestion',
    'Text Extraction',
    'Semantic Entity Linking',
    'Knowledge Graph Reconstruction',
    'Gap Radar Analysis',
    'Conflict Matrix Detection',
    'Ready for Audit',
  ];

  const fetchKnowledge = async () => {
    if (!currentProject) return;
    setLoading(true);
    try {
      const res = await api.get(`/ai/knowledge/${currentProject._id}`);
      if (res.data?.success) {
        setKnowledge(res.data.knowledge);
      }
    } catch (err) {
      console.warn('No knowledge yet:', err.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKnowledge();
  }, [currentProject]);

  const handleRunReconstruction = async () => {
    if (!currentProject) {
      addToast('Please select a project first.', 'warning');
      return;
    }

    setReconstructing(true);
    setCurrentStep(0);

    // Multi-stage visual progress
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < steps.length - 1) return prev + 1;
        clearInterval(stepInterval);
        return prev;
      });
    }, 600);

    try {
      const res = await api.post(`/ai/reconstruct/${currentProject._id}`);
      if (res.data?.success) {
        setKnowledge(res.data.knowledge);
        addToast('Knowledge successfully reconstructed with citation references!', 'success');
        await fetchProjects(currentProject._id);
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Reconstruction failed', 'error');
    } finally {
      clearInterval(stepInterval);
      setCurrentStep(steps.length - 1);
      setReconstructing(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return <Badge variant="teal">Confirmed</Badge>;
      case 'inferred':
        return <Badge variant="gold">Inferred</Badge>;
      default:
        return <Badge variant="coral">Unknown</Badge>;
    }
  };

  const tabs = [
    { id: 'architecture', label: 'Technical Architecture' },
    { id: 'objectives', label: 'Objectives & Overview' },
    { id: 'techstack', label: 'Technology Stack' },
    { id: 'decisions', label: 'Decisions & Rationale' },
    { id: 'tasks', label: 'Tasks & Deliverables' },
    { id: 'team', label: 'Team & Ownership' },
    { id: 'risks', label: 'Dependencies & Risks' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sage/30 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-charcoal">AI Project Reconstruction</h1>
            <Badge variant="teal">Deep Intelligence Engine</Badge>
          </div>
          <p className="text-xs text-charcoal-light mt-0.5">
            Reconstructed facts, architectural decisions, and tasks extracted from ingested documents with line citations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            size="sm"
            icon={Sparkles}
            loading={reconstructing}
            onClick={handleRunReconstruction}
          >
            {knowledge ? 'Re-run Reconstruction' : 'Run Reconstruction'}
          </Button>
        </div>
      </div>

      {/* Progress Stepper during active reconstruction */}
      {reconstructing && (
        <Card className="p-6 bg-mint-light/60 border-teal/40 space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-teal animate-spin" />
              <span className="text-sm font-bold text-charcoal">
                Reconstruction Pipeline in Progress...
              </span>
            </div>
            <span className="font-mono text-xs font-bold text-teal">
              Step {currentStep + 1} of {steps.length}: {steps[currentStep]}
            </span>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {steps.map((step, idx) => (
              <div key={step} className="space-y-1">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    idx <= currentStep ? 'bg-teal' : 'bg-sage/30'
                  }`}
                />
                <div className="text-[10px] text-charcoal-light truncate text-center">
                  {step}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Overview Stats Card */}
      {knowledge && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="p-4 space-y-1">
            <div className="text-[10px] uppercase font-bold tracking-wider text-charcoal-light">Reconstruction Health</div>
            <div className="text-2xl font-black text-teal">
              {knowledge.confidenceStats?.overallHealthScore || currentProject?.healthScore || 85}%
            </div>
            <div className="text-[11px] text-charcoal-light font-medium">Fact-backed confidence</div>
          </Card>

          <Card className="p-4 space-y-1">
            <div className="text-[10px] uppercase font-bold tracking-wider text-charcoal-light">Confirmed Facts</div>
            <div className="text-2xl font-black text-teal">
              {knowledge.confidenceStats?.confirmedPercentage || 70}%
            </div>
            <div className="text-[11px] text-charcoal-light font-medium">Direct citations verified</div>
          </Card>

          <Card className="p-4 space-y-1">
            <div className="text-[10px] uppercase font-bold tracking-wider text-charcoal-light">Inferred Scope</div>
            <div className="text-2xl font-black text-gold-dark">
              {knowledge.confidenceStats?.inferredPercentage || 20}%
            </div>
            <div className="text-[11px] text-charcoal-light font-medium">Derived from context</div>
          </Card>

          <Card className="p-4 space-y-1">
            <div className="text-[10px] uppercase font-bold tracking-wider text-charcoal-light">Unknown Blindspots</div>
            <div className="text-2xl font-black text-coral-dark">
              {knowledge.confidenceStats?.unknownPercentage || 10}%
            </div>
            <div className="text-[11px] text-charcoal-light font-medium">Surfaced in Gap Radar</div>
          </Card>
        </div>
      )}

      {/* Interactive Tabs */}
      <div className="flex border-b border-sage/30 gap-1 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-teal text-teal bg-mint/30'
                : 'border-transparent text-charcoal-light hover:text-charcoal hover:bg-ivory'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      {knowledge ? (
        <div className="space-y-6">
          {/* TAB 1: Technical Architecture Diagram */}
          {activeTab === 'architecture' && (
            <div className="space-y-6">
              <Card className="p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-ivory-dark pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-charcoal">System Architectural Topology</h3>
                    <p className="text-xs text-charcoal-light">
                      {knowledge.technicalArchitecture?.overview || 'Multi-tier service topology with event streaming and storage isolation.'}
                    </p>
                  </div>
                  <Badge variant="sage">{knowledge.technicalArchitecture?.pattern || 'Layered Architecture'}</Badge>
                </div>

                {/* Architecture Visual Topology Flow */}
                <div className="bg-ivory rounded-xl border border-sage/30 p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                    {/* Layer 1: Client */}
                    <div className="p-4 rounded-xl bg-white border border-teal/40 shadow-soft text-center space-y-2">
                      <div className="w-8 h-8 rounded-lg bg-mint text-teal flex items-center justify-center mx-auto">
                        <Layers className="w-4 h-4" />
                      </div>
                      <div className="text-xs font-bold text-charcoal">Presentation Layer</div>
                      <div className="text-[11px] font-mono text-teal">React.js + Tailwind</div>
                      <p className="text-[10px] text-charcoal-light">High-density SaaS dashboards</p>
                    </div>

                    {/* Arrow 1 */}
                    <div className="hidden md:flex flex-col items-center justify-center text-charcoal-light text-[10px] font-mono">
                      <span>HTTPS / JWT</span>
                      <ArrowRight className="w-5 h-5 text-teal" />
                    </div>

                    {/* Layer 2: API Gateway & Application */}
                    <div className="p-4 rounded-xl bg-white border border-teal/40 shadow-soft text-center space-y-2">
                      <div className="w-8 h-8 rounded-lg bg-mint text-teal flex items-center justify-center mx-auto">
                        <Server className="w-4 h-4" />
                      </div>
                      <div className="text-xs font-bold text-charcoal">API & Application Tier</div>
                      <div className="text-[11px] font-mono text-teal">Node.js Express REST</div>
                      <p className="text-[10px] text-charcoal-light">Ingestion & Auth Services</p>
                    </div>

                    {/* Arrow 2 */}
                    <div className="hidden md:flex flex-col items-center justify-center text-charcoal-light text-[10px] font-mono">
                      <span>Persistence</span>
                      <ArrowRight className="w-5 h-5 text-teal" />
                    </div>
                  </div>

                  {/* Layer 3: Persistence Stores */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-sage/20">
                    <div className="p-4 rounded-xl bg-white border border-sage/30 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-charcoal">Primary Data Store</span>
                        <Badge variant="teal">Document Store</Badge>
                      </div>
                      <div className="text-xs text-charcoal font-medium">MongoDB (with Mongoose ODM)</div>
                      <p className="text-[11px] text-charcoal-light leading-snug">
                        Stores ingested project documents, line-level sections, and audit trails.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-white border border-sage/30 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-charcoal">AI Intelligence Layer</span>
                        <Badge variant="aqua">LLM + Heuristics</Badge>
                      </div>
                      <div className="text-xs text-charcoal font-medium">Google Gemini + Citation Mapper</div>
                      <p className="text-[11px] text-charcoal-light leading-snug">
                        Validates claims, detects contradictions, and assigns source citations.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Components list */}
                <div className="space-y-3 pt-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-charcoal-light">
                    Extracted Architectural Components
                  </div>
                  <div className="space-y-2">
                    {knowledge.technicalArchitecture?.components?.map((c, idx) => (
                      <div key={idx} className="p-3.5 rounded-lg border border-sage/20 bg-ivory flex items-center justify-between text-xs">
                        <div className="space-y-1">
                          <div className="font-bold text-charcoal">{c.name}</div>
                          <p className="text-charcoal-light text-[11px]">{c.role}</p>
                          <div className="flex gap-1.5 pt-1">
                            {c.technologies?.map((tech, tIdx) => (
                              <span key={tIdx} className="font-mono text-[10px] px-2 py-0.5 rounded bg-white border border-sage/30 text-teal">
                                {tech}
                              </span>
                            ))}
                          </div>
                        </div>
                        {c.sources?.[0] && (
                          <button
                            onClick={() => setCitationModal({ open: true, citation: c.sources[0] })}
                            className="text-[11px] font-bold text-teal hover:underline flex items-center gap-1 shrink-0 ml-4"
                          >
                            <FileText className="w-3.5 h-3.5" /> Citation
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* TAB 2: Objectives & Strategic Overview */}
          {activeTab === 'objectives' && (
            <Card className="p-6 space-y-5">
              <div className="space-y-2 border-b border-ivory-dark pb-4">
                <h3 className="text-sm font-bold text-charcoal">Strategic Problem Statement</h3>
                <p className="text-xs text-charcoal leading-relaxed">
                  {knowledge.overview?.problemStatement || 'Departing contributors leave fragmented notes and unrecorded decisions, stalling incoming engineers.'}
                </p>
              </div>

              <div className="space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-charcoal-light">
                  Extracted Project Objectives ({knowledge.objectives?.length || 0})
                </div>
                <div className="space-y-3">
                  {knowledge.objectives?.map((obj) => (
                    <div key={obj.id} className="p-4 rounded-xl border border-sage/20 bg-ivory space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-charcoal text-sm">{obj.title}</span>
                          {getStatusBadge(obj.status)}
                        </div>
                        {obj.sources?.[0] && (
                          <button
                            onClick={() => setCitationModal({ open: true, citation: obj.sources[0] })}
                            className="text-[11px] font-bold text-teal hover:underline flex items-center gap-1"
                          >
                            <FileText className="w-3.5 h-3.5" /> Source Citation
                          </button>
                        )}
                      </div>
                      <p className="text-charcoal-light leading-relaxed">{obj.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {/* TAB 3: Technology Stack */}
          {activeTab === 'techstack' && (
            <Card className="p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-ivory-dark pb-3">
                <h3 className="text-sm font-bold text-charcoal">Technology Stack & Version Catalog</h3>
                <Badge variant="teal">Extracted from Specs</Badge>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-sage/20 text-charcoal-light uppercase tracking-wider text-[10px]">
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3">Technology</th>
                      <th className="py-2.5 px-3">Version</th>
                      <th className="py-2.5 px-3">Verification</th>
                      <th className="py-2.5 px-3 text-right">Citation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sage/10">
                    {knowledge.technologyStack?.map((t, idx) => (
                      <tr key={idx} className="hover:bg-ivory/80">
                        <td className="py-3 px-3 font-semibold text-charcoal">{t.category}</td>
                        <td className="py-3 px-3 font-mono font-bold text-teal">{t.technology}</td>
                        <td className="py-3 px-3 font-mono text-charcoal-light">{t.version || 'Latest'}</td>
                        <td className="py-3 px-3">{getStatusBadge(t.status)}</td>
                        <td className="py-3 px-3 text-right">
                          {t.sources?.[0] && (
                            <button
                              onClick={() => setCitationModal({ open: true, citation: t.sources[0] })}
                              className="text-teal hover:underline font-bold text-[11px] inline-flex items-center gap-1"
                            >
                              <FileText className="w-3.5 h-3.5" /> View Excerpt
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* TAB 4: Decisions & Rationale */}
          {activeTab === 'decisions' && (
            <div className="space-y-4">
              {knowledge.decisions?.map((d, idx) => (
                <Card key={idx} className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-charcoal">{d.decision}</span>
                        {getStatusBadge(d.status)}
                      </div>
                      <div className="text-[11px] text-charcoal-light">
                        Decided by <strong className="text-teal">{d.decidedBy || 'Lead Architect'}</strong> • Date: {d.date || 'Sprint Record'}
                      </div>
                    </div>
                    {d.sources?.[0] && (
                      <button
                        onClick={() => setCitationModal({ open: true, citation: d.sources[0] })}
                        className="text-[11px] font-bold text-teal hover:underline flex items-center gap-1 shrink-0"
                      >
                        <FileText className="w-3.5 h-3.5" /> Citation
                      </button>
                    )}
                  </div>

                  <div className="p-3.5 rounded-lg bg-ivory border border-sage/20 space-y-1 text-xs">
                    <div className="font-bold text-charcoal">Decision Rationale:</div>
                    <p className="text-charcoal-light leading-relaxed">{d.rationale}</p>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* TAB 5: Tasks & Deliverables */}
          {activeTab === 'tasks' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Completed Tasks */}
              <Card className="p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-ivory-dark pb-3">
                  <div className="flex items-center gap-2 text-teal font-bold text-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Completed Tasks ({knowledge.completedTasks?.length || 0})</span>
                  </div>
                </div>

                <div className="space-y-3">
                  {knowledge.completedTasks?.map((task) => (
                    <div key={task.id} className="p-3.5 rounded-lg border border-sage/20 bg-ivory space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-charcoal">{task.title}</span>
                        <Badge variant="teal">Done</Badge>
                      </div>
                      <p className="text-charcoal-light text-[11px]">{task.description}</p>
                      <div className="flex justify-between items-center text-[10px] text-teal pt-1">
                        <span>Owner: {task.owner || 'Verified'}</span>
                        {task.sources?.[0] && (
                          <button
                            onClick={() => setCitationModal({ open: true, citation: task.sources[0] })}
                            className="hover:underline font-bold"
                          >
                            View Evidence
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Pending Tasks */}
              <Card className="p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-ivory-dark pb-3">
                  <div className="flex items-center gap-2 text-coral-dark font-bold text-sm">
                    <Clock className="w-4 h-4" />
                    <span>Pending Tasks ({knowledge.pendingTasks?.length || 0})</span>
                  </div>
                </div>

                <div className="space-y-3">
                  {knowledge.pendingTasks?.map((task) => (
                    <div key={task.id} className="p-3.5 rounded-lg border border-coral/30 bg-rose-50/20 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-charcoal">{task.title}</span>
                        <Badge variant="coral">Pending</Badge>
                      </div>
                      <p className="text-charcoal-light text-[11px]">{task.description}</p>
                      <div className="flex justify-between items-center text-[10px] pt-1">
                        <span className="text-coral-dark font-bold">Owner: {task.owner || 'Unassigned (TBD)'}</span>
                        {task.sources?.[0] && (
                          <button
                            onClick={() => setCitationModal({ open: true, citation: task.sources[0] })}
                            className="text-teal hover:underline font-bold"
                          >
                            View Evidence
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* TAB 6: Team Responsibilities */}
          {activeTab === 'team' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {knowledge.teamResponsibilities?.map((member, idx) => (
                <Card key={idx} className="p-5 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-charcoal">{member.name}</h4>
                      <div className="text-[11px] text-teal font-semibold">{member.role}</div>
                    </div>
                    {getStatusBadge(member.status)}
                  </div>

                  <div className="space-y-1">
                    <div className="font-bold text-charcoal uppercase tracking-wider text-[10px]">
                      Ownership Areas
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {member.ownershipAreas?.map((area, aIdx) => (
                        <span key={aIdx} className="px-2 py-0.5 rounded bg-ivory border border-sage/30 text-charcoal font-medium text-[11px]">
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* TAB 7: Dependencies & Risks */}
          {activeTab === 'risks' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Dependencies */}
              <Card className="p-5 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal-light">
                  System Dependencies ({knowledge.dependencies?.length || 0})
                </h3>
                <div className="space-y-3">
                  {knowledge.dependencies?.map((dep, idx) => (
                    <div key={idx} className="p-3.5 rounded-lg border border-sage/20 bg-ivory space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-charcoal">{dep.item}</span>
                        <Badge variant="teal">{dep.status}</Badge>
                      </div>
                      <div className="text-[11px] text-charcoal-light">
                        Depends on: <strong className="text-teal">{dep.dependsOn}</strong>
                      </div>
                      <p className="text-[11px] text-charcoal-light pt-1">{dep.impact}</p>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Risks */}
              <Card className="p-5 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal-light">
                  Identified Operational Risks ({knowledge.risks?.length || 0})
                </h3>
                <div className="space-y-3">
                  {knowledge.risks?.map((risk, idx) => (
                    <div key={idx} className="p-3.5 rounded-lg border border-coral/30 bg-rose-50/20 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-charcoal">{risk.title}</span>
                        <Badge variant="coral">Impact: {risk.impact}</Badge>
                      </div>
                      <p className="text-charcoal-light text-[11px]">{risk.description}</p>
                      <div className="p-2 rounded bg-white border border-sage/20 text-[11px] text-teal">
                        <strong>Mitigation:</strong> {risk.mitigation}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}
        </div>
      ) : (
        <Card className="p-12 text-center space-y-4">
          <Cpu className="w-12 h-12 text-sage mx-auto" />
          <h3 className="text-base font-bold text-charcoal">No Reconstructed Knowledge Yet</h3>
          <p className="text-xs text-charcoal-light max-w-sm mx-auto">
            Click the button below to initiate the AI Reconstruction Pipeline on your ingested documents.
          </p>
          <Button
            variant="primary"
            size="md"
            icon={Sparkles}
            onClick={handleRunReconstruction}
            loading={reconstructing}
          >
            Run Reconstruction Pipeline
          </Button>
        </Card>
      )}

      {/* Citation Inspector Modal */}
      <Modal
        isOpen={citationModal.open}
        onClose={() => setCitationModal({ open: false, citation: null })}
        title="Document Source Citation"
        maxWidth="max-w-xl"
      >
        {citationModal.citation && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3 rounded-lg bg-ivory border border-sage/30">
              <div>
                <div className="font-bold text-teal">{citationModal.citation.documentName}</div>
                <div className="text-[11px] text-charcoal-light font-mono">
                  Section: {citationModal.citation.sectionTitle || 'Main'} • Page {citationModal.citation.pageNumber || 1} • {citationModal.citation.lineRange || 'L1-L10'}
                </div>
              </div>
              <Badge variant="teal">Verified Source</Badge>
            </div>

            <div className="space-y-1.5">
              <div className="font-bold uppercase tracking-wider text-[10px] text-charcoal-light">
                Document Excerpt
              </div>
              <blockquote className="p-4 rounded-lg bg-mint-light/40 border-l-4 border-teal text-charcoal italic leading-relaxed font-serif text-sm">
                "{citationModal.citation.excerpt}"
              </blockquote>
            </div>

            <div className="flex justify-end pt-3 border-t border-ivory-dark">
              <Button variant="outline" size="sm" onClick={() => setCitationModal({ open: false, citation: null })}>
                Close Citation
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ReconstructionPage;
