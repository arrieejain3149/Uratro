import { useState } from 'react';
import {
  Menu,
  X,
  ArrowUpRight,
  ShieldAlert,
  Radio,
  BarChart3,
  Train,
  CreditCard,
  LayoutDashboard,
  Terminal,
  Network,
  UserCheck,
  Wrench,
  ShieldCheck,
  LogIn,
} from 'lucide-react';
import type { TabKey } from './BottomDock';
import type { UserRole } from '../types/auth';

interface LeftSidebarProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  onOpenDispatch: () => void;
  userRole?: UserRole;
  onOpenAuthModal?: () => void;
}

interface NavItem {
  key: TabKey;
  label: string;
  icon: any;
}

export default function LeftSidebar({
  activeTab,
  onTabChange,
  onOpenDispatch,
  userRole = 'guest',
  onOpenAuthModal,
}: LeftSidebarProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Define role-specific hamburger drawer items strictly according to user rules
  const getDrawerItems = (role: UserRole): NavItem[] => {
    if (role === 'guest') {
      // 1-by Default: Nothing other than Overview and Metro Map
      return [
        { key: 'index', label: 'Overview', icon: LayoutDashboard },
        { key: 'topology', label: 'Metro Map', icon: Radio },
      ];
    } else if (role === 'passenger') {
      // 2-on Each Passenger Portal: Only Overview, Ticket Pass, Metro Map
      return [
        { key: 'index', label: 'Overview', icon: LayoutDashboard },
        { key: 'passenger', label: 'Ticket Pass', icon: UserCheck },
        { key: 'topology', label: 'Metro Map', icon: Radio },
      ];
    } else if (role === 'employee') {
      // 3-On Employee Portal: OverView, Operations and Maintenance, Metro Map, Trains, Safety Alerts, Passenger Stats
      return [
        { key: 'index', label: 'Overview', icon: LayoutDashboard },
        { key: 'employee', label: 'Operations and Maintenance', icon: Wrench },
        { key: 'topology', label: 'Metro Map', icon: Radio },
        { key: 'fleet', label: 'Trains', icon: Train },
        { key: 'incidents', label: 'Safety & Alerts', icon: ShieldAlert },
        { key: 'analytics', label: 'Passenger Stats', icon: BarChart3 },
      ];
    } else {
      // 4-On Admin Portal: Overview, Data Feeder, Trains, SQL Workbench, Metro Map, Passenger Stats, Safety And Alerts, Ticket Gates
      return [
        { key: 'index', label: 'Overview', icon: LayoutDashboard },
        { key: 'admin', label: 'Data Feeder', icon: ShieldCheck },
        { key: 'fleet', label: 'Trains', icon: Train },
        { key: 'workbench', label: 'SQL Workbench', icon: Terminal },
        { key: 'topology', label: 'Metro Map', icon: Radio },
        { key: 'analytics', label: 'Passenger Stats', icon: BarChart3 },
        { key: 'incidents', label: 'Safety & Alerts', icon: ShieldAlert },
        { key: 'simulator', label: 'Ticket Gates', icon: CreditCard },
        { key: 'schema', label: 'ER Diagram & Schema', icon: Network },
      ];
    }
  };

  const navItems = getDrawerItems(userRole);

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
          <div className="relative w-80 sm:w-96 bg-[#161619] border-r border-[#27272A] h-full p-6 sm:p-8 flex flex-col justify-between z-10 shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-y-auto">
            {/* Header & Navigation */}
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

              {/* Navigation Items */}
              <div className="mt-5 space-y-1">
                {navItems.map((item) => {
                  const isActive = activeTab === item.key;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.key}
                      onClick={() => handleSelectTab(item.key)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-sm text-left transition-all group cursor-pointer ${
                        isActive
                          ? 'bg-[#222226] text-white border-l-2 border-[#C5A880]'
                          : 'text-neutral-400 hover:text-white hover:bg-neutral-800/40'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          className={`w-4 h-4 ${
                            isActive
                              ? 'text-[#C5A880]'
                              : 'text-neutral-500 group-hover:text-neutral-300'
                          }`}
                        />
                        <span
                          className={`text-xs font-semibold tracking-wide ${
                            isActive ? 'text-white' : 'text-neutral-300 group-hover:text-white'
                          }`}
                        >
                          {item.label}
                        </span>
                      </div>
                      <ArrowUpRight
                        className={`w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity ${
                          isActive ? 'opacity-100 text-[#C5A880]' : 'text-neutral-400'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              {/* Guest Login Callout */}
              {userRole === 'guest' && (
                <div className="mt-6 p-4 rounded-xs bg-[#1A1A1E] border border-[#27272A] space-y-2">
                  <div className="text-[10px] tracking-wider uppercase text-[#C5A880] font-mono font-semibold">
                    Restricted Guest Mode
                  </div>
                  <p className="text-xs text-neutral-400">
                    Log in with Passenger ID, Staff ID, or Admin code to unlock role portals.
                  </p>
                  <button
                    onClick={() => {
                      setIsDrawerOpen(false);
                      if (onOpenAuthModal) onOpenAuthModal();
                    }}
                    className="w-full mt-2 py-2 px-3 bg-[#C5A880] hover:bg-[#D4AF37] text-neutral-950 font-bold text-xs uppercase rounded-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Login / Access Portals</span>
                  </button>
                </div>
              )}
            </div>

            {/* Footer with Report Button */}
            <div className="pt-4 mt-6 border-t border-[#242428]">
              {/* Incident Button (Disabled or redirects to login for guests) */}
              {userRole === 'guest' ? (
                <button
                  onClick={() => {
                    setIsDrawerOpen(false);
                    if (onOpenAuthModal) onOpenAuthModal();
                  }}
                  className="w-full py-2.5 px-4 bg-[#242428] hover:bg-[#323238] text-neutral-300 font-semibold text-xs tracking-wider uppercase rounded-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogIn className="w-4 h-4 text-[#C5A880]" />
                  <span>Login to Report Issue</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    setIsDrawerOpen(false);
                    onOpenDispatch();
                  }}
                  className="w-full py-2.5 px-4 bg-[#C5A880] hover:bg-[#d6bc96] text-black font-semibold text-xs tracking-wider uppercase rounded-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>Report Incident</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
