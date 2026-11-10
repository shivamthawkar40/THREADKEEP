import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FolderGit2,
  Plus,
  Search,
  Sparkles,
  Trash2,
  FileText,
  Radar,
  GitCompare,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import HealthScoreBadge from '../components/common/HealthScoreBadge';
import Modal from '../components/common/Modal';

const ProjectsPage = () => {
  const { projects, currentProject, selectProject, fetchProjects, loadSample, sampleLoading } = useProject();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const filteredProjects = projects.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.key?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || p.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = async () => {
    if (!projectToDelete) return;
    setDeleting(true);
    try {
      await api.delete(`/projects/${projectToDelete._id}`);
      addToast(`Project "${projectToDelete.name}" deleted.`, 'success');
      setDeleteModalOpen(false);
      setProjectToDelete(null);
      await fetchProjects();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to delete project', 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sage/30 pb-5">
        <div>
          <h1 className="text-2xl font-black text-charcoal">Project Repositories</h1>
          <p className="text-xs text-charcoal-light mt-0.5">
            Manage projects, review historical handovers, and track knowledge completeness.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="aqua"
            size="sm"
            icon={Sparkles}
            loading={sampleLoading}
            onClick={loadSample}
            className="text-teal-deep font-bold"
          >
            Load Sample Project
          </Button>

          <Link to="/app/projects/create">
            <Button variant="primary" size="sm" icon={Plus}>
              New Project
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-charcoal-light absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search projects by name, key, or domain..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-sage/40 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-teal/20 focus:border-teal transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {['all', 'active', 'reconstructed', 'in_review'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                filterStatus === status
                  ? 'bg-teal text-ivory'
                  : 'bg-white border border-sage/30 text-charcoal hover:bg-ivory'
              }`}
            >
              {status.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((project) => {
            const isSelected = project._id === currentProject?._id;
            return (
              <Card
                key={project._id}
                hover
                className={`flex flex-col justify-between p-5 transition-all ${
                  isSelected ? 'border-teal ring-1 ring-teal/30 bg-mint/10' : ''
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] font-bold px-1.5 py-0.5 rounded bg-sage/30 text-charcoal">
                          {project.key || 'PROJ'}
                        </span>
                        {isSelected && <Badge variant="teal">Active</Badge>}
                      </div>
                      <h3 className="font-bold text-base text-charcoal mt-1 line-clamp-1">
                        {project.name}
                      </h3>
                    </div>
                    <HealthScoreBadge score={project.healthScore || 0} size="sm" />
                  </div>

                  <p className="text-xs text-charcoal-light line-clamp-2 leading-relaxed">
                    {project.description || 'No description recorded. Ingest documents to populate overview.'}
                  </p>

                  <div className="text-[11px] font-medium text-teal flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal" />
                    <span>Domain: {project.targetDomain || 'Enterprise'}</span>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-sage/20 space-y-3">
                  <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                    <div className="p-1.5 rounded bg-ivory">
                      <div className="text-charcoal-light">Docs</div>
                      <div className="font-bold text-charcoal">{project.stats?.totalDocuments || 0}</div>
                    </div>
                    <div className="p-1.5 rounded bg-ivory">
                      <div className="text-charcoal-light">Gaps</div>
                      <div className="font-bold text-coral-dark">{project.stats?.openGaps || 0}</div>
                    </div>
                    <div className="p-1.5 rounded bg-ivory">
                      <div className="text-charcoal-light">Conflicts</div>
                      <div className="font-bold text-gold-dark">{project.stats?.unresolvedConflicts || 0}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <Button
                      variant={isSelected ? 'secondary' : 'outline'}
                      size="xs"
                      onClick={() => selectProject(project._id)}
                    >
                      {isSelected ? 'Active Workspace' : 'Set as Active'}
                    </Button>

                    <div className="flex items-center gap-1">
                      <Link to={`/app/projects/${project._id}`}>
                        <Button variant="ghost" size="xs" icon={ExternalLink}>
                          Details
                        </Button>
                      </Link>
                      <button
                        onClick={() => {
                          setProjectToDelete(project);
                          setDeleteModalOpen(true);
                        }}
                        className="p-1.5 rounded text-charcoal-light hover:text-coral-dark hover:bg-rose-50"
                        title="Delete Project"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-12 text-center space-y-4">
          <FolderGit2 className="w-12 h-12 text-sage mx-auto" />
          <h3 className="text-base font-bold text-charcoal">No projects match your filter</h3>
          <p className="text-xs text-charcoal-light max-w-sm mx-auto">
            Try adjusting your search criteria or create a new project repository.
          </p>
          <div className="pt-2">
            <Link to="/app/projects/create">
              <Button variant="primary" size="sm" icon={Plus}>
                Create New Project
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirm Project Deletion"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-xs text-charcoal leading-relaxed">
            Are you sure you want to delete <strong className="text-coral-dark">{projectToDelete?.name}</strong>?
            This will permanently remove all associated documents, extracted facts, knowledge gaps, and handovers.
          </p>
          <div className="flex justify-end gap-2 pt-2 border-t border-ivory-dark">
            <Button variant="outline" size="sm" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" loading={deleting} onClick={handleDelete}>
              Delete Project
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProjectsPage;
