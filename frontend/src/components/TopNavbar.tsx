import { Search, ShieldAlert } from 'lucide-react';
import type { TabKey } from './BottomDock';

interface TopNavbarProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  onOpenDispatch: () => void;
}

export default function TopNavbar({ activeTab, onTabChange, onOpenDispatch }: TopNavbarProps) {
  const navTabs: { key: TabKey; label: string }[] = [
    { key: 'index', label: 'Overview' },
    { key: 'topology', label: 'Metro Map' },
    { key: 'analytics', label: 'Passenger Stats' },
    { key: 'fleet', label: 'Train Fleet' },
    { key: 'incidents', label: 'Safety & Alerts' },
    { key: 'simulator', label: 'Ticket Gates' },
  ];

  return (
    <header className="fixed top-0 left-14 sm:left-16 right-0 h-16 sm:h-20 z-40 bg-[#121214]/80 backdrop-blur-md border-b border-[#242428]/40 flex items-center justify-between px-6 sm:px-12 select-none">
      {/* Left: Uratro Brand Logo */}
      <button 
        onClick={() => onTabChange('index')}
        className="flex items-center gap-3 cursor-pointer group"
      >
        <img
          src="/uratro-logo-clean.png"
          alt="Uratro"
          className="h-6 sm:h-7 md:h-8 w-auto object-contain transition-transform group-hover:scale-105"
        />
      </button>

      {/* Center-Right: Horizontal Navigation Links (Exact Aer Style) */}
      <div className="flex items-center gap-6 sm:gap-8 lg:gap-10">
        <nav className="hidden md:flex items-center gap-6 sm:gap-8 lg:gap-10 text-xs sm:text-sm font-medium tracking-wide">
          {navTabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => onTabChange(tab.key)}
                className={`relative py-1 cursor-pointer transition-colors duration-200 ${
                  isActive ? 'text-white font-semibold' : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <span>{tab.label}</span>
                {/* Signature Aer warm champagne gold active underline indicator */}
                {isActive && (
                  <span className="absolute -bottom-1.5 left-0 right-0 h-[2px] bg-[#C5A880] rounded-full transition-all" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Far Right Action Icons */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button 
            onClick={() => onTabChange('topology')}
            className="text-neutral-400 hover:text-white p-1.5 rounded-sm transition-colors cursor-pointer"
            title="Search stations & lines"
          >
            <Search className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenDispatch}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm border border-[#C5A880]/50 bg-[#1E1E22] hover:bg-[#28282D] text-[#C5A880] hover:text-[#D8BA92] text-xs font-semibold tracking-wider uppercase transition-colors cursor-pointer shadow-sm"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Report Incident</span>
          </button>
        </div>
      </div>
    </header>
  );
}
