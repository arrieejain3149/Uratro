import { useState } from 'react';
import { Menu, X, ArrowUpRight, ShieldAlert, Radio, BarChart3, Train, CreditCard, LayoutDashboard } from 'lucide-react';
import type { TabKey } from './BottomDock';

interface LeftSidebarProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  onOpenDispatch: () => void;
}

export default function LeftSidebar({ activeTab, onTabChange, onOpenDispatch }: LeftSidebarProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const navItems: { key: TabKey; label: string; icon: any; desc: string }[] = [
    { key: 'index', label: 'Overview', icon: LayoutDashboard, desc: '3D live rail showcase & network summary' },
    { key: 'topology', label: 'Metro Map', icon: Radio, desc: 'Interactive lines, stations & interchanges' },
    { key: 'analytics', label: 'Passenger Stats', icon: BarChart3, desc: 'Revenue, crowd density & travel patterns' },
    { key: 'fleet', label: 'Train Fleet', icon: Train, desc: 'Active trains, driver schedules & repairs' },
    { key: 'incidents', label: 'Safety & Alerts', icon: ShieldAlert, desc: 'Technical & passenger safety response' },
    { key: 'simulator', label: 'Ticket Gates', icon: CreditCard, desc: 'Interactive smart card entry & exit sandbox' },
  ];

  const handleSelectTab = (key: TabKey) => {
    onTabChange(key);
    setIsDrawerOpen(false);
  };

  return (
    <>
      {/* Sleek Vertical Left Strip */}
      <aside className="fixed left-0 top-0 bottom-0 w-14 sm:w-16 bg-[#161619] border-r border-[#242428] z-50 flex flex-col items-center justify-between py-6 select-none">
        {/* Top: Minimalist Hamburger Menu Button */}
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="w-10 h-10 rounded-sm flex items-center justify-center text-neutral-300 hover:text-white hover:bg-neutral-800/60 transition-colors cursor-pointer group"
          title="Open Menu"
        >
          <Menu className="w-5 h-5 transition-transform group-hover:scale-110" />
        </button>

        {/* Center: Vertical Rotated Micro-typography */}
        <div className="rotate-90 origin-center whitespace-nowrap text-[9px] sm:text-[10px] tracking-[0.32em] uppercase text-neutral-400 font-mono select-none">
          URATRO // METRO NETWORK
        </div>

        {/* Bottom: Network Live Pulse Indicator */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#C5A880] animate-pulse" title="System Live"></div>
          <span className="text-[8px] tracking-wider text-neutral-500 uppercase font-mono">LIVE</span>
        </div>
      </aside>

      {/* Hamburger Drawer Overlay */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-[9999] flex">
          {/* Backdrop */}
          <div
            onClick={() => setIsDrawerOpen(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
          />

          {/* Drawer Panel */}
          <div className="relative w-80 sm:w-96 bg-[#161619] border-r border-[#27272A] h-full p-6 sm:p-8 flex flex-col justify-between z-10 shadow-[0_0_50px_rgba(0,0,0,0.8)]">
            
            {/* Header */}
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-[#242428]">
                <img
                  src="/uratro-logo-clean.png"
                  alt="Uratro"
                  className="h-7 w-auto object-contain"
                />
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="w-8 h-8 rounded-sm flex items-center justify-center text-neutral-400 hover:text-white hover:bg-neutral-800/60 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Navigation Menu Links */}
              <nav className="mt-6 space-y-1">
                <span className="text-[10px] tracking-[0.25em] text-neutral-400 uppercase font-mono block mb-3">
                  // NAVIGATION MENU
                </span>

                {navItems.map((item) => {
                  const isActive = activeTab === item.key;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.key}
                      onClick={() => handleSelectTab(item.key)}
                      className={`w-full flex items-center justify-between p-3 rounded-sm text-left transition-all group cursor-pointer ${
                        isActive
                          ? 'bg-[#222226] text-white border-l-2 border-[#C5A880]'
                          : 'text-neutral-400 hover:text-white hover:bg-neutral-800/40'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-[#C5A880]' : 'text-neutral-500 group-hover:text-neutral-300'}`} />
                        <div>
                          <div className={`text-sm font-semibold tracking-wide ${isActive ? 'text-white' : 'text-neutral-300 group-hover:text-white'}`}>
                            {item.label}
                          </div>
                          <div className="text-[10px] text-neutral-400 mt-0.5 line-clamp-1">
                            {item.desc}
                          </div>
                        </div>
                      </div>
                      <ArrowUpRight className={`w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity ${isActive ? 'opacity-100 text-[#C5A880]' : 'text-neutral-400'}`} />
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Footer with System Specs & Report Button */}
            <div className="pt-6 border-t border-[#242428] space-y-4">
              <div className="bg-[#1C1C20] p-3 rounded-sm border border-[#27272A] text-[10px] font-mono text-neutral-400 space-y-1">
                <div className="flex justify-between">
                  <span>Network Power:</span>
                  <span className="text-[#C5A880] font-bold">50.0 Hz (Stable)</span>
                </div>
                <div className="flex justify-between">
                  <span>Track Signals:</span>
                  <span className="text-emerald-400 font-bold">99.98% Healthy</span>
                </div>
                <div className="flex justify-between">
                  <span>Database:</span>
                  <span className="text-neutral-300 font-bold">MySQL Synced</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsDrawerOpen(false);
                  onOpenDispatch();
                }}
                className="w-full py-2.5 px-4 rounded-sm bg-[#C5A880] hover:bg-[#D4B995] text-[#121214] font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Report Incident</span>
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
