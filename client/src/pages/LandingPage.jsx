import React from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Radar,
  GitCompare,
  FileCheck2,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Layers,
  Search,
} from 'lucide-react';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';

const LandingPage = () => {
  return (
    <div className="space-y-24 py-12">
      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-mint border border-sage/40 text-teal text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Next-Generation Project Knowledge Continuity • Team SPY_2.O</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold text-charcoal tracking-tight max-w-4xl mx-auto leading-tight">
          A Project’s Memory, <span className="text-teal underline decoration-aqua decoration-4">Reconnected.</span>
        </h1>

        <p className="text-lg md:text-xl text-charcoal-light max-w-2xl mx-auto font-normal leading-relaxed">
          When engineers or leaders leave, critical rationale and pending work vanish into fragmented notes.
          THREADKEEP reconstructs project knowledge, surfaces blind spots, resolves contradictions, and generates executive handovers.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link to="/register">
            <Button size="lg" variant="primary" icon={ArrowRight} iconPosition="right">
              Get Started Free
            </Button>
          </Link>
          <Link to="/login">
            <Button size="lg" variant="secondary" icon={Layers}>
              Explore Demo Workspace
            </Button>
          </Link>
        </div>

        {/* Tagline Banner */}
        <div className="pt-6 text-xs uppercase tracking-widest font-mono text-teal font-bold">
          "Keep the knowledge. Keep the work moving."
        </div>

        {/* Hero Visual Preview Card */}
        <div className="pt-8">
          <div className="bg-white rounded-2xl border border-sage/40 shadow-elevated p-6 text-left max-w-4xl mx-auto space-y-6">
            <div className="flex flex-wrap items-center justify-between border-b border-ivory-dark pb-4 gap-2">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-coral" />
                <div className="w-3 h-3 rounded-full bg-gold" />
                <div className="w-3 h-3 rounded-full bg-sage" />
                <span className="font-mono text-xs font-bold text-teal ml-2">THREADKEEP // RECONSTRUCTION_RADAR</span>
              </div>
              <Badge variant="teal">Sample: FinPulse Core Banking</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-ivory border border-sage/20 space-y-2">
                <div className="text-xs font-bold text-charcoal uppercase">Reconstruction Engine</div>
                <div className="text-2xl font-black text-teal">92%</div>
                <p className="text-xs text-charcoal-light">Extracted objectives, decisions, and tasks mapped directly to source files.</p>
              </div>

              <div className="p-4 rounded-xl bg-ivory border border-sage/20 space-y-2">
                <div className="text-xs font-bold text-charcoal uppercase">Gap Radar</div>
                <div className="text-2xl font-black text-coral-dark">4 Gaps</div>
                <p className="text-xs text-charcoal-light">Unassigned QA owner, missing Docker runbook, and undocumented rate limits.</p>
              </div>

              <div className="p-4 rounded-xl bg-ivory border border-sage/20 space-y-2">
                <div className="text-xs font-bold text-charcoal uppercase">Conflict Detection</div>
                <div className="text-2xl font-black text-gold-dark">2 Contradictions</div>
                <p className="text-xs text-charcoal-light">MongoDB vs PostgreSQL specification and AWS vs GCP hosting discrepancy.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem vs Solution Section */}
      <section id="vision" className="max-w-6xl mx-auto px-6 space-y-12">
        <div className="text-center space-y-3">
          <Badge variant="sage">Problem & Solution</Badge>
          <h2 className="text-3xl font-bold text-charcoal">Why Project Transitions Fail</h2>
          <p className="text-charcoal-light max-w-xl mx-auto text-sm">
            The next contributor spends weeks asking basic questions that should take minutes to answer.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Without ThreadKeep */}
          <Card className="border-coral/40 bg-coral/10 space-y-4 p-8">
            <div className="flex items-center gap-2 text-coral-dark font-bold text-base">
              <AlertTriangle className="w-5 h-5" />
              <span>Without THREADKEEP</span>
            </div>
            <ul className="space-y-3 text-sm text-charcoal-light">
              <li className="flex items-start gap-2.5">
                <span className="text-coral-dark font-bold">✕</span>
                <span>Crucial architecture decisions exist only in Slack threads or departed minds.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-coral-dark font-bold">✕</span>
                <span>Contradictory document versions cause engineers to build against outdated specs.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-coral-dark font-bold">✕</span>
                <span>Unassigned tasks and missing deployment keys silently stall milestone releases.</span>
              </li>
            </ul>
          </Card>

          {/* With ThreadKeep */}
          <Card className="border-teal/40 bg-mint-light/40 space-y-4 p-8">
            <div className="flex items-center gap-2 text-teal font-bold text-base">
              <CheckCircle2 className="w-5 h-5" />
              <span>With THREADKEEP</span>
            </div>
            <ul className="space-y-3 text-sm text-charcoal">
              <li className="flex items-start gap-2.5">
                <span className="text-teal font-bold">✓</span>
                <span>Reconstructs technical architecture, decisions, and tasks with exact page citations.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-teal font-bold">✓</span>
                <span>Highlights cross-document contradictions side-by-side without inventing facts.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-teal font-bold">✓</span>
                <span>Generates verified, human-reviewed handover dossiers exportable to executive PDF.</span>
              </li>
            </ul>
          </Card>
        </div>
      </section>

      {/* Core Intelligence Pillars */}
      <section id="features" className="max-w-6xl mx-auto px-6 space-y-12">
        <div className="text-center space-y-3">
          <Badge variant="teal">Intelligence Architecture</Badge>
          <h2 className="text-3xl font-bold text-charcoal">The 5 Core Handover Pillars</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card hover className="space-y-3">
            <div className="w-10 h-10 rounded-lg bg-mint text-teal flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-charcoal">AI Reconstruction</h3>
            <p className="text-xs text-charcoal-light leading-relaxed">
              Ingests PDF, DOCX, CSV, and TXT files to extract objectives, tech stack, and decisions with exact citations.
            </p>
          </Card>

          <Card hover className="space-y-3">
            <div className="w-10 h-10 rounded-lg bg-coral/20 text-coral-dark flex items-center justify-center">
              <Radar className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-charcoal">Knowledge Gap Radar</h3>
            <p className="text-xs text-charcoal-light leading-relaxed">
              Detects unassigned owners, missing runbooks, incomplete tests, and unanswered architectural questions.
            </p>
          </Card>

          <Card hover className="space-y-3">
            <div className="w-10 h-10 rounded-lg bg-gold/20 text-gold-dark flex items-center justify-center">
              <GitCompare className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-charcoal">Conflict Detection</h3>
            <p className="text-xs text-charcoal-light leading-relaxed">
              Compares statements across versions to catch database, cloud hosting, and status contradictions.
            </p>
          </Card>

          <Card hover className="space-y-3">
            <div className="w-10 h-10 rounded-lg bg-sage/20 text-charcoal flex items-center justify-center">
              <Search className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-charcoal">Evidence Explorer</h3>
            <p className="text-xs text-charcoal-light leading-relaxed">
              Verify any finding by inspecting original documents, line numbers, and highlighted text excerpts.
            </p>
          </Card>

          <Card hover className="space-y-3">
            <div className="w-10 h-10 rounded-lg bg-aqua/30 text-teal-deep flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-charcoal">Human Review Center</h3>
            <p className="text-xs text-charcoal-light leading-relaxed">
              Engineering leads approve, reject, or edit findings to ensure unreviewed AI notes are never marked as fact.
            </p>
          </Card>

          <Card hover className="space-y-3">
            <div className="w-10 h-10 rounded-lg bg-mint text-teal flex items-center justify-center">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-charcoal">Handover PDF Export</h3>
            <p className="text-xs text-charcoal-light leading-relaxed">
              Generates executive project dossiers with verified findings, open gaps, and signature sign-offs.
            </p>
          </Card>
        </div>
      </section>

      {/* CTA Box */}
      <section className="max-w-4xl mx-auto px-6">
        <div className="bg-teal rounded-2xl p-10 text-center text-ivory space-y-6 shadow-elevated">
          <h2 className="text-3xl font-extrabold tracking-tight">Ready to Protect Your Team's Project Knowledge?</h2>
          <p className="text-sm text-mint-light max-w-xl mx-auto">
            Experience the full production MVP with live document parsing, conflict detection, and PDF generation.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/register">
              <Button size="lg" variant="aqua" className="font-bold text-teal-deep" icon={ArrowRight} iconPosition="right">
                Create Account & Try Sample
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="secondary" className="bg-white/10 text-ivory hover:bg-white/20 border-white/20">
                Sign In to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
