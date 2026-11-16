import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  BrainCircuit,
  Radar,
  GitCompare,
  FileCheck2,
  MessageCircle,
  Mic,
  ShieldCheck,
  FileText,
  Upload,
  Users,
  Check,
  X,
  Sparkles,
  Search,
  Clock,
  Layers,
  Activity,
} from 'lucide-react';

const LandingPage = () => {
  const features = [
    {
      number: '01',
      icon: BrainCircuit,
      title: 'Knowledge Reconstruction',
      description:
        'Turn scattered project documents into structured knowledge. Surface important decisions, technical context, responsibilities and pending work.',
      tag: 'UNDERSTAND THE PAST',
    },
    {
      number: '02',
      icon: Radar,
      title: 'Gap & Risk Detection',
      description:
        'Spot missing owners, unanswered questions and undocumented processes before they become problems for the next team member.',
      tag: 'FIND WHAT IS MISSING',
    },
    {
      number: '03',
      icon: GitCompare,
      title: 'Conflict Intelligence',
      description:
        'Compare project information across sources and highlight contradictions so teams can review what is accurate.',
      tag: 'RESOLVE CONTRADICTIONS',
    },
    {
      number: '04',
      icon: FileCheck2,
      title: 'Structured Handover',
      description:
        'Bring decisions, progress, open tasks and supporting evidence together in one organised handover report.',
      tag: 'MOVE WORK FORWARD',
    },
  ];

  const workflow = [
    {
      number: '01',
      icon: Upload,
      title: 'Bring knowledge together',
      description: 'Add project documents and available records to create a shared knowledge base.',
    },
    {
      number: '02',
      icon: BrainCircuit,
      title: 'Reconstruct the context',
      description: 'Extract key information and organise decisions, tasks, dependencies and risks.',
    },
    {
      number: '03',
      icon: ShieldCheck,
      title: 'Review with evidence',
      description: 'Inspect supporting sources, resolve conflicts and validate important findings.',
    },
    {
      number: '04',
      icon: FileCheck2,
      title: 'Hand over with clarity',
      description: 'Create a structured picture of the project for the people taking it forward.',
    },
  ];

  useEffect(() => {
    const sections = document.querySelectorAll("section:not(:first-child)");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("tk-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -45px 0px",
      }
    );

    sections.forEach((section) => {
      section.classList.add("tk-scroll-reveal");
      observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);
  return (
    <div className="overflow-hidden bg-[#DEE5E8] text-[#181818]">

      {/* HERO â€” DARK EDITORIAL EXPERIENCE */}
      <section className="relative isolate overflow-hidden bg-[#181818] text-[#DEE5E8] px-5 md:px-8 pt-16 md:pt-24 pb-16 md:pb-20">
        <div className="absolute inset-0 pointer-events-none opacity-30"
          style={{ backgroundImage: 'linear-gradient(rgba(184,200,215,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(184,200,215,0.07) 1px, transparent 1px)', backgroundSize: '72px 72px' }} />
        <div className="absolute -top-40 right-[-10%] w-[600px] h-[600px] rounded-full bg-[#526574]/25 blur-[130px] pointer-events-none tk-glow" />
        <div className="absolute bottom-[-220px] left-[-150px] w-[450px] h-[450px] rounded-full bg-[#B8C8D7]/10 blur-[120px] pointer-events-none" />
        <div className="tk-hero-particles absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          <span className="tk-particle tk-particle-one" />
          <span className="tk-particle tk-particle-two" />
          <span className="tk-particle tk-particle-three" />
          <span className="tk-particle tk-particle-four" />
          <span className="tk-particle tk-particle-five" />
          <span className="tk-particle tk-particle-six" />
        </div>

        <div className="max-w-[1440px] mx-auto relative">
          <div className="grid lg:grid-cols-[0.92fr_1.08fr] gap-14 xl:gap-20 items-center">

            {/* EDITORIAL COPY */}
            <div className="relative z-10 tk-reveal">
              <div className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/[0.045] px-4 py-2.5 mb-10">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-[#B8C8D7] opacity-50 animate-ping" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#B8C8D7]" />
                </span>
                <span className="text-[9px] md:text-[10px] font-bold tracking-[0.19em] uppercase text-[#B7C5CC]">
                  PROJECT KNOWLEDGE CONTINUITY
                </span>
                <span className="text-white/25">/</span>
                <span className="text-[9px] font-semibold tracking-wider text-white/50">SPY_2.O</span>
              </div>

              <p className="text-[10px] md:text-xs font-bold tracking-[0.3em] uppercase text-[#95A1A6] mb-7">
                THE MEMORY BEHIND EVERY PROJECT
              </p>

              <h1 className="tk-hero-title text-[clamp(3.8rem,8.4vw,8.3rem)] leading-[0.83] font-semibold tracking-[-0.085em]">
                <span className="tk-word" style={{ "--word-delay": "0ms" }}>People</span>
                <br />
                <span className="tk-word text-[#DEE5E8]" style={{ "--word-delay": "180ms" }}>move.</span>
                <br />
                <span className="tk-word text-[#737F85]" style={{ "--word-delay": "360ms" }}>Knowledge</span>
                <br />
                <span className="tk-word italic font-medium text-[#B8C8D7]" style={{ "--word-delay": "540ms" }}>stays.</span>
              </h1>

              <div className="mt-9 flex items-start gap-4 max-w-xl">
                <div className="w-[2px] self-stretch bg-[#B8C8D7]/70 shrink-0" />
                <p className="text-base md:text-lg leading-relaxed text-[#B7C5CC]">
                  Critical decisions shouldn't disappear when people leave.
                  ThreadKeep helps teams reconstruct project knowledge,
                  uncover missing context and make every handover clearer.
                </p>
              </div>

              <div className="mt-9 flex flex-wrap items-center gap-4">
                <Link
                  to="/register"
                  className="group tk-magnetic inline-flex items-center gap-5 rounded-full bg-[#DEE5E8] text-[#181818] px-7 py-4 text-sm font-bold hover:bg-[#B8C8D7] transition-all duration-300 hover:-translate-y-1"
                  onMouseMove={(event) => {
                    const rect = event.currentTarget.getBoundingClientRect();
                    const x = event.clientX - rect.left - rect.width / 2;
                    const y = event.clientY - rect.top - rect.height / 2;
                    event.currentTarget.style.transform = `translate(${x * 0.12}px, ${y * 0.18}px)`;
                  }}
                  onMouseLeave={(event) => {
                    event.currentTarget.style.transform = "";
                  }}
                >
                  Explore ThreadKeep
                  <span className="w-7 h-7 rounded-full bg-[#181818] text-white flex items-center justify-center group-hover:rotate-45 transition-transform">
                    <ArrowUpRight className="w-4 h-4" />
                  </span>
                </Link>

                <Link
                  to="/login"
                  className="group inline-flex items-center gap-2 text-sm font-semibold text-[#B7C5CC] hover:text-white transition-colors"
                >
                  Open workspace
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              <div className="mt-14 pt-7 border-t border-white/15 grid grid-cols-3 gap-4 max-w-lg">
                <div>
                  <p className="text-2xl md:text-3xl font-semibold tracking-tight">01</p>
                  <p className="text-[9px] md:text-[10px] uppercase tracking-[0.15em] text-[#95A1A6] mt-2">Reconstruct</p>
                </div>
                <div>
                  <p className="text-2xl md:text-3xl font-semibold tracking-tight">02</p>
                  <p className="text-[9px] md:text-[10px] uppercase tracking-[0.15em] text-[#95A1A6] mt-2">Verify</p>
                </div>
                <div>
                  <p className="text-2xl md:text-3xl font-semibold tracking-tight">03</p>
                  <p className="text-[9px] md:text-[10px] uppercase tracking-[0.15em] text-[#95A1A6] mt-2">Handover</p>
                </div>
              </div>
            </div>

            {/* LAYERED PRODUCT EXPERIENCE */}
            <div
              id="product"
              className="relative min-w-0 tk-reveal tk-delay-2 tk-tilt-stage"
              onMouseMove={(event) => {
                const card = event.currentTarget.querySelector(".tk-card");
                if (!card) return;
                const rect = event.currentTarget.getBoundingClientRect();
                const x = (event.clientX - rect.left) / rect.width - 0.5;
                const y = (event.clientY - rect.top) / rect.height - 0.5;
    event.currentTarget.style.setProperty("--spot-x", `${x * 100 + 50}%`);
    event.currentTarget.style.setProperty("--spot-y", `${y * 100 + 50}%`);
                card.style.transform = `perspective(1200px) rotateX(${-y * 7}deg) rotateY(${x * 9}deg) translateY(-5px)`;
              }}
              onMouseLeave={(event) => {
                const card = event.currentTarget.querySelector(".tk-card");
                if (card) card.style.transform = "";
              }}
            >
              <div className="absolute -inset-8 rounded-[50px] bg-[#B8C8D7]/10 blur-[70px] pointer-events-none" />

              <div className="absolute -top-7 right-5 md:right-12 z-20 rounded-full border border-white/15 bg-[#25292B] px-4 py-2.5 shadow-2xl flex items-center gap-2 tk-float">
                <ShieldCheck className="w-4 h-4 text-[#B8C8D7]" />
                <span className="text-[9px] md:text-[10px] font-bold tracking-wider text-[#DEE5E8]">EVIDENCE FIRST</span>
              </div>

              <div className="relative z-10 rounded-[22px] md:rounded-[30px] border border-white/15 bg-[#E9EEF0] text-[#181818] overflow-hidden shadow-[0_40px_120px_rgba(0,0,0,0.5)] tk-card">

                {/* APP TOP BAR */}
                <div className="h-14 md:h-[68px] px-4 md:px-6 flex items-center justify-between border-b border-[#181818]/10 bg-white/70">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-[#181818] text-white flex items-center justify-center">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[11px] md:text-xs font-extrabold tracking-tight">THREADKEEP.</p>
                      <p className="text-[7px] uppercase tracking-[0.2em] text-[#737F85]">Knowledge workspace</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 rounded-full border border-[#B7C5CC] bg-white/80 px-3 py-2">
                    <span className="tk-preview-pulse w-1.5 h-1.5 rounded-full bg-[#526574]" />
                    <span className="text-[8px] md:text-[9px] font-bold uppercase tracking-widest text-[#525354]">Product preview</span>
                  </div>
                </div>

                <div className="grid grid-cols-[minmax(0,1fr)] sm:grid-cols-[132px_minmax(0,1fr)] min-w-0">

                  {/* SIDEBAR */}
                  <aside className="hidden sm:flex flex-col bg-[#DCE4E7] border-r border-[#181818]/10 p-4">
                    <p className="text-[8px] font-bold tracking-[0.18em] text-[#737F85] mb-5">WORKSPACE</p>
                    <div className="flex items-center gap-2 rounded-lg bg-[#181818] text-white px-2.5 py-2.5">
                      <Layers className="w-3.5 h-3.5" />
                      <span className="text-[9px] font-semibold">Overview</span>
                    </div>
                    <div className="mt-3 space-y-4 text-[#525354]">
                      <div className="flex items-center gap-2 px-2">
                        <BrainCircuit className="w-3.5 h-3.5" />
                        <span className="text-[9px]">Knowledge</span>
                      </div>
                      <div className="flex items-center gap-2 px-2">
                        <Radar className="w-3.5 h-3.5" />
                        <span className="text-[9px]">Open gaps</span>
                      </div>
                      <div className="flex items-center gap-2 px-2">
                        <GitCompare className="w-3.5 h-3.5" />
                        <span className="text-[9px]">Conflicts</span>
                      </div>
                      <div className="flex items-center gap-2 px-2">
                        <FileCheck2 className="w-3.5 h-3.5" />
                        <span className="text-[9px]">Handover</span>
                      </div>
                    </div>
                    <div className="mt-auto rounded-xl bg-white/65 p-3">
                      <ShieldCheck className="w-4 h-4 text-[#526574] mb-2" />
                      <p className="text-[9px] font-bold">Human review</p>
                      <p className="text-[8px] leading-relaxed text-[#737F85] mt-1">Keep people in control.</p>
                    </div>
                  </aside>

                  {/* MAIN DASHBOARD */}
                  <div className="p-4 md:p-6 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-5">
                      <div className="min-w-0">
                        <p className="text-[8px] md:text-[9px] font-bold tracking-[0.2em] text-[#737F85]">PROJECT OVERVIEW</p>
                        <h3 className="text-lg md:text-2xl font-semibold tracking-tight mt-1.5">FinPulse Platform</h3>
                        <p className="text-[9px] md:text-[10px] text-[#737F85] mt-1">Sample project Â· Illustrative data</p>
                      </div>
                      <span className="shrink-0 rounded-full bg-[#181818] text-white px-3 py-1.5 text-[8px] font-bold tracking-wider">SAMPLE</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="rounded-xl bg-white p-2.5 md:p-3 border border-[#181818]/5">
                        <BrainCircuit className="w-3.5 h-3.5 text-[#526574] mb-3" />
                        <p className="text-xl md:text-2xl font-semibold">24</p>
                        <p className="text-[8px] md:text-[9px] text-[#737F85] mt-1">Knowledge items</p>
                      </div>
                      <div className="rounded-xl bg-white p-2.5 md:p-3 border border-[#181818]/5">
                        <Radar className="w-3.5 h-3.5 text-[#526574] mb-3" />
                        <p className="text-xl md:text-2xl font-semibold">04</p>
                        <p className="text-[8px] md:text-[9px] text-[#737F85] mt-1">Open gaps</p>
                      </div>
                      <div className="rounded-xl bg-white p-2.5 md:p-3 border border-[#181818]/5">
                        <GitCompare className="w-3.5 h-3.5 text-[#526574] mb-3" />
                        <p className="text-xl md:text-2xl font-semibold">02</p>
                        <p className="text-[8px] md:text-[9px] text-[#737F85] mt-1">Conflicts</p>
                      </div>
                    </div>

                    <div className="mt-4 rounded-xl border border-[#181818]/10 bg-white p-3 md:p-4">
                      <div className="flex items-center justify-between gap-2 mb-4">
                        <div>
                          <p className="text-[10px] md:text-xs font-bold">Knowledge reconstruction</p>
                          <p className="text-[8px] text-[#737F85] mt-1">Illustrative interface</p>
                        </div>
                        <span className="text-[8px] font-bold text-[#526574] tracking-wider">SAMPLE VIEW</span>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-[#DCE4E7] flex items-center justify-center shrink-0">
                            <FileText className="w-4 h-4 text-[#526574]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[9px] md:text-[10px] font-bold">Architecture decisions</p>
                            <p className="text-[8px] text-[#737F85] mt-0.5">Source-linked context</p>
                          </div>
                          <span className="text-[8px] font-bold text-[#526574]">REVIEW</span>
                        </div>
                        <div className="h-px bg-[#181818]/10" />
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-[#DCE4E7] flex items-center justify-center shrink-0">
                            <Radar className="w-4 h-4 text-[#526574]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[9px] md:text-[10px] font-bold">Unassigned QA ownership</p>
                            <p className="text-[8px] text-[#737F85] mt-0.5">Information to verify</p>
                          </div>
                          <span className="text-[8px] font-bold text-[#737F85]">OPEN</span>
                        </div>
                        <div className="h-px bg-[#181818]/10" />
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-[#DCE4E7] flex items-center justify-center shrink-0">
                            <GitCompare className="w-4 h-4 text-[#526574]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[9px] md:text-[10px] font-bold">Technology specification</p>
                            <p className="text-[8px] text-[#737F85] mt-0.5">Conflicting records to review</p>
                          </div>
                          <span className="text-[8px] font-bold text-[#737F85]">CHECK</span>
                        </div>
                      </div>

                      <div className="tk-reconstruction-progress mt-4 pt-3 border-t border-[#181818]/10">
                        <div className="flex justify-between mb-3">
                          <p className="text-[8px] font-bold uppercase tracking-wider text-[#737F85]">Sample context coverage</p>
                          <span className="text-[8px] font-bold text-[#526574]">ILLUSTRATIVE</span>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between text-[8px] mb-1.5"><span>Architecture decisions</span><span>86%</span></div>
                            <div className="tk-progress-track"><span style={{ "--progress-width": "86%" }} /></div>
                          </div>
                          <div>
                            <div className="flex justify-between text-[8px] mb-1.5"><span>QA ownership</span><span>42%</span></div>
                            <div className="tk-progress-track"><span style={{ "--progress-width": "42%" }} /></div>
                          </div>
                          <div>
                            <div className="flex justify-between text-[8px] mb-1.5"><span>Technology specification</span><span>68%</span></div>
                            <div className="tk-progress-track"><span style={{ "--progress-width": "68%" }} /></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center gap-3 rounded-xl bg-[#181818] text-white p-3">
                      <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                        <MessageCircle className="w-4 h-4 text-[#B8C8D7]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold">Project Companion</p>
                        <p className="text-[8px] text-[#B7C5CC] mt-0.5">Project-specific knowledge, in one place</p>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-[#B8C8D7]" />
                    </div>
                  </div>
                </div>
                <div className="px-4 md:px-6 py-3 bg-[#DCE4E7] border-t border-[#181818]/10 flex justify-between gap-2 text-[8px] uppercase tracking-wider text-[#737F85] font-bold">
                  <span>Illustrative product preview</span>
                  <span>Human-reviewed knowledge</span>
                </div>
              </div>

              {/* FLOATING CALLOUT */}
              <div className="hidden md:flex absolute -left-8 bottom-12 z-20 rounded-2xl border border-white/15 bg-[#292D2F] text-white shadow-2xl p-4 items-center gap-3 tk-float">
                <div className="w-10 h-10 rounded-xl bg-[#B8C8D7]/15 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-[#B8C8D7]" />
                </div>
                <div>
                  <p className="text-[10px] font-bold">Evidence stays connected.</p>
                  <p className="text-[9px] text-[#95A1A6] mt-1">People stay in control.</p>
                </div>
              </div>
            </div>
          </div>

          {/* EDITORIAL FOOT STRIP */}
          <div className="mt-20 md:mt-24 border-t border-white/15 pt-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <p className="text-[9px] font-bold tracking-[0.22em] uppercase text-[#737F85]">BUILT FOR KNOWLEDGE THAT OUTLIVES A ROLE</p>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[9px] font-semibold tracking-[0.14em] uppercase text-[#B7C5CC]">
              <span className="flex items-center gap-2"><Layers className="w-3.5 h-3.5" /> Shared context</span>
              <span className="flex items-center gap-2"><ShieldCheck className="w-3.5 h-3.5" /> Evidence-led review</span>
              <span className="flex items-center gap-2"><FileCheck2 className="w-3.5 h-3.5" /> Clear handovers</span>
            </div>
          </div>
        </div>
      </section>
      {/* EDITORIAL PROBLEM SECTION */}
      <section className="bg-[#181818] text-[#DEE5E8] px-5 md:px-8 py-20 md:py-28">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-[0.85fr_1.15fr] gap-12 lg:gap-24">
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-[#95A1A6] font-bold mb-6">
                THE PROBLEM
              </p>
              <h2 className="text-4xl md:text-6xl font-semibold tracking-[-0.06em] leading-[1.02]">
                A team can
                <br />
                lose more than
                <br />
                <span className="text-[#95A1A6]">a person.</span>
              </h2>
              <p className="mt-7 text-sm md:text-base text-[#B7C5CC] leading-relaxed max-w-md">
                Every project builds knowledge over time. But when that
                knowledge lives in scattered files, private conversations
                and individual experience, a team transition becomes a
                knowledge crisis.
              </p>
            </div>

            <div className="space-y-0">
              <div className="py-7 border-b border-white/15 flex gap-5">
                <div className="text-[#95A1A6] text-xs font-bold pt-1">01</div>
                <div>
                  <h3 className="text-lg md:text-xl font-semibold">Decisions without context</h3>
                  <p className="text-sm text-[#95A1A6] mt-2 leading-relaxed">
                    The team knows what was built, but not always why it was built that way.
                  </p>
                </div>
                <X className="w-5 h-5 ml-auto shrink-0 text-[#95A1A6]" />
              </div>

              <div className="py-7 border-b border-white/15 flex gap-5">
                <div className="text-[#95A1A6] text-xs font-bold pt-1">02</div>
                <div>
                  <h3 className="text-lg md:text-xl font-semibold">Knowledge across disconnected sources</h3>
                  <p className="text-sm text-[#95A1A6] mt-2 leading-relaxed">
                    Important details are buried in documents, notes and conversations.
                  </p>
                </div>
                <X className="w-5 h-5 ml-auto shrink-0 text-[#95A1A6]" />
              </div>

              <div className="py-7 border-b border-white/15 flex gap-5">
                <div className="text-[#95A1A6] text-xs font-bold pt-1">03</div>
                <div>
                  <h3 className="text-lg md:text-xl font-semibold">New members start by asking around</h3>
                  <p className="text-sm text-[#95A1A6] mt-2 leading-relaxed">
                    Repeated questions interrupt experienced teammates and slow down onboarding.
                  </p>
                </div>
                <X className="w-5 h-5 ml-auto shrink-0 text-[#95A1A6]" />
              </div>

              <div className="pt-8 flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#DEE5E8] text-[#181818] flex items-center justify-center shrink-0">
                  <Check className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-semibold">The answer is continuity.</h3>
                  <p className="text-sm text-[#95A1A6] mt-2 leading-relaxed">
                    ThreadKeep turns scattered project information into a
                    structured, reviewable knowledge base for the next person.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* INTELLIGENCE FEATURES */}
      <section id="intelligence" className="px-5 md:px-8 py-20 md:py-28">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-[#737F85] font-bold mb-5">
                THE INTELLIGENCE LAYER
              </p>
              <h2 className="text-4xl md:text-6xl font-semibold tracking-[-0.06em] leading-[1.03] max-w-2xl">
                More than storing
                <br />
                <span className="text-[#737F85]">project documents.</span>
              </h2>
            </div>
            <p className="text-sm text-[#525354] leading-relaxed max-w-sm">
              ThreadKeep is designed to connect the information, identify
              what needs attention and make project knowledge useful again.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.number}
                  className="group tk-float-card bg-[#F7F9FA] border border-[#B7C5CC]/60 rounded-2xl p-7 md:p-9 hover:bg-white hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-10">
                    <div className="w-12 h-12 rounded-xl bg-[#DEE5E8] flex items-center justify-center">
                      <Icon className="w-5 h-5 text-[#525354]" />
                    </div>
                    <span className="text-xs font-bold text-[#95A1A6]">{feature.number}</span>
                  </div>
                  <p className="text-[9px] tracking-[0.2em] font-bold text-[#737F85] mb-3">
                    {feature.tag}
                  </p>
                  <h3 className="text-2xl md:text-3xl font-semibold tracking-tight">
                    {feature.title}
                  </h3>
                  <p className="mt-4 text-sm text-[#737F85] leading-relaxed max-w-lg">
                    {feature.description}
                  </p>
                  <div className="mt-8 pt-5 border-t border-[#DEE5E8] flex items-center justify-between">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[#737F85]">
                      ThreadKeep capability
                    </span>
                    <ArrowUpRight className="w-4 h-4 text-[#525354] group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* AI COMPANION */}
      <section id="companion" className="bg-[#B8C8D7]/55 px-5 md:px-8 py-20 md:py-28">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-14 items-center">
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-[#525354] font-bold mb-6">
              A NEW WAY TO ONBOARD
            </p>
            <h2 className="text-4xl md:text-6xl font-semibold tracking-[-0.065em] leading-[1.02]">
              Meet your
              <br />
              <span className="text-[#737F85]">Project</span>
              <br />
              Companion.
            </h2>
            <p className="mt-7 text-base text-[#525354] leading-relaxed max-w-lg">
              What if a new team member could ask the project itself instead
              of searching through endless documents or repeatedly interrupting
              senior colleagues?
            </p>
            <p className="mt-4 text-sm text-[#525354] leading-relaxed max-w-lg">
              The ThreadKeep AI Companion is designed for project-specific
              conversations, helping people explore decisions, understand
              context and find answers from available project knowledge.
            </p>

            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-3 text-sm font-medium text-[#181818]">
                <div className="w-7 h-7 rounded-full bg-[#181818] text-white flex items-center justify-center">
                  <MessageCircle className="w-3.5 h-3.5" />
                </div>
                Ask questions in natural language
              </div>
              <div className="flex items-center gap-3 text-sm font-medium text-[#181818]">
                <div className="w-7 h-7 rounded-full bg-[#181818] text-white flex items-center justify-center">
                  <Search className="w-3.5 h-3.5" />
                </div>
                Find context from project information
              </div>
              <div className="flex items-center gap-3 text-sm font-medium text-[#181818]">
                <div className="w-7 h-7 rounded-full bg-[#181818] text-white flex items-center justify-center">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                Surface missing or conflicting information
              </div>
              <div className="flex items-center gap-3 text-sm font-medium text-[#181818]">
                <div className="w-7 h-7 rounded-full bg-[#181818] text-white flex items-center justify-center">
                  <Mic className="w-3.5 h-3.5" />
                </div>
                Explore a voice-first interaction experience
              </div>
            </div>
          </div>

          {/* COMPANION CHAT CONCEPT */}
          <div className="relative">
            <div className="absolute -inset-4 rounded-[30px] bg-white/30 blur-xl" />
            <div className="relative rounded-3xl overflow-hidden bg-[#F7F9FA] border border-white/70 shadow-[0_25px_70px_rgba(24,24,24,0.12)]">
              <div className="px-5 py-5 border-b border-[#DEE5E8] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#181818] text-white flex items-center justify-center">
                    <BrainCircuit className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">Project Companion</p>
                    <p className="text-[10px] text-[#737F85]">FinPulse Â· Sample conversation</p>
                  </div>
                </div>
                <div className="text-[9px] uppercase tracking-wider font-bold text-[#737F85]">
                  AI CONCEPT
                </div>
              </div>

              <div className="p-5 md:p-7 space-y-6">
                <div className="max-w-[88%] ml-auto">
                  <div className="bg-[#DEE5E8] rounded-2xl rounded-tr-sm p-4">
                    <p className="text-xs leading-relaxed text-[#181818]">
                      Why did the team choose MongoDB for this project?
                    </p>
                  </div>
                  <p className="text-[9px] text-[#737F85] text-right mt-2">NEW TEAM MEMBER</p>
                </div>

                <div className="max-w-[94%]">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-lg bg-[#181818] text-white flex items-center justify-center">
                      <Sparkles className="w-3 h-3" />
                    </div>
                    <span className="text-[10px] font-bold text-[#525354]">THREADKEEP COMPANION</span>
                  </div>
                  <div className="bg-white border border-[#DEE5E8] rounded-2xl rounded-tl-sm p-4">
                    <p className="text-xs leading-relaxed text-[#525354]">
                      I can help investigate that decision using the
                      available project records. The relevant architecture
                      notes should be reviewed before treating the reason
                      as confirmed.
                    </p>
                    <div className="mt-4 rounded-xl bg-[#DEE5E8]/60 p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="w-3.5 h-3.5 text-[#525354]" />
                        <span className="text-[10px] font-bold text-[#525354]">RELATED PROJECT SOURCE</span>
                      </div>
                      <p className="text-[10px] text-[#737F85]">
                        Architecture_Notes.pdf Â· Sample source reference
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border border-[#B7C5CC] rounded-xl px-4 py-3 flex items-center gap-3 bg-white">
                  <span className="flex-1 text-[11px] text-[#95A1A6]">
                    Ask something about this project...
                  </span>
                  <Mic className="w-4 h-4 text-[#737F85]" />
                  <div className="w-8 h-8 rounded-lg bg-[#181818] text-white flex items-center justify-center">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>

                <p className="text-[9px] text-center text-[#95A1A6]">
                  Illustrative conversation Â· Not a live AI response
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WORKFLOW */}
      <section id="workflow" className="px-5 md:px-8 py-20 md:py-28">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl mb-14">
            <p className="text-[10px] uppercase tracking-[0.25em] text-[#737F85] font-bold mb-5">
              THE PROCESS
            </p>
            <h2 className="text-4xl md:text-6xl font-semibold tracking-[-0.06em] leading-[1.02]">
              From scattered
              <br />
              information to
              <span className="text-[#737F85]"> shared clarity.</span>
            </h2>
            <p className="mt-6 text-sm text-[#737F85] leading-relaxed max-w-lg">
              A practical flow that transforms available project information
              into knowledge the next contributor can understand and review.
            </p>
          </div>

          {/* ANIMATED KNOWLEDGE PIPELINE */}
          <div className="tk-knowledge-pipeline mb-16 relative rounded-[28px] border border-[#B7C5CC]/60 bg-[#F7F9FA] px-5 py-10 md:px-10 md:py-12 overflow-hidden">
            <div className="absolute inset-0 tk-pipeline-grid pointer-events-none" />
            <div className="relative grid grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-10">
              <div className="tk-flow-stage">
                <div className="tk-flow-node">
                  <FileText className="w-6 h-6" />
                  <span className="tk-flow-orbit" />
                </div>
                <p className="text-sm font-bold mt-5">01 / Documents</p>
                <p className="text-xs text-[#737F85] mt-1">Collect scattered knowledge</p>
              </div>
              <div className="tk-flow-stage">
                <div className="tk-flow-node">
                  <BrainCircuit className="w-6 h-6" />
                  <span className="tk-flow-orbit" />
                </div>
                <p className="text-sm font-bold mt-5">02 / Reconstruct</p>
                <p className="text-xs text-[#737F85] mt-1">Connect the project context</p>
              </div>
              <div className="tk-flow-stage">
                <div className="tk-flow-node">
                  <ShieldCheck className="w-6 h-6" />
                  <span className="tk-flow-orbit" />
                </div>
                <p className="text-sm font-bold mt-5">03 / Verify</p>
                <p className="text-xs text-[#737F85] mt-1">Review evidence and gaps</p>
              </div>
              <div className="tk-flow-stage">
                <div className="tk-flow-node">
                  <FileCheck2 className="w-6 h-6" />
                  <span className="tk-flow-orbit" />
                </div>
                <p className="text-sm font-bold mt-5">04 / Handover</p>
                <p className="text-xs text-[#737F85] mt-1">Pass knowledge forward</p>
              </div>
            </div>
            <div className="tk-flow-rail hidden lg:block">
              <span className="tk-flow-traveller" />
            </div>
            <p className="relative text-[9px] uppercase tracking-[0.22em] text-[#95A1A6] font-bold mt-10">
              FROM RAW INFORMATION TO SHARED PROJECT CLARITY
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {workflow.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.number} className="relative tk-float-card bg-[#F7F9FA] border border-[#B7C5CC]/60 rounded-2xl p-6 min-h-[245px]">
                  <div className="flex justify-between items-center mb-10">
                    <div className="w-11 h-11 rounded-xl bg-[#DEE5E8] flex items-center justify-center">
                      <Icon className="w-5 h-5 text-[#525354]" />
                    </div>
                    <span className="text-xs font-bold text-[#95A1A6]">{step.number}</span>
                  </div>
                  <h3 className="text-lg font-semibold tracking-tight">{step.title}</h3>
                  <p className="text-xs text-[#737F85] leading-relaxed mt-3">{step.description}</p>
                  {index !== 3 && (
                    <div className="hidden lg:block absolute top-[42px] -right-3 z-10 w-6 h-6 rounded-full bg-[#181818] text-white items-center justify-center">
                      <ArrowRight className="w-3 h-3 m-auto mt-1.5" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* TRUST / PRINCIPLES */}
      <section className="bg-[#F7F9FA] px-5 md:px-8 py-16 md:py-20 border-y border-[#B7C5CC]/50">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-10">
          <div>
            <ShieldCheck className="w-6 h-6 text-[#525354] mb-5" />
            <h3 className="text-lg font-semibold">Evidence matters</h3>
            <p className="text-sm text-[#737F85] leading-relaxed mt-2">
              Important findings should be traceable to their supporting project information.
            </p>
          </div>
          <div>
            <Users className="w-6 h-6 text-[#525354] mb-5" />
            <h3 className="text-lg font-semibold">People stay in control</h3>
            <p className="text-sm text-[#737F85] leading-relaxed mt-2">
              Human review helps teams validate information before relying on it.
            </p>
          </div>
          <div>
            <Activity className="w-6 h-6 text-[#525354] mb-5" />
            <h3 className="text-lg font-semibold">Continuity by design</h3>
            <p className="text-sm text-[#737F85] leading-relaxed mt-2">
              Preserve context so the next contributor can continue the work with clarity.
            </p>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="px-5 md:px-8 py-20 md:py-28">
        <div className="max-w-7xl mx-auto rounded-[28px] bg-[#181818] text-[#DEE5E8] px-7 py-14 md:px-16 md:py-20 relative overflow-hidden">
          <div className="absolute right-[-80px] top-[-130px] w-[350px] h-[350px] rounded-full border border-white/10" />
          <div className="absolute right-[-25px] top-[-75px] w-[240px] h-[240px] rounded-full border border-white/10" />

          <div className="relative max-w-3xl">
            <p className="text-[10px] uppercase tracking-[0.25em] text-[#95A1A6] font-bold mb-6">
              KEEP THE KNOWLEDGE. KEEP THE WORK MOVING.
            </p>
            <h2 className="text-4xl md:text-6xl font-semibold tracking-[-0.06em] leading-[1.03]">
              Make every
              <br />
              handover a
              <span className="text-[#95A1A6]"> fresh start.</span>
            </h2>
            <p className="mt-6 text-sm md:text-base text-[#B7C5CC] leading-relaxed max-w-xl">
              Give the next team member more than a folder of documents.
              Give them the context to understand, contribute and move forward.
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
              <Link
                to="/register"
                className="inline-flex items-center gap-3 rounded-full bg-[#DEE5E8] text-[#181818] px-7 py-4 text-sm font-bold hover:bg-white transition-colors"
              >
                Get started
                <ArrowUpRight className="w-4 h-4" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-full border border-white/25 px-7 py-4 text-sm font-semibold text-[#DEE5E8] hover:bg-white/10 transition-colors"
              >
                Sign in
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default LandingPage;












