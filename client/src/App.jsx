import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import PublicLayout from './layouts/PublicLayout';
import AppLayout from './layouts/AppLayout';

const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const ProjectsPage = lazy(() => import('./pages/ProjectsPage'));
const CreateProjectPage = lazy(() => import('./pages/CreateProjectPage'));
const ProjectDetailsPage = lazy(() => import('./pages/ProjectDetailsPage'));
const AIProjectCompanionPage = lazy(() => import('./pages/AIProjectCompanionPage'));
const DocumentCenterPage = lazy(() => import('./pages/DocumentCenterPage'));
const TrashPage = lazy(() => import('./pages/TrashPage'));
const ReconstructionPage = lazy(() => import('./pages/ReconstructionPage'));
const KnowledgeGapRadarPage = lazy(() => import('./pages/KnowledgeGapRadarPage'));
const ConflictDetectionPage = lazy(() => import('./pages/ConflictDetectionPage'));
const EvidenceExplorerPage = lazy(() => import('./pages/EvidenceExplorerPage'));
const HumanReviewPage = lazy(() => import('./pages/HumanReviewPage'));
const HandoverGeneratorPage = lazy(() => import('./pages/HandoverGeneratorPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#DEE5E8]">
    <div className="text-xs font-mono font-bold text-[#526574] animate-pulse">
      THREADKEEP // LOADING...
    </div>
  </div>
);

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
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

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
          <Route path="projects/:id/companion" element={<AIProjectCompanionPage />} />
          <Route path="documents" element={<DocumentCenterPage />} />
          <Route path="trash" element={<TrashPage />} />
          <Route path="reconstruction" element={<ReconstructionPage />} />
          <Route path="gaps" element={<KnowledgeGapRadarPage />} />
          <Route path="conflicts" element={<ConflictDetectionPage />} />
          <Route path="evidence" element={<EvidenceExplorerPage />} />
          <Route path="reviews" element={<HumanReviewPage />} />
          <Route path="handover" element={<HandoverGeneratorPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;


