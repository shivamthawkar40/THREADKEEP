import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import AppLayout from './layouts/AppLayout';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProjectsPage from './pages/ProjectsPage';
import CreateProjectPage from './pages/CreateProjectPage';
import ProjectDetailsPage from './pages/ProjectDetailsPage';
import DocumentCenterPage from './pages/DocumentCenterPage';
import ReconstructionPage from './pages/ReconstructionPage';
import KnowledgeGapRadarPage from './pages/KnowledgeGapRadarPage';
import ConflictDetectionPage from './pages/ConflictDetectionPage';
import EvidenceExplorerPage from './pages/EvidenceExplorerPage';
import HumanReviewPage from './pages/HumanReviewPage';
import HandoverGeneratorPage from './pages/HandoverGeneratorPage';
import SettingsPage from './pages/SettingsPage';

// Protected Route Guard
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ivory">
        <div className="text-xs font-mono font-bold text-teal animate-pulse">
          THREADKEEP // VERIFYING AUTHENTICATION...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Authenticated SaaS Workspace Routes */}
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/app/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="projects/create" element={<CreateProjectPage />} />
        <Route path="projects/:id" element={<ProjectDetailsPage />} />
        <Route path="documents" element={<DocumentCenterPage />} />
        <Route path="reconstruction" element={<ReconstructionPage />} />
        <Route path="gaps" element={<KnowledgeGapRadarPage />} />
        <Route path="conflicts" element={<ConflictDetectionPage />} />
        <Route path="evidence" element={<EvidenceExplorerPage />} />
        <Route path="reviews" element={<HumanReviewPage />} />
        <Route path="handover" element={<HandoverGeneratorPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
