import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const ProjectContext = createContext(null);

export const ProjectProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sampleLoading, setSampleLoading] = useState(false);

  const fetchProjects = useCallback(async (selectId = null) => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const res = await api.get('/projects');
      if (res.data?.success) {
        setProjects(res.data.projects);
        
        // Retain current selection or select the latest project
        if (selectId) {
          const matched = res.data.projects.find((p) => p._id === selectId);
          if (matched) setCurrentProject(matched);
        } else if (res.data.projects.length > 0) {
          setCurrentProject((prev) => {
            if (prev) {
              const stillExists = res.data.projects.find((p) => p._id === prev._id);
              return stillExists || res.data.projects[0];
            }
            return res.data.projects[0];
          });
        } else {
          setCurrentProject(null);
        }
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const loadSample = async () => {
    setSampleLoading(true);
    try {
      addToast('Ingesting multi-document FinPulse dataset & running AI pipeline...', 'info', 'Loading Sample');
      const res = await api.post('/sample/load');
      if (res.data?.success) {
        addToast('Realistic FinPulse banking project loaded with full citations & health scores!', 'success', 'Sample Ready');
        await fetchProjects(res.data.project._id);
        return res.data.project;
      }
    } catch (err) {
      console.error('Failed to load sample project:', err);
      addToast(err.response?.data?.message || err.message || 'Could not load sample project', 'error', 'Error');
    } finally {
      setSampleLoading(false);
    }
  };

  const selectProject = (projectId) => {
    const found = projects.find((p) => p._id === projectId);
    if (found) {
      setCurrentProject(found);
    }
  };

  return (
    <ProjectContext.Provider
      value={{
        projects,
        currentProject,
        loading,
        sampleLoading,
        fetchProjects,
        loadSample,
        selectProject,
        setCurrentProject,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};
