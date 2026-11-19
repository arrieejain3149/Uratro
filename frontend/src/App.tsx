import { useState, useRef, useEffect, useCallback } from 'react';
import ThreeScene from './components/ThreeScene';
import AtmosphereBackground from './components/AtmosphereBackground';
import LeftSidebar from './components/LeftSidebar';
import TopNavbar from './components/TopNavbar';
import HeroOverlay from './components/HeroOverlay';
import BottomEditorialBar from './components/BottomEditorialBar';
import type { TabKey } from './components/BottomDock';
import TopologyTab from './components/tabs/TopologyTab';
import AnalyticsTab from './components/tabs/AnalyticsTab';
import FleetTab from './components/tabs/FleetTab';
import IncidentsTab from './components/tabs/IncidentsTab';
import SimulatorTab from './components/tabs/SimulatorTab';
import WorkbenchTab from './components/tabs/WorkbenchTab';
import SchemaTab from './components/tabs/SchemaTab';
import PassengerPortal from './components/portals/PassengerPortal';
import EmployeePortal from './components/portals/EmployeePortal';
import AdminPortal from './components/portals/AdminPortal';
import AuthModal from './components/AuthModal';
import DispatchModal from './components/DispatchModal';
import IntroLoader from './components/IntroLoader';
import CursorCanvas from './components/CursorCanvas';
import type { AuthUser } from './types/auth';
import { GUEST_USER } from './types/auth';
import { ShieldAlert } from 'lucide-react';

export default function App() {
  // 1-by Default: Not logged in (Guest), Landing on Overview ('index')
  const [activeTab, setActiveTab] = useState<TabKey>('index');
  const [isDispatchOpen, setIsDispatchOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [kpis, setKpis] = useState<any>(null);
  const [showIntro, setShowIntro] = useState(true);

  // Decoupled Auth User State: defaults to GUEST_USER (No auto-login)
  const [authUser, setAuthUser] = useState<AuthUser>(() => {
    try {
      const saved = sessionStorage.getItem('uratro_auth_user');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}
    return GUEST_USER;
  });

  // Mouse coords for 3D parallax & HUD
  const mouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const fetchKpis = () => {
    fetch('/api/v1/analytics/kpis')
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'success') {
          setKpis(data.data);
        }
      })
      .catch((err) => console.error('Error fetching KPIs:', err));
  };

  useEffect(() => {
    fetchKpis();
    const interval = setInterval(fetchKpis, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;

    // Normalized coordinates (-1 to +1) for 3D parallax
    const normX = (clientX / innerWidth) * 2 - 1;
    const normY = -(clientY / innerHeight) * 2 + 1;
    mouseRef.current = { x: normX, y: normY };
  };

  const handleIntroComplete = useCallback(() => {
    setShowIntro(false);
  }, []);

  const handleLogin = (user: AuthUser) => {
    setAuthUser(user);
    try {
      sessionStorage.setItem('uratro_auth_user', JSON.stringify(user));
    } catch {}

    // Navigate to respective workspace portal upon login
    if (user.role === 'passenger') {
      setActiveTab('passenger');
    } else if (user.role === 'employee') {
      setActiveTab('employee');
    } else if (user.role === 'admin') {
      setActiveTab('admin');
    }
  };

  const handleLogout = () => {
    setAuthUser(GUEST_USER);
    try {
      sessionStorage.removeItem('uratro_auth_user');
    } catch {}
    setActiveTab('index');
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      className="relative w-screen h-screen bg-[#121214] overflow-hidden select-none text-white font-sans"
    >
      {/* Deep Cosmic Starfield Backdrop */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center pointer-events-none opacity-40"
        style={{ backgroundImage: "url('/starfield-bg.jpg')" }}
      />

      {/* Cinematic Studio Radial Vignette & Warm Charcoal Mask */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,rgba(26,26,30,0.1)_0%,rgba(18,18,20,0.8)_65%,#121214_100%)] pointer-events-none" />

      {/* Moving organic dark smoke / atmospheric ambient nebula */}
      <AtmosphereBackground />

      {/* Fluid Cursor Ribbon Trail */}
      <CursorCanvas />

      {/* Slender Left Vertical Sidebar Strip with Hamburger Menu (Role-gated) */}
      <LeftSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenDispatch={() => setIsDispatchOpen(true)}
        userRole={authUser.role}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Sleek Minimalist Top Navigation Bar with Role Switcher & Login */}
      <TopNavbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenDispatch={() => setIsDispatchOpen(true)}
        authUser={authUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="relative ml-14 sm:ml-16 w-[calc(100vw-3.5rem)] sm:w-[calc(100vw-4rem)] h-screen overflow-hidden">
        {/* TAB 1: HERO OVERVIEW (3D Showcase with Aer-style Editorial Layout - Publicly Accessible) */}
        {activeTab === 'index' && (
          <div className="w-full h-full relative">
            <ThreeScene mouse={mouseRef} />
            <HeroOverlay onTabChange={setActiveTab} kpis={kpis} mouse={mouseRef} />
          </div>
        )}

        {/* TAB 2: METRO MAP (Topology - Publicly Accessible) */}
        {activeTab === 'topology' && (
          <div className="w-full h-full relative z-20 pt-16 sm:pt-20 pb-16">
            <TopologyTab onNavigateToSimulator={() => setActiveTab('passenger')} />
          </div>
        )}

        {/* PORTAL 03: PASSENGER PORTAL & DIGITAL TICKET KIOSK */}
        {activeTab === 'passenger' && (
          <div className="w-full h-full relative z-20 pt-16 sm:pt-20 pb-16">
            {authUser.role !== 'guest' ? (
              <PassengerPortal
                authUser={authUser}
                onOpenAuthModal={() => setIsAuthModalOpen(true)}
              />
            ) : (
              <LockedNotice
                title="Ticket Pass Locked"
                description="Please log in with a Passenger ID to book tickets, generate digital receipt passes, and access your passbook."
                onOpenLogin={() => setIsAuthModalOpen(true)}
              />
            )}
          </div>
        )}

        {/* PORTAL 02: OPERATIONS AND MAINTENANCE */}
        {activeTab === 'employee' && (
          <div className="w-full h-full relative z-20 pt-16 sm:pt-20 pb-16">
            {authUser.role === 'employee' || authUser.role === 'admin' ? (
              <EmployeePortal
                authUser={authUser}
                onOpenAuthModal={() => setIsAuthModalOpen(true)}
                onOpenDispatchModal={() => setIsDispatchOpen(true)}
              />
            ) : (
              <LockedNotice
                title="Operations and Maintenance Locked"
                description="Staff credentials required. Log in with your Employee ID and passcode to view shift rosters and maintenance schedules."
                onOpenLogin={() => setIsAuthModalOpen(true)}
              />
            )}
          </div>
        )}

        {/* PORTAL 01: EXECUTIVE ADMIN DATA FEEDER */}
        {activeTab === 'admin' && (
          <div className="w-full h-full relative z-20 pt-16 sm:pt-20 pb-16">
            {authUser.role === 'admin' ? (
              <AdminPortal
                authUser={authUser}
                onOpenAuthModal={() => setIsAuthModalOpen(true)}
                onOpenWorkbench={() => setActiveTab('workbench')}
                onOpenSchema={() => setActiveTab('schema')}
              />
            ) : (
              <LockedNotice
                title="Data Feeder Locked"
                description="Executive administrative clearance required. Please log in with the Admin passcode to access the Data Feeder."
                onOpenLogin={() => setIsAuthModalOpen(true)}
              />
            )}
          </div>
        )}

        {/* TAB: PASSENGER STATS (Analytics - Accessible to Employee and Admin) */}
        {activeTab === 'analytics' && (
          <div className="w-full h-full relative z-20 pt-16 sm:pt-20 pb-16">
            {authUser.role === 'employee' || authUser.role === 'admin' ? (
              <AnalyticsTab />
            ) : (
              <LockedNotice
                title="Passenger Analytics Locked"
                description="Detailed crowd telemetry and passenger revenue stats require staff or admin login."
                onOpenLogin={() => setIsAuthModalOpen(true)}
              />
            )}
          </div>
        )}

        {/* TAB: TRAINS (Accessible to Employee and Admin) */}
        {activeTab === 'fleet' && (
          <div className="w-full h-full relative z-20 pt-16 sm:pt-20 pb-16">
            {authUser.role === 'employee' || authUser.role === 'admin' ? (
              <FleetTab />
            ) : (
              <LockedNotice
                title="Trains Locked"
                description="Rolling stock monitoring, rake health telemetry, and maintenance logs require staff login."
                onOpenLogin={() => setIsAuthModalOpen(true)}
              />
            )}
          </div>
        )}

        {/* TAB: SAFETY & ALERTS (Incidents - Accessible to Employee and Admin) */}
        {activeTab === 'incidents' && (
          <div className="w-full h-full relative z-20 pt-16 sm:pt-20 pb-16">
            {authUser.role === 'employee' || authUser.role === 'admin' ? (
              <IncidentsTab />
            ) : (
              <LockedNotice
                title="Safety & Alerts Log Locked"
                description="Incident logs and technical dispatch telemetry require authorized staff login."
                onOpenLogin={() => setIsAuthModalOpen(true)}
              />
            )}
          </div>
        )}

        {/* TAB: TICKET GATES (Simulator - Accessible to Admin) */}
        {activeTab === 'simulator' && (
          <div className="w-full h-full relative z-20 pt-16 sm:pt-20 pb-16">
            {authUser.role === 'admin' ? (
              <SimulatorTab />
            ) : (
              <LockedNotice
                title="Ticket Gates Simulator Locked"
                description="Turnstile gate hardware simulation sandbox is reserved for Admin testing."
                onOpenLogin={() => setIsAuthModalOpen(true)}
              />
            )}
          </div>
        )}

        {/* TAB: SQL WORKBENCH (Exclusively accessible to Admin) */}
        {activeTab === 'workbench' && (
          <div className="w-full h-full relative z-20 pt-16 sm:pt-20 pb-16">
            {authUser.role === 'admin' ? (
              <WorkbenchTab />
            ) : (
              <LockedNotice
                title="SQL Workbench Restricted"
                description="Direct MySQL query execution is reserved exclusively for the Executive Admin Portal."
                onOpenLogin={() => setIsAuthModalOpen(true)}
              />
            )}
          </div>
        )}

        {/* TAB: ER DIAGRAM & SCHEMA (Exclusively accessible to Admin) */}
        {activeTab === 'schema' && (
          <div className="w-full h-full relative z-20 pt-16 sm:pt-20 pb-16">
            {authUser.role === 'admin' ? (
              <SchemaTab />
            ) : (
              <LockedNotice
                title="Database Architecture Restricted"
                description="The Relational ER Diagram and Schema Inspector are reserved for the Executive Admin Portal."
                onOpenLogin={() => setIsAuthModalOpen(true)}
              />
            )}
          </div>
        )}
      </main>

      {/* Bottom Editorial Magazine Bar */}
      <BottomEditorialBar onTabChange={setActiveTab} kpis={kpis} />

      {/* Role & Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={authUser}
        onLogin={handleLogin}
        onLogout={handleLogout}
      />

      {/* Report Incident Modal (Role-tailored: Station issues only for Passenger; Both for Staff) */}
      <DispatchModal
        isOpen={isDispatchOpen}
        onClose={() => setIsDispatchOpen(false)}
        onSuccess={fetchKpis}
        userRole={authUser.role}
      />

      {/* Deluxe Smooth Intro Preloader */}
      {showIntro && <IntroLoader onIntroComplete={handleIntroComplete} />}
    </div>
  );
}

// Reusable Minimalist Locked Screen Card
function LockedNotice({
  title,
  description,
  onOpenLogin,
}: {
  title: string;
  description: string;
  onOpenLogin: () => void;
}) {
  return (
    <div className="w-full h-full flex items-center justify-center p-6 font-mono text-center select-none">
      <div className="max-w-md p-8 rounded-xs bg-[#18181B] border border-[#27272A] space-y-4 shadow-2xl">
        <div className="w-10 h-10 rounded-full bg-red-950/40 border border-red-800/60 flex items-center justify-center mx-auto text-red-400">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div>
          <div className="text-[10px] tracking-widest uppercase text-red-400 font-bold">
            Access Restricted &bull; Authentication Required
          </div>
          <h2 className="text-base font-semibold text-white mt-1">{title}</h2>
        </div>
        <p className="text-xs text-neutral-400 leading-relaxed">{description}</p>
        <button
          onClick={onOpenLogin}
          className="w-full py-2.5 px-4 bg-[#C5A880] hover:bg-[#D4AF37] text-neutral-950 font-bold text-xs uppercase rounded-xs transition-colors cursor-pointer shadow-sm"
        >
          Log in to Access
        </button>
      </div>
    </div>
  );
}
