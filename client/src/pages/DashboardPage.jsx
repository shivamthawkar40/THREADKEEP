import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderGit2,
  FileText,
  Radar,
  GitCompare,
  CheckSquare,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Clock,
  Cpu,
  Plus,
  RefreshCw,
  Info,
  Upload,
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import api from '../services/api';
import { useProject } from '../context/ProjectContext';
import { useToast } from '../context/ToastContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import HealthScoreBadge from '../components/common/HealthScoreBadge';
import WorkflowGuide from '../components/common/WorkflowGuide';

const DashboardPage = () => {
  const { currentProject, loadSample, sampleLoading, projects } = useProject();
  const { addToast } = useToast();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/projects/metrics/overview');
      if (res.data?.success) {
        setMetrics(res.data);
      }
    } catch (err) {
      console.error('Failed to load metrics:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
  }, [currentProject, fetchMetrics]);

  const stats = metrics?.stats || {
    totalProjects: 0,
    totalDocuments: 0,
    openGaps: 0,
    unresolvedConflicts: 0,
    totalReviews: 0,
    averageHealthScore: 0,
  };

  // Completeness donut — from real project stats
  const confirmedPct  = currentProject?.stats?.confirmedFacts  || 0;
  const inferredPct   = currentProject?.stats?.inferredFacts   || 0;
  const unknownPct    = Math.max(0, 100 - confirmedPct - inferredPct);

  const completenessData = [
    { name: 'Confirmed',          value: confirmedPct  || (currentProject ? 0 : 65), color: '#737653' },
    { name: 'Inferred',           value: inferredPct   || (currentProject ? 0 : 25), color: '#C5BFA8' },
    { name: 'Unknown / Gaps',     value: unknownPct    || (currentProject ? 0 : 10), color: '#C97645' },
  ];

  // Determine completed workflow steps
  const completedSteps = [];
  if (stats.totalProjects > 0) completedSteps.push(1);
  if (stats.totalDocuments > 0) completedSteps.push(2);
  if (currentProject?.status === 'reconstructed') completedSteps.push(3);
  if (stats.openGaps > 0 || stats.unresolvedConflicts > 0) completedSteps.push(4);
  if (stats.totalReviews > 0) completedSteps.push(5);

  const isFirstTime = stats.totalProjects === 0 && !loading;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-sage/40 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-charcoal">Executive Dashboard</h1>
            <Badge variant="teal">Live Intelligence</Badge>
          </div>
          <p className="text-xs text-charcoal-light mt-1 max-w-xl">
            Continuous project knowledge tracking — reconstructed facts, blind spots, and conflict audit metrics in real time.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            onClick={fetchMetrics}
            loading={loading}
          >
            Refresh
          </Button>
          <Link to="/app/projects/create">
            <Button variant="primary" size="sm" icon={Plus}>New Project</Button>
          </Link>
        </div>
      </div>

      {/* ── First-Time / Empty State ───────────────────────────────────── */}
      {isFirstTime && (
        <div className="bg-white rounded-2xl border border-sage/40 shadow-card p-8 text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-teal/10 flex items-center justify-center mx-auto">
            <Sparkles className="w-8 h-8 text-teal" />
          </div>
          <div>
            <h2 className="text-xl font-black text-charcoal">Welcome to THREADKEEP</h2>
            <p className="text-sm text-charcoal-light mt-2 max-w-lg mx-auto leading-relaxed">
              THREADKEEP preserves your project's institutional knowledge when team members change.
              Upload project documents and our AI will reconstruct technical facts, detect knowledge gaps,
              find contradictions, and generate a verified handover dossier.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto text-left">
            {[
              { icon: Upload, label: 'Upload Documents', desc: 'PDF, DOCX, CSV, TXT files from your project' },
              { icon: Cpu, label: 'AI Analysis', desc: 'Reconstruct knowledge, gaps & conflicts' },
              { icon: FileText, label: 'Export Handover', desc: 'Generate executive PDF dossier' },
            ].map((step, i) => (
              <div key={i} className="p-3 rounded-xl bg-ivory border border-sage/30 flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-teal/10 flex items-center justify-center flex-shrink-0">
                  <step.icon className="w-4 h-4 text-teal" />
                </div>
                <div>
                  <div className="text-xs font-bold text-charcoal">{step.label}</div>
                  <div className="text-[11px] text-charcoal-light mt-0.5">{step.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
            <Button
              variant="primary"
              size="md"
              icon={Sparkles}
              loading={sampleLoading}
              onClick={loadSample}
            >
              Load FinPulse Sample Project (1-Click Demo)
            </Button>
            <Link to="/app/projects/create">
              <Button variant="outline" size="md" icon={Plus}>Create Custom Project</Button>
            </Link>
          </div>
          <p className="text-[11px] text-charcoal-light">
            The sample loads a realistic fintech banking project with documents, AI analysis, gaps, and conflicts pre-populated.
          </p>
        </div>
      )}

      {/* ── Workflow Guide ─────────────────────────────────────────────── */}
      {!isFirstTime && (
        <WorkflowGuide
          currentStep={completedSteps.length < 6 ? completedSteps.length + 1 : 6}
          completedSteps={completedSteps}
        />
      )}

      {/* ── KPI Stat Cards ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          {
            label: 'Projects',
            value: stats.totalProjects,
            icon: FolderGit2,
            sub: currentProject ? `Active: ${currentProject.key}` : 'None active',
            color: 'text-teal',
            link: '/app/projects',
          },
          {
            label: 'Documents',
            value: stats.totalDocuments,
            icon: FileText,
            sub: 'Ingested & parsed',
            color: 'text-teal',
            link: '/app/documents',
          },
          {
            label: 'Knowledge Gaps',
            value: stats.openGaps,
            icon: Radar,
            sub: stats.openGaps > 0 ? 'Requires attention' : 'All clear',
            color: stats.openGaps > 0 ? 'text-coral-dark' : 'text-teal',
            link: '/app/gaps',
          },
          {
            label: 'Conflicts',
            value: stats.unresolvedConflicts,
            icon: GitCompare,
            sub: 'Cross-doc mismatches',
            color: stats.unresolvedConflicts > 0 ? 'text-gold-dark' : 'text-teal',
            link: '/app/conflicts',
          },
          {
            label: 'Reviews',
            value: stats.totalReviews,
            icon: CheckSquare,
            sub: 'Human audited',
            color: 'text-teal',
            link: '/app/reviews',
          },
        ].map((stat) => (
          <Link key={stat.label} to={stat.link}>
            <Card className="p-4 space-y-1 hover:border-teal/30 hover:shadow-card transition-all group">
              <div className="flex items-center justify-between text-charcoal-light">
                <span className="text-[10px] font-bold uppercase tracking-wider">{stat.label}</span>
                <stat.icon className={`w-4 h-4 ${stat.color} group-hover:scale-110 transition-transform`} />
              </div>
              <div className={`text-2xl font-black ${stat.color}`}>
                {loading ? <span className="text-sage">—</span> : stat.value}
              </div>
              <div className="text-[11px] text-charcoal-light">{stat.sub}</div>
            </Card>
          </Link>
        ))}
      </div>

      {/* ── Main Grid ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Knowledge Health */}
        <Card className="p-6 space-y-5 lg:col-span-1 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-charcoal-light">Knowledge Health</span>
              <Badge variant="teal">Audit Score</Badge>
            </div>
            <HealthScoreBadge
              score={currentProject?.healthScore || stats.averageHealthScore || 0}
              size="lg"
              showDetails
            />
          </div>

          <div className="p-4 rounded-xl bg-ivory border border-sage/30 space-y-2 text-xs">
            <div className="font-bold text-charcoal uppercase tracking-wider text-[10px]">Score Formula</div>
            <div className="flex justify-between text-charcoal-light">
              <span>Confirmed Facts:</span>
              <span className="font-mono font-bold text-teal">{currentProject?.stats?.confirmedFacts || 0}%</span>
            </div>
            <div className="flex justify-between text-charcoal-light">
              <span>Open Gaps Penalty:</span>
              <span className="font-mono font-bold text-coral-dark">-{(stats.openGaps || 0) * 4}%</span>
            </div>
            <div className="flex justify-between text-charcoal-light">
              <span>Conflict Penalty:</span>
              <span className="font-mono font-bold text-gold-dark">-{(stats.unresolvedConflicts || 0) * 6}%</span>
            </div>
          </div>

          <Link to="/app/reconstruction">
            <Button variant="outline" size="sm" className="w-full" icon={ArrowRight} iconPosition="right">
              View Reconstruction
            </Button>
          </Link>
        </Card>

        {/* Distribution Chart */}
        <Card className="p-6 space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-ivory-dark pb-3">
            <div>
              <h3 className="text-sm font-bold text-charcoal">Knowledge Completeness</h3>
              <p className="text-[11px] text-charcoal-light mt-0.5">Ratio of confirmed vs inferred vs unknown statements</p>
            </div>
            <Badge variant="sage">
              {currentProject?.key || 'No Project'}
            </Badge>
          </div>

          {currentProject && (currentProject.stats?.confirmedFacts > 0 || currentProject.stats?.inferredFacts > 0) ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center h-52">
              {/* Donut */}
              <div className="h-full w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={completenessData.filter(d => d.value > 0)}
                      cx="50%" cy="50%"
                      innerRadius={52} outerRadius={78}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {completenessData.filter(d => d.value > 0).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value}%`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend */}
              <div className="space-y-3">
                {completenessData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="font-semibold text-charcoal">{item.name}</span>
                    </div>
                    <span className="font-mono font-bold text-charcoal">{item.value}%</span>
                  </div>
                ))}
                <div className="pt-2 border-t border-sage/20 text-[11px] text-charcoal-light">
                  Run AI Reconstruction to populate this chart with real citation-backed data.
                </div>
              </div>
            </div>
          ) : (
            <div className="h-52 flex flex-col items-center justify-center text-center space-y-3">
              <Cpu className="w-10 h-10 text-sage" />
              <div>
                <div className="text-sm font-bold text-charcoal">No reconstruction data yet</div>
                <p className="text-xs text-charcoal-light mt-1">
                  Upload documents and run AI Reconstruction to see your knowledge breakdown.
                </p>
              </div>
              <Link to="/app/reconstruction">
                <Button variant="primary" size="sm" icon={Cpu}>Run Reconstruction</Button>
              </Link>
            </div>
          )}
        </Card>
      </div>

      {/* ── Activity & Recent Projects ─────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Activity Timeline */}
        <Card className="p-6 space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-ivory-dark pb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-teal" />
              <h3 className="text-sm font-bold text-charcoal">Activity Timeline</h3>
            </div>
            <span className="text-[11px] text-charcoal-light font-mono">Live Stream</span>
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {metrics?.recentActivities?.length > 0 ? (
              metrics.recentActivities.map((act) => (
                <div key={act._id} className="flex items-start gap-3 p-3 rounded-xl bg-ivory border border-sage/20 hover:border-sage/40 transition-colors">
                  <div className="mt-1 flex-shrink-0">
                    <span className={`block w-2.5 h-2.5 rounded-full ${
                      act.severity === 'success' ? 'bg-teal' :
                      act.severity === 'warning' ? 'bg-gold-dark' :
                      act.severity === 'critical' ? 'bg-coral-dark' :
                      'bg-sage'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-charcoal truncate">{act.title}</span>
                      <span className="text-[10px] font-mono text-charcoal-light whitespace-nowrap flex-shrink-0">
                        {new Date(act.timestamp || act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    {act.details && (
                      <p className="text-[11px] text-charcoal-light mt-0.5 leading-snug">{act.details}</p>
                    )}
                    <div className="text-[10px] text-teal font-medium mt-1">
                      {act.userName || 'System Intelligence'}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 space-y-3">
                <TrendingUp className="w-8 h-8 text-sage mx-auto" />
                <div>
                  <div className="text-xs font-bold text-charcoal">No activity yet</div>
                  <p className="text-[11px] text-charcoal-light mt-1">
                    Load the sample project or upload documents to see activity here.
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Recent Projects + Quick Actions */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-ivory-dark pb-3">
            <h3 className="text-sm font-bold text-charcoal">Projects</h3>
            <Link to="/app/projects" className="text-xs font-bold text-teal hover:underline">
              View All →
            </Link>
          </div>

          <div className="space-y-2">
            {metrics?.recentProjects?.slice(0, 4).map((proj) => (
              <Link
                key={proj._id}
                to={`/app/projects/${proj._id}`}
                className={`block p-3 rounded-xl border transition-all hover:border-teal/30 ${
                  proj._id === currentProject?._id
                    ? 'border-teal/30 bg-teal/5'
                    : 'border-sage/30 bg-white hover:bg-ivory'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="min-w-0 mr-2">
                    <div className="text-xs font-bold text-charcoal truncate">{proj.name}</div>
                    <div className="text-[10px] text-charcoal-light">{proj.targetDomain || 'Enterprise'}</div>
                  </div>
                  <HealthScoreBadge score={proj.healthScore || 0} size="sm" />
                </div>
              </Link>
            ))}
            {(!metrics?.recentProjects || metrics.recentProjects.length === 0) && (
              <div className="text-center py-4 text-xs text-charcoal-light">
                No projects yet
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-sage/20 space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-charcoal-light">Quick Actions</div>
            <div className="grid grid-cols-2 gap-2">
              <Link to="/app/documents">
                <Button variant="outline" size="xs" className="w-full" icon={FileText}>
                  Upload Docs
                </Button>
              </Link>
              <Link to="/app/handover">
                <Button variant="secondary" size="xs" className="w-full" icon={FileText}>
                  Handover
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
