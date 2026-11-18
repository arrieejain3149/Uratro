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
import DispatchModal from './components/DispatchModal';
import IntroLoader from './components/IntroLoader';
import CursorCanvas from './components/CursorCanvas';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('index');
  const [isDispatchOpen, setIsDispatchOpen] = useState(false);
  const [kpis, setKpis] = useState<any>(null);
  const [showIntro, setShowIntro] = useState(true);

  // Mouse coords for 3D parallax & HUD
  const mouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const fetchKpis = () => {
    fetch('/api/v1/analytics/kpis')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          setKpis(data.data);
        }
      })
      .catch(err => console.error("Error fetching KPIs:", err));
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

      {/* Slender Left Vertical Sidebar Strip with Hamburger Menu */}
      <LeftSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenDispatch={() => setIsDispatchOpen(true)}
      />

      {/* Sleek Minimalist Top Navigation Bar */}
      <TopNavbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenDispatch={() => setIsDispatchOpen(true)}
      />

      {/* Main Content Area */}
      <main className="relative ml-14 sm:ml-16 w-[calc(100vw-3.5rem)] sm:w-[calc(100vw-4rem)] h-screen overflow-hidden">
        
        {/* TAB 1: HERO OVERVIEW (3D Showcase with Aer-style Editorial Layout) */}
        {activeTab === 'index' && (
          <div className="w-full h-full relative">
            <ThreeScene mouse={mouseRef} />
            <HeroOverlay 
              onTabChange={setActiveTab} 
              kpis={kpis}
              mouse={mouseRef}
            />
          </div>
        )}

        {/* TAB 2: METRO MAP (Topology) */}
        {activeTab === 'topology' && (
          <div className="w-full h-full relative z-20 pt-16 sm:pt-20 pb-16">
            <TopologyTab />
          </div>
        )}

        {/* TAB 3: PASSENGER STATS (Analytics) */}
        {activeTab === 'analytics' && (
          <div className="w-full h-full relative z-20 pt-16 sm:pt-20 pb-16">
            <AnalyticsTab />
          </div>
        )}

        {/* TAB 4: TRAIN FLEET */}
        {activeTab === 'fleet' && (
          <div className="w-full h-full relative z-20 pt-16 sm:pt-20 pb-16">
            <FleetTab />
          </div>
        )}

        {/* TAB 5: SAFETY & ALERTS (Incidents) */}
        {activeTab === 'incidents' && (
          <div className="w-full h-full relative z-20 pt-16 sm:pt-20 pb-16">
            <IncidentsTab />
          </div>
        )}

        {/* TAB 6: TICKET GATES (Simulator) */}
        {activeTab === 'simulator' && (
          <div className="w-full h-full relative z-20 pt-16 sm:pt-20 pb-16">
            <SimulatorTab />
          </div>
        )}

        {/* TAB 7: SQL WORKBENCH (Query Console - Exclusive to Left Menu Drawer) */}
        {activeTab === 'workbench' && (
          <div className="w-full h-full relative z-20 pt-16 sm:pt-20 pb-16">
            <WorkbenchTab />
          </div>
        )}

        {/* TAB 8: ER DIAGRAM & SCHEMA (Architecture - Exclusive to Left Menu Drawer) */}
        {activeTab === 'schema' && (
          <div className="w-full h-full relative z-20 pt-16 sm:pt-20 pb-16">
            <SchemaTab />
          </div>
        )}
      </main>

      {/* Bottom Editorial Magazine Bar */}
      <BottomEditorialBar 
        onTabChange={setActiveTab} 
        kpis={kpis}
      />

      {/* Report Incident Modal */}
      <DispatchModal
        isOpen={isDispatchOpen}
        onClose={() => setIsDispatchOpen(false)}
        onSuccess={fetchKpis}
      />

      {/* Deluxe Smooth Intro Preloader */}
      {showIntro && (
        <IntroLoader onIntroComplete={handleIntroComplete} />
      )}
    </div>
  );
}
