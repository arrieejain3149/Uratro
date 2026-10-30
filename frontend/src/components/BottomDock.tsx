import { useEffect, useState } from 'react';
import { Moon, AlertTriangle } from 'lucide-react';

export type TabKey = 'index' | 'topology' | 'analytics' | 'fleet' | 'incidents' | 'simulator';

interface BottomDockProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  onOpenDispatch: () => void;
}

export default function BottomDock({ activeTab, onTabChange, onOpenDispatch }: BottomDockProps) {
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toTimeString().split(' ')[0]);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'index', label: 'INDEX +' },
    { key: 'topology', label: 'TOPOLOGY +' },
    { key: 'analytics', label: 'ANALYTICS +' },
    { key: 'fleet', label: 'FLEET +' },
    { key: 'incidents', label: 'INCIDENTS +' },
    { key: 'simulator', label: 'SIMULATOR +' },
  ];

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 h-14 sm:h-16 bg-[#16181d]/95 backdrop-blur-xl border-t border-[#262830] flex items-center justify-between px-3 sm:px-6 select-none font-mono">
      {/* Left: Brand badge & navigation tabs */}
      <div className="flex items-center gap-1 sm:gap-3 overflow-x-auto no-scrollbar py-1">
        {/* Chrome metallic logo badge */}
        <button 
          onClick={() => onTabChange('index')}
          className="flex items-center justify-center h-8 px-2 rounded-xs bg-neutral-900 border border-neutral-700 shadow-md hover:scale-105 transition-transform"
          title="Uratro Home"
        >
          <img src="/uratro-logo-clean.png" alt="Uratro" className="h-4 w-auto object-contain" />
        </button>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1 sm:gap-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => onTabChange(tab.key)}
                className={`px-3 py-1.5 text-[11px] sm:text-xs font-semibold tracking-wider transition-all duration-200 uppercase whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white rounded-xs shadow-[0_0_12px_rgba(37,99,235,0.6)]'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60 rounded-xs'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Right: Timezone, Clock, and High-Contrast Action Button */}
      <div className="flex items-center gap-3 sm:gap-5 shrink-0 pl-2">
        <div className="hidden lg:flex items-center gap-1.5 text-neutral-400 text-xs">
          <Moon className="w-3.5 h-3.5 text-cyan-400" />
          <span>GMT+5:30</span>
        </div>

        <div className="hidden md:flex items-center gap-1 text-xs tracking-widest text-neutral-200 font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>{timeStr || '23:59:00'}</span>
        </div>

        {/* High contrast action button */}
        <button
          onClick={onOpenDispatch}
          className="bg-white hover:bg-neutral-200 text-black px-3 sm:px-4 py-1.5 text-[11px] sm:text-xs font-extrabold tracking-wider uppercase transition-transform active:scale-95 flex items-center gap-1.5 cursor-pointer shadow-lg"
        >
          <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
          <span>DISPATCH ALERT +</span>
        </button>
      </div>
    </footer>
  );
}
