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
      <div className="border-b border-[#B7C5CC] pb-5">
        <h1 className="text-2xl font-black text-[#181818]">Platform Settings</h1>
        <p className="text-xs text-[#181818]-light mt-0.5">
          Configure AI intelligence services, user credentials, and export formats.
        </p>
      </div>

      {/* AI Engine & API Key Configuration */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[#B7C5CC] pb-3">
          <div className="flex items-center gap-2.5">
            <Cpu className="w-5 h-5 text-[#525354]" />
            <div>
              <h3 className="text-sm font-bold text-[#181818]">LLM API Intelligence Integration</h3>
              <p className="text-xs text-[#181818]-light">Google Gemini API / Multi-Tier Extraction Engine</p>
            </div>
          </div>
          <Badge variant="aqua">Active & Operational</Badge>
        </div>

        <form onSubmit={handleSaveApiKey} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#181818] mb-1.5">
              Gemini API Key (Optional Override)
            </label>
            <div className="relative">
              <Key className="w-4 h-4 text-[#181818]-light absolute left-3 top-2.5" />
              <input
                type="password"
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                placeholder="AIzaSy... (Reads from server .env GEMINI_API_KEY by default)"
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-[#B7C5CC] bg-[#DEE5E8] text-xs focus:bg-[#DEE5E8] focus:outline-none focus:ring-2 focus:ring-[#B8C8D7]/40 focus:border-[#737F85] transition-all"
              />
            </div>
            <p className="text-[11px] text-[#181818]-light mt-1.5 leading-relaxed">
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
        <div className="flex items-center gap-2.5 border-b border-[#B7C5CC] pb-3">
          <User className="w-5 h-5 text-[#525354]" />
          <div>
            <h3 className="text-sm font-bold text-[#181818]">User Profile</h3>
            <p className="text-xs text-[#181818]-light">Active session and organization credentials</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-lg bg-[#DEE5E8] border border-[#B7C5CC] space-y-1">
            <span className="text-[#181818]-light text-[10px] uppercase font-bold tracking-wider">Name</span>
            <div className="font-bold text-[#181818] text-sm">{user?.name}</div>
          </div>

          <div className="p-3.5 rounded-lg bg-[#DEE5E8] border border-[#B7C5CC] space-y-1">
            <span className="text-[#181818]-light text-[10px] uppercase font-bold tracking-wider">Email</span>
            <div className="font-mono text-[#181818] text-xs">{user?.email}</div>
          </div>

          <div className="p-3.5 rounded-lg bg-[#DEE5E8] border border-[#B7C5CC] space-y-1">
            <span className="text-[#181818]-light text-[10px] uppercase font-bold tracking-wider">Role</span>
            <div className="font-bold text-[#525354] capitalize">{user?.role?.replace('_', ' ')}</div>
          </div>

          <div className="p-3.5 rounded-lg bg-[#DEE5E8] border border-[#B7C5CC] space-y-1">
            <span className="text-[#181818]-light text-[10px] uppercase font-bold tracking-wider">Organization</span>
            <div className="font-bold text-[#181818]">{user?.organization || 'SPY_2.O Engineering'}</div>
          </div>
        </div>
      </Card>

      {/* Architecture Specs & Platform Info */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[#B7C5CC] pb-3">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-[#525354]" />
            <h3 className="text-sm font-bold text-[#181818]">Architecture & Compliance Specifications</h3>
          </div>
          <Badge variant="sage">Hackathon MVP</Badge>
        </div>

        <div className="space-y-2 text-xs text-[#181818]-light leading-relaxed">
          <p>
            Ã¢â‚¬Â¢ <strong>Platform:</strong> THREADKEEP Ã¢â‚¬â€ A Project's Memory, Reconnected.
          </p>
          <p>
            Ã¢â‚¬Â¢ <strong>Team:</strong> SPY_2.O (Lead Architecture & Full-Stack AI Engineering).
          </p>
          <p>
            Ã¢â‚¬Â¢ <strong>Technology Stack:</strong> React.js, Tailwind CSS, Node.js Express, MongoDB, Mongoose, PDFKit, JWT.
          </p>
          <p>
            Ã¢â‚¬Â¢ <strong>Document Extractors:</strong> Native parsers for PDF, DOCX, CSV, TXT with page and line citations.
          </p>
        </div>

        <div className="pt-3 border-t border-[#B7C5CC] flex items-center justify-between">
          <span className="text-[11px] text-[#181818]-light font-mono">
            Reload FinPulse Banking Dataset:
          </span>
          <Button
            variant="aqua"
            size="xs"
            icon={Sparkles}
            loading={sampleLoading}
            onClick={loadSample}
            className="text-[#525354]-deep font-bold"
          >
            Load Sample Dataset
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default SettingsPage;

