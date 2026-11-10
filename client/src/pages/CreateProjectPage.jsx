import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderPlus, ArrowRight, Layers, Sparkles } from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';

const CreateProjectPage = () => {
  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Software Engineering');
  const [targetDomain, setTargetDomain] = useState('Fintech / Enterprise');
  const [loading, setLoading] = useState(false);

  const { fetchProjects, selectProject } = useProject();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleNameChange = (val) => {
    setName(val);
    if (!key) {
      setKey(val.split(' ').map((w) => w[0]).join('').substring(0, 5).toUpperCase());
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      addToast('Project name is required.', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/projects', {
        name,
        key: key || name.substring(0, 4).toUpperCase(),
        description,
        category,
        targetDomain,
      });

      if (res.data?.success) {
        addToast(`Project "${name}" created successfully.`, 'success');
        await fetchProjects(res.data.project._id);
        selectProject(res.data.project._id);
        navigate(`/app/projects/${res.data.project._id}`);
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to create project', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="border-b border-sage/30 pb-4">
        <h1 className="text-2xl font-black text-charcoal">Create New Project Repository</h1>
        <p className="text-xs text-charcoal-light mt-0.5">
          Initialize a new project workspace for document ingestion and AI knowledge continuity.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Form */}
        <Card className="p-6 md:col-span-2 space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
                Project Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. FinPulse: Core Banking Settlement"
                required
                className="w-full px-3.5 py-2.5 rounded-lg border border-sage/40 bg-ivory text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal/20 focus:border-teal transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
                  Project Key (Prefix)
                </label>
                <input
                  type="text"
                  value={key}
                  onChange={(e) => setKey(e.target.value.toUpperCase())}
                  placeholder="e.g. FINP"
                  maxLength={6}
                  className="w-full px-3 py-2 rounded-lg border border-sage/40 bg-ivory text-xs font-mono font-bold uppercase focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal/20 focus:border-teal transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-sage/40 bg-ivory text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal/20 focus:border-teal transition-all"
                >
                  <option value="Software Engineering">Software Engineering</option>
                  <option value="Fintech & Banking">Fintech & Banking</option>
                  <option value="DevOps & Cloud">DevOps & Cloud</option>
                  <option value="AI & Machine Learning">AI & Machine Learning</option>
                  <option value="Cybersecurity">Cybersecurity</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
                Target Domain
              </label>
              <input
                type="text"
                value={targetDomain}
                onChange={(e) => setTargetDomain(e.target.value)}
                placeholder="e.g. High-Throughput Ledger Services"
                className="w-full px-3.5 py-2 rounded-lg border border-sage/40 bg-ivory text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal/20 focus:border-teal transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
                Project Overview & Intent
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Briefly describe the project's background, target objectives, or departure context..."
                className="w-full px-3.5 py-2 rounded-lg border border-sage/40 bg-ivory text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal/20 focus:border-teal transition-all"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={loading}
              className="w-full mt-2"
              icon={ArrowRight}
              iconPosition="right"
            >
              Initialize Workspace
            </Button>
          </form>
        </Card>

        {/* Live Preview Card */}
        <div className="space-y-4">
          <div className="text-xs font-bold uppercase tracking-wider text-charcoal-light">
            Live Repository Preview
          </div>
          <Card className="p-5 border-teal/40 bg-mint-light/40 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-teal text-ivory">
                {key || 'PROJ'}
              </span>
              <Badge variant="teal">Draft</Badge>
            </div>

            <div>
              <h3 className="font-bold text-base text-charcoal">
                {name || 'Untitled Project Repository'}
              </h3>
              <p className="text-xs text-charcoal-light mt-1">
                Domain: {targetDomain || 'Enterprise Infrastructure'}
              </p>
            </div>

            <p className="text-xs text-charcoal leading-relaxed line-clamp-3">
              {description || 'Provide an overview to help incoming contributors understand the mission.'}
            </p>

            <div className="pt-3 border-t border-sage/30 text-[11px] text-teal font-medium">
              Ready for Document Ingestion (PDF, DOCX, CSV, TXT)
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CreateProjectPage;
