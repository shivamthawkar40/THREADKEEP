import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { BookOpen, ArrowRight, ShieldCheck, Cpu } from 'lucide-react';
import Button from '../components/common/Button';

const PublicLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-ivory">
      {/* Editorial Top Bar */}
      <header className="border-b border-sage/30 bg-white/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-teal flex items-center justify-center text-ivory shadow-soft group-hover:bg-teal-dark transition-colors">
              <BookOpen className="w-5 h-5 text-aqua" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xl tracking-tight text-teal">THREADKEEP</span>
                <span className="text-[10px] font-mono uppercase bg-mint px-2 py-0.5 rounded text-teal-dark font-semibold">
                  SPY_2.O
                </span>
              </div>
              <p className="text-[11px] font-medium text-charcoal-light">A Project's Memory, Reconnected</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-charcoal">
            <a href="/#vision" className="hover:text-teal transition-colors">Product Vision</a>
            <a href="/#architecture" className="hover:text-teal transition-colors">Intelligence Engine</a>
            <a href="/#features" className="hover:text-teal transition-colors">Features</a>
            <a href="/#team" className="hover:text-teal transition-colors">Team</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link to="/register">
              <Button variant="primary" size="sm" icon={ArrowRight} iconPosition="right">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Public Body */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Editorial Footer */}
      <footer className="border-t border-sage/30 bg-white py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal flex items-center justify-center text-ivory">
              <BookOpen className="w-4 h-4 text-aqua" />
            </div>
            <div>
              <div className="text-sm font-bold text-teal">THREADKEEP</div>
              <div className="text-xs text-charcoal-light">"Keep the knowledge. Keep the work moving."</div>
            </div>
          </div>

          <div className="text-xs text-charcoal-light text-center md:text-right">
            Built for Hackathon MVP • Designed by Team <strong className="text-teal font-semibold">SPY_2.O</strong>
            <div className="mt-1 flex items-center justify-center md:justify-end gap-2 text-[11px]">
              <span className="inline-block w-2 h-2 rounded-full bg-teal" />
              <span>Full-Stack SaaS: React + Node.js + Express + MongoDB</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
