import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Link, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderGit2,
  FileText,
  Cpu,
  Radar,
  GitCompare,
  Search,
  CheckSquare,
  FileCheck2,
  Settings,
  LogOut,
  ChevronDown,
  Sparkles,
  BookOpen,
  Plus,
  Layers,
  Menu,
  X,
  Moon,
  Sun,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useProject } from '../context/ProjectContext';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import HealthScoreBadge from '../components/common/HealthScoreBadge';

const AppLayout = () => {
  const { user, logout } = useAuth();
  const { projects, currentProject, selectProject, loadSample, sampleLoading } = useProject();
  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(
  () => localStorage.getItem('threadkeep_theme') === 'dark'
);

useEffect(() => {
  document.documentElement.classList.toggle('dark', darkMode);
  localStorage.setItem('threadkeep_theme', darkMode ? 'dark' : 'light');
}, [darkMode]);

const toggleTheme = () => {
  setDarkMode((prev) => !prev);
};
  const location = useLocation();
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProjectDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navigation = [
    { name: 'Dashboard', path: '/app/dashboard', icon: LayoutDashboard },
    { name: 'Projects', path: '/app/projects', icon: FolderGit2, badge: projects.length },
    { name: 'Document Center', path: '/app/documents', icon: FileText, badge: currentProject?.stats?.totalDocuments },
    { name: 'AI Reconstruction', path: '/app/reconstruction', icon: Cpu },
    { name: 'Knowledge Gap Radar', path: '/app/gaps', icon: Radar, badge: currentProject?.stats?.openGaps, badgeVariant: 'coral' },
    { name: 'Conflict Detection', path: '/app/conflicts', icon: GitCompare, badge: currentProject?.stats?.unresolvedConflicts, badgeVariant: 'gold' },
    { name: 'Evidence Explorer', path: '/app/evidence', icon: Search },
    { name: 'Human Review Center', path: '/app/reviews', icon: CheckSquare },
    { name: 'Handover Generator', path: '/app/handover', icon: FileCheck2 },
    { name: 'Settings', path: '/app/settings', icon: Settings },
  ];

  const navGroups = [
    {
      label: 'Workspace',
      items: navigation.slice(0, 3),
    },
    {
      label: 'AI Analysis Pipeline',
      items: navigation.slice(3, 7),
    },
    {
      label: 'Review & Delivery',
      items: navigation.slice(7, 9),
    },
    {
      label: 'System',
      items: navigation.slice(9),
    },
  ];

  const SidebarNav = () => (
    <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-5">
      {navGroups.map((group) => (
        <div key={group.label}>
          <div className="px-3 mb-1.5 text-[10px] uppercase font-bold tracking-widest text-white/30">
            {group.label}
          </div>
          <div className="space-y-0.5">
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.path);
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={`
                    flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold
                    transition-all duration-150
                    ${isActive
                      ? 'bg-teal text-ivory shadow-soft'
                      : 'text-white/60 hover:text-white hover:bg-white/10'
                    }
                  `}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-ivory' : 'text-white/50'}`} />
                    <span>{item.name}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className={`
                      text-[10px] font-bold px-1.5 py-0.5 rounded-md
                      ${item.badgeVariant === 'coral' ? 'bg-coral/30 text-coral-light' :
                        item.badgeVariant === 'gold' ? 'bg-gold/30 text-gold' :
                        'bg-white/15 text-white/80'}
                    `}>
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen flex bg-ivory dark:bg-[#071F2B] transition-colors duration-300">
      {/* Desktop Sidebar — Dark Olive */}
      <aside className="hidden lg:flex flex-col w-64 flex-shrink-0" style={{ background: 'linear-gradient(180deg, #2C2E1E 0%, #1E2015 100%)' }}>
        {/* Brand */}
        <div className="h-16 px-5 border-b border-white/10 flex items-center gap-3 flex-shrink-0">
          <div className="w-8 h-8 rounded-xl bg-teal flex items-center justify-center shadow-soft flex-shrink-0">
            <BookOpen className="w-4 h-4 text-ivory" />
          </div>
          <div>
            <div className="font-black text-sm text-white tracking-tight">THREADKEEP</div>
            <div className="text-[9px] font-mono tracking-widest text-white/40 uppercase">Knowledge Continuity</div>
          </div>
        </div>

        {/* Active Project */}
        <div className="mx-3 my-3 p-3 rounded-xl border border-white/10 bg-white/5 flex-shrink-0">
          <div className="text-[9px] uppercase font-bold tracking-widest text-white/30 mb-1">Active Workspace</div>
          {currentProject ? (
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate">{currentProject.name}</div>
                <div className="text-[10px] text-teal font-medium truncate">{currentProject.targetDomain}</div>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-teal/20 text-teal font-bold uppercase flex-shrink-0">
                {currentProject.key}
              </span>
            </div>
          ) : (
            <div>
              <div className="text-xs text-white/40">No project selected</div>
              <Link to="/app/projects/create" className="text-[10px] text-teal font-semibold hover:underline">
                Create one →
              </Link>
            </div>
          )}
        </div>

        {/* Navigation */}
        <SidebarNav />

        {/* Load Sample button */}
        <div className="mx-3 mb-3 flex-shrink-0">
          <button
            onClick={loadSample}
            disabled={sampleLoading}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] font-semibold
              text-white/60 hover:text-white hover:bg-white/8 transition-all border border-white/10
              hover:border-teal/30 disabled:opacity-50"
          >
            <Sparkles className={`w-3.5 h-3.5 ${sampleLoading ? 'animate-spin text-teal' : 'text-teal'}`} />
            {sampleLoading ? 'Loading sample...' : 'Load FinPulse Sample'}
          </button>
        </div>

        {/* User Card */}
        <div className="p-3 border-t border-white/10 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5 min-w-0 mr-2">
            <div className="w-8 h-8 rounded-full bg-teal flex items-center justify-center font-black text-xs text-ivory flex-shrink-0 shadow-soft">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-white truncate">{user?.name}</div>
              <div className="text-[10px] text-white/40 capitalize truncate">{user?.role?.replace('_', ' ')}</div>
            </div>
          </div>
          <button
            onClick={logout}
            title="Sign Out"
            className="p-1.5 rounded-lg text-white/40 hover:text-coral hover:bg-white/10 transition-colors flex-shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 border-b border-sage/30 bg-white/95 dark:bg-[#0B2933]/95 dark:border-white/10 backdrop-blur-md px-4 md:px-6 flex items-center justify-between sticky top-0 z-30 flex-shrink-0 transition-colors duration-300">
          {/* Left — Mobile menu + Project switcher */}
          <div className="flex items-center gap-3">
            <button
  onClick={toggleTheme}
  title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
  aria-label="Toggle dark mode"
  className="p-2.5 rounded-xl border border-sage/40
    bg-ivory text-charcoal hover:bg-mint
    transition-all duration-300"
>
  {darkMode ? (
    <Sun className="w-5 h-5 text-gold" />
  ) : (
    <Moon className="w-5 h-5 text-teal" />
  )}
</button>
            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-charcoal hover:bg-mint transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Project Switcher Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setProjectDropdownOpen(!projectDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-sage/50
                  bg-ivory text-xs font-semibold text-charcoal
                  hover:bg-mint hover:border-teal/30 transition-all"
              >
                <Layers className="w-3.5 h-3.5 text-teal" />
                <span className="max-w-[160px] truncate hidden sm:block">
                  {currentProject?.name || 'Select Project'}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-charcoal-light transition-transform ${projectDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {projectDropdownOpen && (
                <div className="absolute left-0 mt-1.5 w-72 bg-white rounded-2xl border border-sage/40 shadow-elevated py-2 z-50 animate-fade-in">
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-charcoal-light border-b border-ivory-dark flex justify-between items-center">
                    <span>Projects ({projects.length})</span>
                    <Link
                      to="/app/projects/create"
                      onClick={() => setProjectDropdownOpen(false)}
                      className="text-teal hover:underline flex items-center gap-1 font-semibold normal-case"
                    >
                      <Plus className="w-3 h-3" /> New
                    </Link>
                  </div>
                  <div className="max-h-56 overflow-y-auto py-1">
                    {projects.length === 0 ? (
                      <div className="px-3 py-4 text-xs text-charcoal-light text-center">
                        No projects yet.{' '}
                        <Link to="/app/projects/create" className="text-teal hover:underline font-semibold">
                          Create one
                        </Link>
                      </div>
                    ) : (
                      projects.map((p) => (
                        <button
                          key={p._id}
                          onClick={() => { selectProject(p._id); setProjectDropdownOpen(false); }}
                          className={`w-full text-left px-3 py-2.5 text-xs flex items-center justify-between
                            hover:bg-mint/50 transition-colors gap-2
                            ${p._id === currentProject?._id ? 'bg-teal/8 font-bold text-teal' : 'text-charcoal'}`}
                        >
                          <div className="min-w-0">
                            <div className="truncate font-semibold">{p.name}</div>
                            <div className="text-[10px] text-charcoal-light truncate">{p.targetDomain}</div>
                          </div>
                          <HealthScoreBadge score={p.healthScore || 0} size="sm" />
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {currentProject && (
              <Link
                to={`/app/projects/${currentProject._id}`}
                className="hidden md:block text-xs text-charcoal-light hover:text-teal font-medium transition-colors"
              >
                Overview
              </Link>
            )}
          </div>

          {/* Right — Health badge */}
          <div className="flex items-center gap-3">
            {currentProject && (
              <div className="hidden md:flex items-center gap-2 text-xs text-charcoal-light">
                <span>Health:</span>
                <HealthScoreBadge score={currentProject.healthScore || 0} size="sm" />
              </div>
            )}
            <Link
              to="/app/projects/create"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal text-ivory
                text-xs font-semibold hover:bg-teal-dark transition-colors shadow-soft"
            >
              <Plus className="w-3.5 h-3.5" />
              New Project
            </Link>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div
            className="lg:hidden animate-slide-up border-b border-sage/30 overflow-y-auto"
            style={{ background: 'linear-gradient(180deg, #2C2E1E 0%, #1E2015 100%)', maxHeight: '70vh' }}
          >
            <div className="p-3 space-y-0.5">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname.startsWith(item.path);
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`
                      flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold
                      transition-colors
                      ${isActive ? 'bg-teal text-ivory' : 'text-white/60 hover:text-white hover:bg-white/10'}
                    `}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4" />
                      {item.name}
                    </div>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/15 text-white/80">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto p-5 md:p-8 bg-ivory dark:bg-[#071F2B] transition-colors duration-300">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
