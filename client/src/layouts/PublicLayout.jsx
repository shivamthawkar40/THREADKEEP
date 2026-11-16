import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { ArrowUpRight, BookOpen, Layers3 } from 'lucide-react';

const PublicLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#DEE5E8] text-[#181818]">
      <header className="sticky top-0 z-50 border-b border-[#737F85]/20 bg-[#DEE5E8]/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-5 md:px-8 h-[76px] flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-[#181818] text-[#DEE5E8] flex items-center justify-center group-hover:bg-[#525354] transition-colors">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-lg font-extrabold tracking-[-0.06em] text-[#181818]">
                THREADKEEP<span className="text-[#737F85]">.</span>
              </span>
              <span className="block text-[9px] tracking-[0.18em] uppercase text-[#737F85] font-semibold">
                Project knowledge continuity
              </span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-8 text-[13px] font-semibold text-[#525354]">
            <a href="/#product" className="hover:text-[#181818] transition-colors">Product</a>
            <a href="/#intelligence" className="hover:text-[#181818] transition-colors">Intelligence</a>
            <a href="/#companion" className="hover:text-[#181818] transition-colors">AI Companion</a>
            <a href="/#workflow" className="hover:text-[#181818] transition-colors">How it works</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="hidden sm:inline-flex text-sm font-semibold text-[#525354] hover:text-[#181818] transition-colors px-3 py-2"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-full bg-[#181818] text-[#DEE5E8] px-5 py-3 text-xs font-bold tracking-wide hover:bg-[#525354] transition-all duration-300"
            >
              Get started
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-[#181818] text-[#DEE5E8] px-6 md:px-10 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 pb-10 border-b border-white/15">
            <div className="max-w-md">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-xl bg-[#525354] flex items-center justify-center">
                  <Layers3 className="w-5 h-5 text-[#DEE5E8]" />
                </div>
                <span className="text-lg font-extrabold tracking-[-0.05em]">THREADKEEP.</span>
              </div>
              <p className="text-2xl md:text-3xl font-semibold tracking-tight leading-snug text-[#DEE5E8]">
                Knowledge stays.
                <span className="text-[#95A1A6]"> Teams move forward.</span>
              </p>
            </div>

            <div className="flex flex-wrap gap-x-7 gap-y-3 text-sm text-[#B7C5CC]">
              <a href="/#product" className="hover:text-white transition-colors">Product</a>
              <a href="/#intelligence" className="hover:text-white transition-colors">Features</a>
              <a href="/#companion" className="hover:text-white transition-colors">AI Companion</a>
              <Link to="/login" className="hover:text-white transition-colors">Sign in</Link>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row justify-between gap-3 text-[11px] text-[#95A1A6]">
            <span>Built by Team SPY_2.O</span>
            <span>React Â· Node.js Â· Express Â· MongoDB</span>
            <span>Â© 2026 ThreadKeep. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
