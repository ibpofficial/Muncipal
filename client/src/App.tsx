import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { HowToUseModal } from './components/HowToUseModal';
import LoginPage from './pages/LoginPage';
import SocialFeedPage from './pages/SocialFeedPage';
import { DashboardPage } from './pages/DashboardPage';
import { DailyPlanPage } from './pages/DailyPlanPage';
import { WorkOrdersPage } from './pages/WorkOrdersPage';
import { ComplaintsPage } from './pages/ComplaintsPage';
import { ReportPage } from './pages/ReportPage';
import { CrewsPage } from './pages/CrewsPage';
import FieldPage from './pages/FieldPage';
import AnalyticsPage from './pages/AnalyticsPage';
import HotspotsPage from './pages/HotspotsPage';
import { UserRole } from './types';

function AppContent() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true); // default true for instant demo access
  const [role, setRole] = useState<UserRole>('OFFICER');
  const [currentUser, setCurrentUser] = useState<{ email: string; name: string; crewId?: string } | null>({
    email: 'officer@municipal.gov',
    name: 'MUNICIPAL OFFICER',
  });
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);

  const navigate = useNavigate();

  const handleLoginSuccess = (user: { email: string; role: UserRole; crewId?: string; name: string }) => {
    setIsAuthenticated(true);
    setRole(user.role);
    setCurrentUser(user);
  };

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    if (newRole === 'FIELD_CREW') {
      navigate('/field');
    } else if (newRole === 'OFFICER' || newRole === 'SUPERVISOR') {
      navigate('/dashboard');
    }
  };

  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col font-sans selection:bg-blue-900 selection:text-white">
      {/* Header */}
      <Header
        currentRole={role}
        onRoleChange={handleRoleChange}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      {/* Demo Banner */}
      <div className="bg-amber-500 text-slate-950 px-4 py-1 text-center text-xs font-black tracking-wider flex items-center justify-center space-x-2 shadow-sm">
        <span>DEMO ENVIRONMENT</span>
        <span className="opacity-75">•</span>
        <span className="font-semibold">MUNICIPAL ROAD OPERATIONS CONTROL CENTER</span>
        <span className="opacity-75 hidden md:inline">•</span>
        <button
          onClick={() => setIsHelpOpen(true)}
          className="underline font-extrabold hover:text-white hidden md:inline ml-2"
        >
          [How to Use App Guide]
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Hide sidebar when in field crew mobile view */}
        <Sidebar onOpenHelp={() => setIsHelpOpen(true)} />

        <main className="flex-1 overflow-y-auto bg-[#F8FAFC] p-4 md:p-6">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/login" element={<LoginPage onLoginSuccess={handleLoginSuccess} />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/feed" element={<SocialFeedPage />} />
            <Route path="/daily-plan" element={<DailyPlanPage />} />
            <Route path="/work-orders" element={<WorkOrdersPage />} />
            <Route path="/work-orders/:id" element={<WorkOrdersPage />} />
            <Route path="/field" element={<FieldPage />} />
            <Route path="/field/work-orders/:id" element={<FieldPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/hotspots" element={<HotspotsPage />} />
            <Route path="/complaints" element={<ComplaintsPage />} />
            <Route path="/complaints/:id" element={<ComplaintsPage />} />
            <Route path="/report" element={<ReportPage />} />
            <Route path="/crews" element={<CrewsPage />} />
            <Route path="/crews/:id" element={<CrewsPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>

      {/* How to Use Onboarding Guide Modal */}
      <HowToUseModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </div>
  );
}

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
};

export default App;
