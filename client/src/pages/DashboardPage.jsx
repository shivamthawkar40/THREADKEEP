import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  Upload,
  MessageCircle,
  ShieldCheck,
  Lightbulb,
  Workflow,
  CircleHelp,
  CheckCircle2,
  Circle,
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import api from '../services/api';
import { useProject } from '../context/ProjectContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import HealthScoreBadge from '../components/common/HealthScoreBadge';

const featureCards = [
  {
    title: 'AI Project Reconstruction',
    description: 'Turn uploaded project documents into structured knowledge, technical facts, decisions and architecture details.',
    why: 'Use this first to understand what your documents actually contain.',
    icon: Cpu,
    href: '/app/reconstruction',
    action: 'Open reconstruction',
    tone: 'bg-slate-100 dark:bg-[#2B2C2C] dark:bg-[#2B2C2C] text-slate-700 dark:text-[#B7C5CC] dark:text-[#B7C5CC]',
  },
  {
    title: 'Knowledge Gap Radar',
    description: 'Find missing details such as undocumented decisions, responsibilities, dependencies and project risks.',
    why: 'Use it to see what your team still needs to clarify.',
    icon: Radar,
    href: '/app/gaps',
    action: 'Review knowledge gaps',
    tone: 'bg-amber-50 text-amber-700',
  },
  {
    title: 'Conflict Detection',
    description: 'Compare claims across documents and identify information that disagrees, with source evidence.',
    why: 'Use it before handover so contradictions do not become assumptions.',
    icon: GitCompare,
    href: '/app/conflicts',
    action: 'Inspect conflicts',
    tone: 'bg-rose-50 text-rose-700',
  },
  {
    title: 'Automated Handover',
    description: 'Prepare a structured handover that helps another developer understand the project and continue the work.',
    why: 'Use it when onboarding someone or transferring project ownership.',
    icon: FileText,
    href: '/app/handover',
    action: 'Create handover',
    tone: 'bg-emerald-50 text-emerald-700',
  },
];

const numberFormatter = new Intl.NumberFormat();

const DashboardPage = () => {
  const { currentProject, loadSample, sampleLoading, projects = [] } = useProject();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [metricsError, setMetricsError] = useState('');

  const fetchMetrics = useCallback(async () => {
    setLoading(true);
    setMetricsError('');
    try {
      const res = await api.get('/projects/metrics/overview');
      if (res.data?.success) {
        setMetrics(res.data);
      } else {
        setMetricsError('We could not load the dashboard metrics. Please try again.');
      }
    } catch (err) {
      console.error('Failed to load metrics:', err);
      setMetricsError(
        err?.response?.data?.message ||
        'Dashboard data could not be loaded. Check your connection and try refreshing.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
  }, [currentProject?._id, fetchMetrics]);

  const stats = metrics?.stats || {
    totalProjects: 0,
    totalDocuments: 0,
    openGaps: 0,
    unresolvedConflicts: 0,
    totalReviews: 0,
    averageHealthScore: 0,
  };

  const projectId = currentProject?._id || currentProject?.id;
  const companionHref = projectId
    ? `/app/projects/${projectId}/companion`
    : '/app/projects';

  const hasReconstruction = currentProject?.status === 'reconstructed';
  const confirmedPct = Number(currentProject?.stats?.confirmedFacts ?? 0);
  const inferredPct = Number(currentProject?.stats?.inferredFacts ?? 0);
  const hasKnowledgeBreakdown =
    hasReconstruction ||
    currentProject?.stats?.confirmedFacts != null ||
    currentProject?.stats?.inferredFacts != null;

  const completenessData = useMemo(() => {
    const confirmed = Math.max(0, Math.min(100, confirmedPct));
    const inferred = Math.max(0, Math.min(100 - confirmed, inferredPct));
    const unknown = Math.max(0, 100 - confirmed - inferred);
    return [
      { name: 'Confirmed', value: confirmed, color: '#475569', description: 'Supported directly by source evidence.' },
      { name: 'Inferred', value: inferred, color: '#94A3B8', description: 'Suggested by the available information, but not explicitly confirmed.' },
      { name: 'Unknown / gaps', value: unknown, color: '#CBD5E1', description: 'Information that is missing or still needs clarification.' },
    ];
  }, [confirmedPct, inferredPct]);

  const workflowSteps = [
    {
      title: 'Create or select a project',
      detail: 'Choose the project whose knowledge you want to preserve.',
      done: Boolean(projectId),
      href: '/app/projects',
      action: projectId ? 'View projects' : 'Choose a project',
      icon: FolderGit2,
    },
    {
      title: 'Upload project documents',
      detail: 'Add specifications, notes, architecture files and other project records.',
      done: Number(stats.totalDocuments) > 0,
      href: '/app/documents',
      action: 'Open documents',
      icon: Upload,
    },
    {
      title: 'Run AI reconstruction',
      detail: 'Extract structured facts, decisions and technical knowledge from your sources.',
      done: hasReconstruction,
      href: '/app/reconstruction',
      action: hasReconstruction ? 'View reconstruction' : 'Run reconstruction',
      icon: Cpu,
    },
    {
      title: 'Review gaps and conflicts',
      detail: 'Check missing information and resolve contradictory source claims.',
      done: false,
      href: stats.unresolvedConflicts > 0 ? '/app/conflicts' : '/app/gaps',
      action: 'Review findings',
      icon: ShieldCheck,
      note: stats.openGaps || stats.unresolvedConflicts
        ? `${stats.openGaps} open gaps Â· ${stats.unresolvedConflicts} unresolved conflicts`
        : 'Check both areas after reconstruction',
    },
    {
      title: 'Chat or prepare a handover',
      detail: 'Ask the project companion questions or create a handover for the next person.',
      done: false,
      href: companionHref,
      action: projectId ? 'Open AI Companion' : 'Select a project first',
      icon: MessageCircle,
    },
  ];

  const statCards = [
    {
      label: 'Projects',
      value: stats.totalProjects,
      icon: FolderGit2,
      helper: 'Your project workspaces',
      href: '/app/projects',
      accent: 'text-slate-700 dark:text-[#B7C5CC] dark:text-[#B7C5CC]',
    },
    {
      label: 'Documents',
      value: stats.totalDocuments,
      icon: FileText,
      helper: 'Uploaded project sources',
      href: '/app/documents',
      accent: 'text-slate-700 dark:text-[#B7C5CC] dark:text-[#B7C5CC]',
    },
    {
      label: 'Knowledge gaps',
      value: stats.openGaps,
      icon: Radar,
      helper: 'Items needing clarification',
      href: '/app/gaps',
      accent: 'text-amber-700',
    },
    {
      label: 'Conflicts',
      value: stats.unresolvedConflicts,
      icon: GitCompare,
      helper: 'Contradictory source claims',
      href: '/app/conflicts',
      accent: 'text-rose-700',
    },
    {
      label: 'Reviews',
      value: stats.totalReviews,
      icon: CheckSquare,
      helper: 'Human review records',
      href: '/app/reviews',
      accent: 'text-emerald-700',
    },
  ];

  const isFirstTime = !loading && Number(stats.totalProjects) === 0 && projects.length === 0;
  const recentProjects = metrics?.recentProjects || [];
  const recentActivities = metrics?.recentActivities || [];

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-1 pb-8 sm:space-y-7">
      {/* Page header */}
      <header className="flex flex-col gap-4 border-b border-slate-200 dark:border-white/10 dark:border-white/10 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-[#DEE5E8] dark:text-[#DEE5E8] sm:text-3xl">
              Project Overview
            </h1>
            <Badge variant="aqua">ThreadKeep Intelligence</Badge>
          </div>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-[#B7C5CC] dark:text-[#B7C5CC]">
            Understand what your project knows, what is missing, and what your team should do next.
          </p>
          {currentProject && (
            <p className="mt-2 text-xs font-semibold text-slate-500 dark:text-[#95A1A6] dark:text-[#95A1A6]">
              Active project: <span className="text-slate-800 dark:text-[#DEE5E8] dark:text-[#DEE5E8]">{currentProject.name || currentProject.key || 'Selected project'}</span>
            </p>
          )}
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            onClick={fetchMetrics}
            loading={loading}
            className="w-full sm:w-auto"
          >
            Refresh data
          </Button>
          <Link to="/app/projects/create" className="w-full sm:w-auto">
            <Button variant="primary" size="sm" icon={Plus} className="w-full">
              New project
            </Button>
          </Link>
        </div>
      </header>

      {metricsError && (
        <div className="flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-2">
            <CircleHelp className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{metricsError}</span>
          </div>
          <Button variant="outline" size="xs" onClick={fetchMetrics} loading={loading}>
            Try again
          </Button>
        </div>
      )}

      {isFirstTime && (
        <section className="overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10 dark:border-white/10 bg-white dark:bg-[#242729] p-5 shadow-sm sm:p-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-[#2B2C2C] dark:bg-[#2B2C2C] text-slate-700 dark:text-[#B7C5CC] dark:text-[#B7C5CC]">
              <Sparkles className="h-7 w-7" />
            </div>
            <h2 className="mt-4 text-xl font-bold text-slate-900 dark:text-[#DEE5E8] dark:text-[#DEE5E8] sm:text-2xl">
              Welcome to ThreadKeep
            </h2>
            <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-[#B7C5CC] dark:text-[#B7C5CC]">
              ThreadKeep turns project documents into useful, reviewable knowledge. Start with a sample workspace to explore the workflow, or create your own project and upload its documents.
            </p>
            <div className="mt-6 grid gap-3 text-left sm:grid-cols-3">
              {[
                { icon: Upload, title: '1. Add sources', text: 'Upload project documents and notes.' },
                { icon: Cpu, title: '2. Reconstruct', text: 'Extract facts, decisions and unknowns.' },
                { icon: ShieldCheck, title: '3. Review & hand over', text: 'Check evidence, gaps and conflicts.' },
              ].map((item) => (
                <div key={item.title} className="rounded-xl border border-slate-200 dark:border-white/10 dark:border-white/10 bg-slate-50 dark:bg-[#2B2C2C] dark:bg-[#202324] p-4">
                  <item.icon className="h-5 w-5 text-slate-700 dark:text-[#B7C5CC] dark:text-[#B7C5CC]" />
                  <h3 className="mt-3 text-sm font-bold text-slate-900 dark:text-[#DEE5E8] dark:text-[#DEE5E8]">{item.title}</h3>
                  <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-[#B7C5CC] dark:text-[#B7C5CC]">{item.text}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <Button
                variant="primary"
                size="md"
                icon={Sparkles}
                loading={sampleLoading}
                onClick={loadSample}
                className="w-full sm:w-auto"
              >
                Load FinPulse demo
              </Button>
              <Link to="/app/projects/create" className="w-full sm:w-auto">
                <Button variant="outline" size="md" icon={Plus} className="w-full">
                  Create my project
                </Button>
              </Link>
            </div>
            <p className="mt-3 text-xs text-slate-500 dark:text-[#95A1A6] dark:text-[#95A1A6]">
              The demo is sample content. Use your own project for real project analysis.
            </p>
          </div>
        </section>
      )}

      {/* At-a-glance metrics */}
      <section aria-label="Project metrics">
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-[#DEE5E8] dark:text-[#DEE5E8]">At a glance</h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-[#95A1A6] dark:text-[#95A1A6]">Select a metric to open the related workspace.</p>
          </div>
          {loading && <span className="text-xs text-slate-500 dark:text-[#95A1A6] dark:text-[#95A1A6]">Updatingâ€¦</span>}
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {statCards.map((stat, index) => (
            <Link
              key={stat.label}
              to={stat.href}
              className="group min-w-0 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2"
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <Card className="h-full p-4 transition-all duration-200 hover:-translate-y-1 hover:border-slate-300 hover:shadow-md">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:text-[#95A1A6] dark:text-[#95A1A6] sm:text-xs">{stat.label}</span>
                  <stat.icon className={`h-4 w-4 shrink-0 ${stat.accent} transition-transform duration-200 group-hover:scale-110`} />
                </div>
                <div className={`mt-3 text-2xl font-black tabular-nums sm:text-3xl ${stat.accent}`}>
                  {loading && !metrics ? 'â€”' : numberFormatter.format(Number(stat.value) || 0)}
                </div>
                <p className="mt-1 text-[11px] leading-4 text-slate-500 dark:text-[#95A1A6] dark:text-[#95A1A6]">{stat.helper}</p>
                <div className="mt-3 flex items-center gap-1 text-[11px] font-semibold text-slate-700 dark:text-[#B7C5CC] dark:text-[#B7C5CC]">
                  Open <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Discover the product features */}
      <section>
        <div className="mb-3">
          <h2 className="text-base font-bold text-slate-900 dark:text-[#DEE5E8] dark:text-[#DEE5E8]">Explore ThreadKeep features</h2>
          <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-[#95A1A6] dark:text-[#95A1A6]">
            Each tool handles a different part of preserving and validating project knowledge.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {featureCards.map((feature, index) => (
            <Link
              key={feature.title}
              to={feature.href}
              className="group min-w-0 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2"
              style={{ animationDelay: `${index * 70}ms` }}
            >
              <Card className="flex h-full flex-col p-5 transition-all duration-200 hover:-translate-y-1 hover:border-slate-300 hover:shadow-md">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${feature.tone}`}>
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-sm font-bold text-slate-900 dark:text-[#DEE5E8] dark:text-[#DEE5E8]">{feature.title}</h3>
                <p className="mt-2 flex-1 text-xs leading-5 text-slate-600 dark:text-[#B7C5CC] dark:text-[#B7C5CC]">{feature.description}</p>
                <div className="mt-3 rounded-lg bg-slate-50 dark:bg-[#2B2C2C] dark:bg-[#202324] p-3">
                  <p className="text-[11px] leading-4 text-slate-500 dark:text-[#95A1A6] dark:text-[#95A1A6]">
                    <span className="font-bold text-slate-700 dark:text-[#B7C5CC] dark:text-[#B7C5CC]">Why use it? </span>{feature.why}
                  </p>
                </div>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-slate-800 dark:text-[#DEE5E8] dark:text-[#DEE5E8]">
                  {feature.action}
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </span>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* AI Companion - prominent entry point */}
      <section>
        <Link
          to={companionHref}
          className="group block rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#737F85] focus-visible:ring-offset-2"
        >
          <div className="relative overflow-hidden rounded-2xl border border-[#B7C5CC] dark:border-white/10 bg-gradient-to-r from-[#DEE5E8] via-white to-[#B8C8D7] dark:from-[#242729] dark:via-[#2B2C2C] dark:to-[#202324] p-5 transition-all duration-200 hover:border-[#737F85] hover:shadow-md sm:p-7">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#B8C8D7] text-[#181818] dark:bg-[#525354] dark:text-[#DEE5E8]">
                  <MessageCircle className="h-6 w-6" />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-[#DEE5E8] dark:text-[#DEE5E8]">AI Project Companion</h2>
                    <Badge variant="aqua">Ask your project</Badge>
                  </div>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-[#B7C5CC] dark:text-[#B7C5CC]">
                    Ask questions about your project and get answers grounded in its uploaded documents. Continue a conversation without searching through files manually.
                  </p>
                  <p className="mt-2 text-xs font-semibold text-[#525354] dark:text-[#B8C8D7]">
                    {projectId
                      ? `Ready for ${currentProject?.name || currentProject?.key || 'your selected project'}`
                      : 'Select or create a project to start chatting.'}
                  </p>
                </div>
              </div>
              <span className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[#181818] dark:bg-[#B8C8D7] px-4 py-3 text-sm font-bold text-white dark:text-[#181818] transition-colors group-hover:bg-[#525354] dark:group-hover:bg-[#DEE5E8]">
                {projectId ? 'Open AI Companion' : 'Choose a project'}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </div>
        </Link>
      </section>

      {/* Workflow guide */}
      <section className="rounded-2xl border border-slate-200 dark:border-white/10 dark:border-white/10 bg-white dark:bg-[#242729] p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-[#DEE5E8] dark:text-[#DEE5E8]">Your next steps</h2>
            <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-[#95A1A6] dark:text-[#95A1A6]">
              Follow this workflow to turn raw project files into usable team knowledge.
            </p>
          </div>
          <Badge variant="sage">5-step workflow</Badge>
        </div>
        <div className="grid gap-3 md:grid-cols-5">
          {workflowSteps.map((step, index) => (
            <div key={step.title} className="relative min-w-0 rounded-xl border border-slate-200 dark:border-white/10 dark:border-white/10 bg-slate-50 dark:bg-[#2B2C2C] dark:bg-[#202324] p-4 transition-colors hover:bg-white">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-[#95A1A6]">Step {index + 1}</span>
                {step.done
                  ? <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  : <Circle className="h-4 w-4 text-slate-300" />}
              </div>
              <step.icon className="mt-3 h-5 w-5 text-slate-700 dark:text-[#B7C5CC] dark:text-[#B7C5CC]" />
              <h3 className="mt-3 text-xs font-bold leading-5 text-slate-900 dark:text-[#DEE5E8] dark:text-[#DEE5E8]">{step.title}</h3>
              <p className="mt-1 text-[11px] leading-4 text-slate-500 dark:text-[#95A1A6] dark:text-[#95A1A6]">{step.detail}</p>
              {step.note && <p className="mt-2 text-[10px] font-semibold leading-4 text-slate-600 dark:text-[#B7C5CC] dark:text-[#B7C5CC]">{step.note}</p>}
              <Link
                to={step.href}
                className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-slate-800 dark:text-[#DEE5E8] dark:text-[#DEE5E8] hover:underline"
              >
                {step.action}<ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Health and knowledge distribution */}
      <section className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="flex flex-col justify-between space-y-5 p-5 sm:p-6 lg:col-span-1">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-bold text-slate-900 dark:text-[#DEE5E8] dark:text-[#DEE5E8]">Project health</h2>
              <Badge variant="aqua">Health score</Badge>
            </div>
            <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-[#95A1A6] dark:text-[#95A1A6]">
              A summary indicator of the selected project's documented knowledge and outstanding issues.
            </p>
            <div className="mt-4 flex justify-center">
              <HealthScoreBadge
                score={currentProject?.healthScore ?? stats.averageHealthScore ?? 0}
                size="lg"
                showDetails
              />
            </div>
          </div>
          <div className="space-y-3 rounded-xl border border-slate-200 dark:border-white/10 dark:border-white/10 bg-slate-50 dark:bg-[#2B2C2C] dark:bg-[#202324] p-4">
            <div className="flex items-center justify-between gap-3 text-xs">
              <span className="text-slate-600 dark:text-[#B7C5CC] dark:text-[#B7C5CC]">Confirmed facts</span>
              <span className="font-bold tabular-nums text-slate-900 dark:text-[#DEE5E8] dark:text-[#DEE5E8]">{confirmedPct}%</span>
            </div>
            <div className="flex items-center justify-between gap-3 text-xs">
              <span className="text-slate-600 dark:text-[#B7C5CC] dark:text-[#B7C5CC]">Open knowledge gaps</span>
              <Link to="/app/gaps" className="font-bold text-amber-700 hover:underline">{stats.openGaps}</Link>
            </div>
            <div className="flex items-center justify-between gap-3 text-xs">
              <span className="text-slate-600 dark:text-[#B7C5CC] dark:text-[#B7C5CC]">Unresolved conflicts</span>
              <Link to="/app/conflicts" className="font-bold text-rose-700 hover:underline">{stats.unresolvedConflicts}</Link>
            </div>
          </div>
          <Link to="/app/reconstruction">
            <Button variant="outline" size="sm" className="w-full" icon={ArrowRight} iconPosition="right">
              View reconstruction results
            </Button>
          </Link>
        </Card>

        <Card className="space-y-4 p-5 sm:p-6 lg:col-span-2">
          <div className="flex flex-col gap-1 border-b border-slate-200 dark:border-white/10 dark:border-white/10 pb-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-[#DEE5E8] dark:text-[#DEE5E8]">Knowledge completeness</h2>
              <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-[#95A1A6] dark:text-[#95A1A6]">
                What is confirmed, inferred, or still unknown in the selected project.
              </p>
            </div>
            <Badge variant="sage">{currentProject?.key || 'No project selected'}</Badge>
          </div>

          {!projectId || !hasKnowledgeBreakdown ? (
            <div className="flex min-h-56 flex-col items-center justify-center px-4 py-8 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 dark:bg-[#2B2C2C] dark:bg-[#2B2C2C] text-slate-600 dark:text-[#B7C5CC] dark:text-[#B7C5CC]">
                <Lightbulb className="h-6 w-6" />
              </div>
              <h3 className="mt-3 text-sm font-bold text-slate-900 dark:text-[#DEE5E8] dark:text-[#DEE5E8]">
                {projectId ? 'Reconstruction data is not available yet' : 'Select a project to see its knowledge'}
              </h3>
              <p className="mt-1 max-w-md text-xs leading-5 text-slate-500 dark:text-[#95A1A6] dark:text-[#95A1A6]">
                {projectId
                  ? 'Upload source documents and run AI Reconstruction. Once the analysis has saved its results, the knowledge breakdown will appear here.'
                  : 'Choose an existing project or create a new one, then upload documents and run reconstruction.'}
              </p>
              <Link to={projectId ? '/app/reconstruction' : '/app/projects'} className="mt-4">
                <Button variant="primary" size="sm" icon={projectId ? Cpu : FolderGit2}>
                  {projectId ? 'Open AI Reconstruction' : 'Choose a project'}
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid min-h-56 grid-cols-1 items-center gap-4 md:grid-cols-2">
              <div className="h-56 min-w-0 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={completenessData}
                      cx="50%"
                      cy="50%"
                      innerRadius={58}
                      outerRadius={88}
                      paddingAngle={2}
                      dataKey="value"
                      isAnimationActive
                    >
                      {completenessData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value}%`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-4">
                {completenessData.map((item) => (
                  <div key={item.name}>
                    <div className="flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2 font-semibold text-slate-800 dark:text-[#DEE5E8] dark:text-[#DEE5E8]">
                        <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
                        {item.name}
                      </div>
                      <span className="font-mono font-bold tabular-nums text-slate-900 dark:text-[#DEE5E8] dark:text-[#DEE5E8]">{item.value}%</span>
                    </div>
                    <p className="ml-5 mt-1 text-[11px] leading-4 text-slate-500 dark:text-[#95A1A6] dark:text-[#95A1A6]">{item.description}</p>
                  </div>
                ))}
                <p className="border-t border-slate-200 dark:border-white/10 dark:border-white/10 pt-3 text-[11px] leading-5 text-slate-500 dark:text-[#95A1A6] dark:text-[#95A1A6]">
                  These values use the selected project's saved reconstruction statistics. Unknown is the remaining share up to 100%.
                </p>
              </div>
            </div>
          )}
        </Card>
      </section>

      {/* Activity and projects */}
      <section className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="space-y-4 p-5 sm:p-6 lg:col-span-2">
          <div className="flex items-center justify-between gap-3 border-b border-slate-200 dark:border-white/10 dark:border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-slate-600 dark:text-[#B7C5CC] dark:text-[#B7C5CC]" />
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-[#DEE5E8] dark:text-[#DEE5E8]">Recent activity</h2>
                <p className="mt-1 text-xs text-slate-500 dark:text-[#95A1A6] dark:text-[#95A1A6]">Latest recorded project events.</p>
              </div>
            </div>
            <span className="text-[10px] font-medium text-slate-400 dark:text-[#95A1A6]">Activity feed</span>
          </div>
          <div className="max-h-80 space-y-3 overflow-y-auto pr-1">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity) => (
                <div key={activity._id || `${activity.title}-${activity.timestamp || activity.createdAt}`} className="flex min-w-0 items-start gap-3 rounded-xl border border-slate-100 dark:border-white/10 dark:border-white/10 bg-slate-50 dark:bg-[#2B2C2C] dark:bg-[#202324] p-3 transition-colors hover:bg-white">
                  <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${
                    activity.severity === 'success' ? 'bg-emerald-500' :
                    activity.severity === 'warning' ? 'bg-amber-500' :
                    activity.severity === 'critical' ? 'bg-rose-500' : 'bg-slate-400'
                  }`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <span className="truncate text-xs font-bold text-slate-900 dark:text-[#DEE5E8] dark:text-[#DEE5E8]">{activity.title}</span>
                      <time className="shrink-0 text-[10px] text-slate-400 dark:text-[#95A1A6]">
                        {activity.timestamp || activity.createdAt
                          ? new Date(activity.timestamp || activity.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
                          : 'Recent'}
                      </time>
                    </div>
                    {activity.details && <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-[#B7C5CC] dark:text-[#B7C5CC]">{activity.details}</p>}
                    <p className="mt-1 text-[10px] font-medium text-slate-500 dark:text-[#95A1A6] dark:text-[#95A1A6]">{activity.userName || 'ThreadKeep system'}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-9 text-center">
                <TrendingUp className="mx-auto h-8 w-8 text-slate-300" />
                <h3 className="mt-3 text-xs font-bold text-slate-800 dark:text-[#DEE5E8] dark:text-[#DEE5E8]">No activity recorded yet</h3>
                <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-slate-500 dark:text-[#95A1A6] dark:text-[#95A1A6]">
                  Upload documents or run a project analysis to start building an activity history.
                </p>
              </div>
            )}
          </div>
        </Card>

        <Card className="space-y-4 p-5 sm:p-6">
          <div className="flex items-center justify-between gap-2 border-b border-slate-200 dark:border-white/10 dark:border-white/10 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-[#DEE5E8] dark:text-[#DEE5E8]">Your projects</h2>
              <p className="mt-1 text-xs text-slate-500 dark:text-[#95A1A6] dark:text-[#95A1A6]">Recently accessed workspaces.</p>
            </div>
            <Link to="/app/projects" className="shrink-0 text-xs font-bold text-slate-700 dark:text-[#B7C5CC] dark:text-[#B7C5CC] hover:underline">
              View all
            </Link>
          </div>
          <div className="space-y-2">
            {recentProjects.slice(0, 4).map((project) => (
              <Link
                key={project._id}
                to={`/app/projects/${project._id}`}
                className={`block rounded-xl border p-3 transition-all hover:-translate-y-0.5 hover:shadow-sm ${
                  project._id === projectId
                    ? 'border-slate-300 bg-slate-100 dark:bg-[#2B2C2C]'
                    : 'border-slate-200 dark:border-white/10 dark:border-white/10 bg-white dark:bg-[#242729] hover:bg-slate-50 dark:bg-[#2B2C2C]'
                }`}
              >
                <div className="flex min-w-0 items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold text-slate-900 dark:text-[#DEE5E8] dark:text-[#DEE5E8]">{project.name}</p>
                    <p className="mt-1 truncate text-[10px] text-slate-500 dark:text-[#95A1A6] dark:text-[#95A1A6]">{project.targetDomain || 'Project workspace'}</p>
                  </div>
                  <HealthScoreBadge score={project.healthScore ?? 0} size="sm" />
                </div>
              </Link>
            ))}
            {recentProjects.length === 0 && (
              <div className="py-5 text-center text-xs text-slate-500 dark:text-[#95A1A6] dark:text-[#95A1A6]">
                No projects to show yet. <Link to="/app/projects/create" className="font-bold text-slate-800 dark:text-[#DEE5E8] dark:text-[#DEE5E8] underline">Create one</Link>.
              </div>
            )}
          </div>
          <div className="space-y-2 border-t border-slate-200 dark:border-white/10 dark:border-white/10 pt-3">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-[#95A1A6] dark:text-[#95A1A6]">Quick actions</h3>
            <div className="grid grid-cols-2 gap-2">
              <Link to="/app/documents" className="min-w-0">
                <Button variant="outline" size="xs" className="w-full" icon={Upload}>Upload docs</Button>
              </Link>
              <Link to="/app/handover" className="min-w-0">
                <Button variant="secondary" size="xs" className="w-full" icon={FileText}>Handover</Button>
              </Link>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
};

export default DashboardPage;


