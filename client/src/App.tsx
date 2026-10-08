import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { HowToUseModal } from './components/HowToUseModal';

// Route Guards
import {
  ProtectedRoute,
  VerifiedEmailRoute,
  RoleRoute,
  AccountStatusGate,
} from './components/guards/RouteGuards';

// Pages
import AuthPage from './pages/AuthPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import PublicComplaintsPage from './pages/PublicComplaintsPage';

// Dashboards
import UserDashboard from './pages/dashboards/UserDashboard';
import ProfessionalDashboard from './pages/dashboards/ProfessionalDashboard';
import AuthorityDashboard from './pages/dashboards/AuthorityDashboard';
import WorkerDashboard from './pages/dashboards/WorkerDashboard';

// Operational Pages
import SocialFeedPage from './pages/SocialFeedPage';
import { DailyPlanPage } from './pages/DailyPlanPage';
import { WorkOrdersPage } from './pages/WorkOrdersPage';
import { ComplaintsPage } from './pages/ComplaintsPage';
import { ReportPage } from './pages/ReportPage';
import { CrewsPage } from './pages/CrewsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import HotspotsPage from './pages/HotspotsPage';
import ApprovalsPage from './pages/ApprovalsPage';
import UsersAdminPage from './pages/UsersAdminPage';
import AuditLogPage from './pages/AuditLogPage';
import MyActivityPage from './pages/MyActivityPage';
import ProfilePage from './pages/ProfilePage';

function DashboardRedirector() {
  const { role, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/public-complaints" replace />;
  switch (role) {
    case 'AUTHORITY':
      return <Navigate to="/authority" replace />;
    case 'WORKER':
      return <Navigate to="/worker" replace />;
    case 'PROFESSIONAL':
      return <Navigate to="/professional" replace />;
    case 'USER':
    default:
      return <Navigate to="/user" replace />;
  }
}

function MainLayout({ children }: { children: React.ReactNode }) {
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col font-sans selection:bg-blue-900 selection:text-white">
      <Header onOpenHelp={() => setIsHelpOpen(true)} />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar onOpenHelp={() => setIsHelpOpen(true)} />

        <main className="flex-1 overflow-y-auto bg-[#F8FAFC] p-4 md:p-6">
          {children}
        </main>
      </div>

      <HowToUseModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/login" element={<Navigate to="/auth?mode=login" replace />} />
      <Route path="/signup" element={<Navigate to="/auth?mode=signup" replace />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* Public Complaints Feed */}
      <Route
        path="/public-complaints"
        element={
          <MainLayout>
            <PublicComplaintsPage />
          </MainLayout>
        }
      />

      {/* Legacy Route Redirector */}
      <Route path="/" element={<DashboardRedirector />} />
      <Route path="/dashboard" element={<DashboardRedirector />} />
      <Route path="/field" element={<Navigate to="/worker" replace />} />

      {/* Authenticated Account Routes */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <VerifiedEmailRoute>
              <AccountStatusGate>
                <MainLayout>
                  <ProfilePage />
                </MainLayout>
              </AccountStatusGate>
            </VerifiedEmailRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/my-activity"
        element={
          <ProtectedRoute>
            <VerifiedEmailRoute>
              <AccountStatusGate>
                <MainLayout>
                  <MyActivityPage />
                </MainLayout>
              </AccountStatusGate>
            </VerifiedEmailRoute>
          </ProtectedRoute>
        }
      />

      {/* USER Role Routes */}
      <Route
        path="/user"
        element={
          <ProtectedRoute>
            <VerifiedEmailRoute>
              <AccountStatusGate>
                <RoleRoute allowedRoles={['USER']}>
                  <MainLayout>
                    <UserDashboard />
                  </MainLayout>
                </RoleRoute>
              </AccountStatusGate>
            </VerifiedEmailRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/report"
        element={
          <ProtectedRoute>
            <VerifiedEmailRoute>
              <AccountStatusGate>
                <MainLayout>
                  <ReportPage />
                </MainLayout>
              </AccountStatusGate>
            </VerifiedEmailRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/my-reports"
        element={
          <ProtectedRoute>
            <VerifiedEmailRoute>
              <AccountStatusGate>
                <RoleRoute allowedRoles={['USER']}>
                  <MainLayout>
                    <UserDashboard />
                  </MainLayout>
                </RoleRoute>
              </AccountStatusGate>
            </VerifiedEmailRoute>
          </ProtectedRoute>
        }
      />

      {/* PROFESSIONAL Role Routes */}
      <Route
        path="/professional"
        element={
          <ProtectedRoute>
            <VerifiedEmailRoute>
              <AccountStatusGate>
                <RoleRoute allowedRoles={['PROFESSIONAL']}>
                  <MainLayout>
                    <ProfessionalDashboard />
                  </MainLayout>
                </RoleRoute>
              </AccountStatusGate>
            </VerifiedEmailRoute>
          </ProtectedRoute>
        }
      />

      {/* WORKER Role Routes */}
      <Route
        path="/worker"
        element={
          <ProtectedRoute>
            <VerifiedEmailRoute>
              <AccountStatusGate>
                <RoleRoute allowedRoles={['WORKER']}>
                  <MainLayout>
                    <WorkerDashboard />
                  </MainLayout>
                </RoleRoute>
              </AccountStatusGate>
            </VerifiedEmailRoute>
          </ProtectedRoute>
        }
      />

      {/* AUTHORITY Role Routes */}
      <Route
        path="/authority"
        element={
          <ProtectedRoute>
            <VerifiedEmailRoute>
              <AccountStatusGate>
                <RoleRoute allowedRoles={['AUTHORITY']}>
                  <MainLayout>
                    <AuthorityDashboard />
                  </MainLayout>
                </RoleRoute>
              </AccountStatusGate>
            </VerifiedEmailRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/feed"
        element={
          <ProtectedRoute>
            <VerifiedEmailRoute>
              <AccountStatusGate>
                <MainLayout>
                  <SocialFeedPage />
                </MainLayout>
              </AccountStatusGate>
            </VerifiedEmailRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/daily-plan"
        element={
          <ProtectedRoute>
            <VerifiedEmailRoute>
              <AccountStatusGate>
                <RoleRoute allowedRoles={['AUTHORITY']}>
                  <MainLayout>
                    <DailyPlanPage />
                  </MainLayout>
                </RoleRoute>
              </AccountStatusGate>
            </VerifiedEmailRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/work-orders"
        element={
          <ProtectedRoute>
            <VerifiedEmailRoute>
              <AccountStatusGate>
                <RoleRoute allowedRoles={['AUTHORITY']}>
                  <MainLayout>
                    <WorkOrdersPage />
                  </MainLayout>
                </RoleRoute>
              </AccountStatusGate>
            </VerifiedEmailRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/work-orders/:id"
        element={
          <ProtectedRoute>
            <VerifiedEmailRoute>
              <AccountStatusGate>
                <RoleRoute allowedRoles={['AUTHORITY']}>
                  <MainLayout>
                    <WorkOrdersPage />
                  </MainLayout>
                </RoleRoute>
              </AccountStatusGate>
            </VerifiedEmailRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/complaints"
        element={
          <ProtectedRoute>
            <VerifiedEmailRoute>
              <AccountStatusGate>
                <RoleRoute allowedRoles={['AUTHORITY']}>
                  <MainLayout>
                    <ComplaintsPage />
                  </MainLayout>
                </RoleRoute>
              </AccountStatusGate>
            </VerifiedEmailRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/complaints/:id"
        element={
          <ProtectedRoute>
            <VerifiedEmailRoute>
              <AccountStatusGate>
                <RoleRoute allowedRoles={['AUTHORITY']}>
                  <MainLayout>
                    <ComplaintsPage />
                  </MainLayout>
                </RoleRoute>
              </AccountStatusGate>
            </VerifiedEmailRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/crews"
        element={
          <ProtectedRoute>
            <VerifiedEmailRoute>
              <AccountStatusGate>
                <RoleRoute allowedRoles={['AUTHORITY']}>
                  <MainLayout>
                    <CrewsPage />
                  </MainLayout>
                </RoleRoute>
              </AccountStatusGate>
            </VerifiedEmailRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            <VerifiedEmailRoute>
              <AccountStatusGate>
                <RoleRoute allowedRoles={['AUTHORITY']}>
                  <MainLayout>
                    <AnalyticsPage />
                  </MainLayout>
                </RoleRoute>
              </AccountStatusGate>
            </VerifiedEmailRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/hotspots"
        element={
          <ProtectedRoute>
            <VerifiedEmailRoute>
              <AccountStatusGate>
                <RoleRoute allowedRoles={['AUTHORITY']}>
                  <MainLayout>
                    <HotspotsPage />
                  </MainLayout>
                </RoleRoute>
              </AccountStatusGate>
            </VerifiedEmailRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/approvals"
        element={
          <ProtectedRoute>
            <VerifiedEmailRoute>
              <AccountStatusGate>
                <RoleRoute allowedRoles={['AUTHORITY']}>
                  <MainLayout>
                    <ApprovalsPage />
                  </MainLayout>
                </RoleRoute>
              </AccountStatusGate>
            </VerifiedEmailRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/users"
        element={
          <ProtectedRoute>
            <VerifiedEmailRoute>
              <AccountStatusGate>
                <RoleRoute allowedRoles={['AUTHORITY']}>
                  <MainLayout>
                    <UsersAdminPage />
                  </MainLayout>
                </RoleRoute>
              </AccountStatusGate>
            </VerifiedEmailRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/audit-log"
        element={
          <ProtectedRoute>
            <VerifiedEmailRoute>
              <AccountStatusGate>
                <RoleRoute allowedRoles={['AUTHORITY']}>
                  <MainLayout>
                    <AuditLogPage />
                  </MainLayout>
                </RoleRoute>
              </AccountStatusGate>
            </VerifiedEmailRoute>
          </ProtectedRoute>
        }
      />

      {/* Catch-all Redirect */}
      <Route path="*" element={<DashboardRedirector />} />
    </Routes>
  );
}

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
