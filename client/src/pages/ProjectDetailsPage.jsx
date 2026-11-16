import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  FolderGit2,
  FileText,
  Cpu,
  Radar,
  GitCompare,
  FileCheck2,
  Clock,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Edit3,
  Bot,
} from 'lucide-react';
import api from '../services/api';
import { useProject } from '../context/ProjectContext';
import { useToast } from '../context/ToastContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import HealthScoreBadge from '../components/common/HealthScoreBadge';

const ProjectDetailsPage = () => {
  const { id } = useParams();
  const { selectProject, currentProject } = useProject();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [activities, setActivities] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjectDetails = async () => {
      setLoading(true);
      try {
        const [projRes, docRes] = await Promise.all([
          api.get(`/projects/${id}`),
          api.get(`/documents/project/${id}`),
        ]);

        if (projRes.data?.success) {
          setProject(projRes.data.project);
          setActivities(projRes.data.recentActivities || []);
          selectProject(projRes.data.project._id);
        }
        if (docRes.data?.success) {
          setDocuments(docRes.data.documents || []);
        }
      } catch (err) {
        console.error('Failed to load project details:', err);
        addToast(err.response?.data?.message || 'Could not find project', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchProjectDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-xs font-mono text-[#525354] animate-pulse">Loading Project Details...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <Card className="p-8 text-center space-y-3">
        <h2 className="text-lg font-bold text-[#181818]">Project Not Found</h2>
        <Link to="/app/projects">
          <Button variant="primary" size="sm">Back to Projects</Button>
        </Link>
      </Card>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Meta */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#B7C5CC] pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#B7C5CC] text-[#181818]">
              {project.key}
            </span>
            <h1 className="text-2xl font-black text-[#181818]">{project.name}</h1>
            <Badge variant="aqua">{project.status}</Badge>
          </div>
          <p className="text-xs text-[#737F85]">
            Category: {project.category} Ã¢â‚¬Â¢ Target Domain: {project.targetDomain}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to={`/app/projects/${id}/companion`}>
            <Button variant="primary" size="sm" icon={Bot}>
              AI Companion
            </Button>
          </Link>
          <Link to="/app/documents">
            <Button variant="outline" size="sm" icon={FileText}>
              Document Center
            </Button>
          </Link>
          <Link to="/app/reconstruction">
            <Button variant="primary" size="sm" icon={Cpu}>
              Run Reconstruction
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Overview & Health */}
        <div className="space-y-6 lg:col-span-2">
          {/* Overview */}
          <Card className="p-6 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#737F85]">
              Project Overview & Continuity Mission
            </h3>
            <p className="text-sm text-[#181818] leading-relaxed">
              {project.description || 'No overview recorded. Ingest documents to extract objectives and background.'}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-[#B7C5CC] text-center text-xs">
              <div className="p-2.5 rounded-lg bg-[#DEE5E8]">
                <div className="text-[#737F85]">Documents</div>
                <div className="text-lg font-bold text-[#181818]">{documents.length}</div>
              </div>
              <div className="p-2.5 rounded-lg bg-[#DEE5E8]">
                <div className="text-[#737F85]">Open Gaps</div>
                <div className="text-lg font-bold text-[#737F85]">{project.stats?.openGaps || 0}</div>
              </div>
              <div className="p-2.5 rounded-lg bg-[#DEE5E8]">
                <div className="text-[#737F85]">Conflicts</div>
                <div className="text-lg font-bold text-[#525354]">{project.stats?.unresolvedConflicts || 0}</div>
              </div>
              <div className="p-2.5 rounded-lg bg-[#DEE5E8]">
                <div className="text-[#737F85]">Health Index</div>
                <div className="text-lg font-bold text-[#525354]">{project.healthScore || 0}%</div>
              </div>
            </div>
          </Card>

          {/* Ingested Documents */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#B7C5CC] pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#525354]" />
                <h3 className="text-sm font-bold text-[#181818]">Ingested Project Records</h3>
              </div>
              <Link to="/app/documents" className="text-xs font-bold text-[#525354] hover:underline">
                Manage Documents
              </Link>
            </div>

            {documents.length > 0 ? (
              <div className="space-y-2">
                {documents.map((doc) => (
                  <div key={doc._id} className="flex items-center justify-between p-3 rounded-lg bg-[#DEE5E8] border border-[#B7C5CC] text-xs">
                    <div className="flex items-center gap-3 truncate mr-2">
                      <span className="font-mono uppercase font-bold text-[10px] px-1.5 py-0.5 rounded bg-[#B7C5CC] text-[#181818]">
                        {doc.fileType}
                      </span>
                      <span className="font-semibold text-[#181818] truncate">{doc.originalName}</span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 text-[#737F85] font-mono text-[11px]">
                      <span>{doc.wordCount || 0} words</span>
                      <span>{doc.pageCount || 1} pgs</span>
                      <Badge variant="aqua">{doc.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-[#737F85] space-y-2">
                <p>No documents uploaded yet for this project.</p>
                <Link to="/app/documents">
                  <Button variant="secondary" size="xs">Upload First Document</Button>
                </Link>
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Health & Navigation Jump */}
        <div className="space-y-6">
          {/* Health Index Card */}
          <Card className="p-6 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#737F85]">
              Knowledge Health Rating
            </h3>
            <HealthScoreBadge score={project.healthScore || 0} size="lg" showDetails />
            <p className="text-xs text-[#737F85] leading-relaxed">
              Based on the ratio of confirmed facts, open critical blind spots in the Gap Radar, and unresolved technical disputes.
            </p>
          </Card>

          {/* Quick Pillar Actions */}
          <Card className="p-6 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#737F85]">
              Continuity Modules
            </h3>
            <div className="space-y-2">
              <Link
                to={`/app/projects/${id}/companion`}
                className="flex items-center justify-between rounded-lg border border-[#7FA99A] bg-[#E5F0EA] p-3 text-xs font-bold text-[#245C52] transition-all hover:bg-[#D5E8DD] hover:shadow-sm"
              >
                <div className="flex items-center gap-2.5">
                  <Bot className="h-4 w-4" />
                  <span>AI Project Companion</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>

              <Link
                to="/app/reconstruction"
                className="flex items-center justify-between p-2.5 rounded-lg border border-[#B7C5CC] hover:bg-[#B8C8D7]/40 transition-colors text-xs font-bold text-[#181818]"
              >
                <div className="flex items-center gap-2.5">
                  <Cpu className="w-4 h-4 text-[#525354]" />
                  <span>Reconstruction Engine</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[#737F85]" />
              </Link>

              <Link
                to="/app/gaps"
                className="flex items-center justify-between p-2.5 rounded-lg border border-[#B7C5CC] hover:bg-[#B7C5CC]/40 transition-colors text-xs font-bold text-[#181818]"
              >
                <div className="flex items-center gap-2.5">
                  <Radar className="w-4 h-4 text-[#737F85]" />
                  <span>Knowledge Gap Radar</span>
                </div>
                <Badge variant="sage" size="xs">{project.stats?.openGaps || 0}</Badge>
              </Link>

              <Link
                to="/app/conflicts"
                className="flex items-center justify-between p-2.5 rounded-lg border border-[#B7C5CC] hover:bg-[#B7C5CC]/40 transition-colors text-xs font-bold text-[#181818]"
              >
                <div className="flex items-center gap-2.5">
                  <GitCompare className="w-4 h-4 text-[#525354]" />
                  <span>Conflict Workspace</span>
                </div>
                <Badge variant="aqua" size="xs">{project.stats?.unresolvedConflicts || 0}</Badge>
              </Link>

              <Link
                to="/app/handover"
                className="flex items-center justify-between p-2.5 rounded-lg border border-[#B7C5CC] hover:bg-[#B8C8D7]/40 transition-colors text-xs font-bold text-[#181818]"
              >
                <div className="flex items-center gap-2.5">
                  <FileCheck2 className="w-4 h-4 text-[#525354]" />
                  <span>Handover Dossier</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[#737F85]" />
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailsPage;


