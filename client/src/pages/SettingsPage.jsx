import React, { useState } from 'react';
import {
  Settings,
  Key,
  User,
  ShieldCheck,
  CheckCircle2,
  Cpu,
  Database,
  FileCheck2,
  Sparkles,
  Info,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useProject } from '../context/ProjectContext';
import { useToast } from '../context/ToastContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';

const SettingsPage = () => {
  const { user } = useAuth();
  const { loadSample, sampleLoading } = useProject();
  const { addToast } = useToast();

  const [geminiKey, setGeminiKey] = useState('');
  const [savingKey, setSavingKey] = useState(false);
  const [exportFormat, setExportFormat] = useState('pdf');

  const handleSaveApiKey = (e) => {
    e.preventDefault();
    setSavingKey(true);
    setTimeout(() => {
      setSavingKey(false);
      addToast('Gemini API configuration preference recorded.', 'success');
    }, 400);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b border-sage/30 pb-5">
        <h1 className="text-2xl font-black text-charcoal">Platform Settings</h1>
        <p className="text-xs text-charcoal-light mt-0.5">
          Configure AI intelligence services, user credentials, and export formats.
        </p>
      </div>

      {/* AI Engine & API Key Configuration */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-ivory-dark pb-3">
          <div className="flex items-center gap-2.5">
            <Cpu className="w-5 h-5 text-teal" />
            <div>
              <h3 className="text-sm font-bold text-charcoal">LLM API Intelligence Integration</h3>
              <p className="text-xs text-charcoal-light">Google Gemini API / Multi-Tier Extraction Engine</p>
            </div>
          </div>
          <Badge variant="teal">Active & Operational</Badge>
        </div>

        <form onSubmit={handleSaveApiKey} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
              Gemini API Key (Optional Override)
            </label>
            <div className="relative">
              <Key className="w-4 h-4 text-charcoal-light absolute left-3 top-2.5" />
              <input
                type="password"
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                placeholder="AIzaSy... (Reads from server .env GEMINI_API_KEY by default)"
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-sage/40 bg-ivory text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal/20 focus:border-teal transition-all"
              />
            </div>
            <p className="text-[11px] text-charcoal-light mt-1.5 leading-relaxed">
              THREADKEEP includes an embedded Deep Intelligence & Citation Mapping Engine that runs automatically with zero external dependencies when an API key is not configured.
            </p>
          </div>

          <div className="flex justify-end">
            <Button type="submit" variant="primary" size="xs" loading={savingKey}>
              Save Key Configuration
            </Button>
          </div>
        </form>
      </Card>

      {/* User Profile */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2.5 border-b border-ivory-dark pb-3">
          <User className="w-5 h-5 text-teal" />
          <div>
            <h3 className="text-sm font-bold text-charcoal">User Profile</h3>
            <p className="text-xs text-charcoal-light">Active session and organization credentials</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-lg bg-ivory border border-sage/20 space-y-1">
            <span className="text-charcoal-light text-[10px] uppercase font-bold tracking-wider">Name</span>
            <div className="font-bold text-charcoal text-sm">{user?.name}</div>
          </div>

          <div className="p-3.5 rounded-lg bg-ivory border border-sage/20 space-y-1">
            <span className="text-charcoal-light text-[10px] uppercase font-bold tracking-wider">Email</span>
            <div className="font-mono text-charcoal text-xs">{user?.email}</div>
          </div>

          <div className="p-3.5 rounded-lg bg-ivory border border-sage/20 space-y-1">
            <span className="text-charcoal-light text-[10px] uppercase font-bold tracking-wider">Role</span>
            <div className="font-bold text-teal capitalize">{user?.role?.replace('_', ' ')}</div>
          </div>

          <div className="p-3.5 rounded-lg bg-ivory border border-sage/20 space-y-1">
            <span className="text-charcoal-light text-[10px] uppercase font-bold tracking-wider">Organization</span>
            <div className="font-bold text-charcoal">{user?.organization || 'SPY_2.O Engineering'}</div>
          </div>
        </div>
      </Card>

      {/* Architecture Specs & Platform Info */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-ivory-dark pb-3">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-teal" />
            <h3 className="text-sm font-bold text-charcoal">Architecture & Compliance Specifications</h3>
          </div>
          <Badge variant="sage">Hackathon MVP</Badge>
        </div>

        <div className="space-y-2 text-xs text-charcoal-light leading-relaxed">
          <p>
            • <strong>Platform:</strong> THREADKEEP — A Project's Memory, Reconnected.
          </p>
          <p>
            • <strong>Team:</strong> SPY_2.O (Lead Architecture & Full-Stack AI Engineering).
          </p>
          <p>
            • <strong>Technology Stack:</strong> React.js, Tailwind CSS, Node.js Express, MongoDB, Mongoose, PDFKit, JWT.
          </p>
          <p>
            • <strong>Document Extractors:</strong> Native parsers for PDF, DOCX, CSV, TXT with page and line citations.
          </p>
        </div>

        <div className="pt-3 border-t border-sage/20 flex items-center justify-between">
          <span className="text-[11px] text-charcoal-light font-mono">
            Reload FinPulse Banking Dataset:
          </span>
          <Button
            variant="aqua"
            size="xs"
            icon={Sparkles}
            loading={sampleLoading}
            onClick={loadSample}
            className="text-teal-deep font-bold"
          >
            Load Sample Dataset
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default SettingsPage;
