import { useState, useRef, useEffect } from 'react';
import ThreeScene from './components/ThreeScene';
import AtmosphereBackground from './components/AtmosphereBackground';
import HudOverlay from './components/HudOverlay';
import BottomDock from './components/BottomDock';
import type { TabKey } from './components/BottomDock';
import TopologyTab from './components/tabs/TopologyTab';
import AnalyticsTab from './components/tabs/AnalyticsTab';
import FleetTab from './components/tabs/FleetTab';
import IncidentsTab from './components/tabs/IncidentsTab';
import SimulatorTab from './components/tabs/SimulatorTab';
import DispatchModal from './components/DispatchModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('index');
  const [isDispatchOpen, setIsDispatchOpen] = useState(false);
  const [kpis, setKpis] = useState<any>(null);

  // Mouse coords for 3D parallax & HUD
  const mouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [mouseDisplay, setMouseDisplay] = useState<{ x: number; y: number }>({ x: 859, y: 889 });

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

    // Screen pixel coordinates for the HUD readout
    setMouseDisplay({ x: Math.round(clientX), y: Math.round(clientY) });
  };

  return (
    <div 
      onMouseMove={handleMouseMove}
      className="relative w-screen h-screen bg-black overflow-hidden select-none font-mono text-white"
    >
      {/* Moving organic dark smoke / atmosphere (Replaces flat grid) */}
      <AtmosphereBackground />

      {/* Visual CRT & Dither Texture Overlay */}
      <div className="absolute inset-0 z-30 crt-overlay pointer-events-none opacity-40"></div>
      <div className="absolute inset-0 z-10 dither-pattern pointer-events-none opacity-20"></div>

      {/* Main Content Area */}
      <main className="relative w-full h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)] overflow-hidden">
        
        {/* TAB 1: HERO LANDING (Exact replica of unbelievablycrap.com with Metro GLB) */}
        {activeTab === 'index' && (
          <div className="w-full h-full relative">
            <ThreeScene mouse={mouseRef} />
            <HudOverlay mouseCoords={mouseDisplay} kpis={kpis} />
          </div>
        )}

        {/* TAB 2: TOPOLOGY NETWORK */}
        {activeTab === 'topology' && (
          <div className="w-full h-full relative z-20">
            <TopologyTab />
          </div>
        )}

        {/* TAB 3: DATA ANALYTICS COMMAND CENTER */}
        {activeTab === 'analytics' && (
          <div className="w-full h-full relative z-20">
            <AnalyticsTab />
          </div>
        )}

        {/* TAB 4: FLEET & WORK ORDERS */}
        {activeTab === 'fleet' && (
          <div className="w-full h-full relative z-20">
            <FleetTab />
          </div>
        )}

        {/* TAB 5: INCIDENT ISA HIERARCHY */}
        {activeTab === 'incidents' && (
          <div className="w-full h-full relative z-20">
            <IncidentsTab />
          </div>
        )}

        {/* TAB 6: TURNSTILE COMMUTER SIMULATOR */}
        {activeTab === 'simulator' && (
          <div className="w-full h-full relative z-20">
            <SimulatorTab />
          </div>
        )}
      </main>

      {/* The Bottom Dock (Exact spatial match with unbelievablycrap.com) */}
      <BottomDock 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        onOpenDispatch={() => setIsDispatchOpen(true)}
      />

      {/* Emergency Tactical Dispatch Modal */}
      <DispatchModal
        isOpen={isDispatchOpen}
        onClose={() => setIsDispatchOpen(false)}
        onSuccess={fetchKpis}
      />
    </div>
  );
}
