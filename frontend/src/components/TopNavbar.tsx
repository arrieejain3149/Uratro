import { Search, ShieldAlert, LogIn } from 'lucide-react';
import type { TabKey } from './BottomDock';
import type { AuthUser, UserRole } from '../types/auth';

interface TopNavbarProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  onOpenDispatch: () => void;
  authUser?: AuthUser;
  onOpenAuthModal?: () => void;
}

export default function TopNavbar({
  activeTab,
  onTabChange,
  onOpenDispatch,
  authUser = { role: 'guest', name: 'Guest Visitor' },
  onOpenAuthModal,
}: TopNavbarProps) {
  // Role-tailored top navigation links strictly adhering to specifications
  const getNavTabs = (role: UserRole): { key: TabKey; label: string }[] => {
    if (role === 'guest') {
      // 1-by Default: Nothing other than Overview and Metro Map
      return [
        { key: 'index', label: 'Overview' },
        { key: 'topology', label: 'Metro Map' },
      ];
    } else if (role === 'passenger') {
      // 2-on Each Passenger Portal: Only Overview, Passenger kiosk and Ticket pass, Metro Map
      return [
        { key: 'index', label: 'Overview' },
        { key: 'passenger', label: 'Ticket Pass' },
        { key: 'topology', label: 'Metro Map' },
      ];
    } else if (role === 'employee') {
      // 3-On Employee Portal: OverView, Operations and Maintenance, Trains, Safety Alerts, Metro Map
      return [
        { key: 'index', label: 'Overview' },
        { key: 'employee', label: 'Operations and Maintenance' },
        { key: 'fleet', label: 'Trains' },
        { key: 'incidents', label: 'Safety & Alerts' },
        { key: 'topology', label: 'Metro Map' },
      ];
    } else {
      // 4-On Admin Portal: Overview, Data Feeder, Trains, SQL Workbench, Safety & Alerts
      return [
        { key: 'index', label: 'Overview' },
        { key: 'admin', label: 'Data Feeder' },
        { key: 'fleet', label: 'Trains' },
        { key: 'workbench', label: 'SQL Workbench' },
        { key: 'incidents', label: 'Safety & Alerts' },
      ];
    }
  };

  const navTabs = getNavTabs(authUser.role);

  return (
    <header className="fixed top-0 left-14 sm:left-16 right-0 h-16 sm:h-20 z-40 bg-[#121214]/80 backdrop-blur-md border-b border-[#242428]/40 flex items-center justify-between px-4 sm:px-8 lg:px-12 select-none font-sans">
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
      <div className="flex items-center gap-4 sm:gap-6 lg:gap-8">
        <nav className="hidden md:flex items-center gap-5 sm:gap-7 lg:gap-8 text-xs sm:text-sm font-medium tracking-wide">
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

        {/* Far Right Action Items */}
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          {/* Guest State: Prominent Login Button */}
          {authUser.role === 'guest' ? (
            <button
              onClick={onOpenAuthModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xs bg-[#C5A880] hover:bg-[#D4AF37] text-neutral-950 text-xs font-semibold tracking-wider uppercase transition-colors cursor-pointer shadow-sm"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Login</span>
            </button>
          ) : (
            /* Authenticated Role Indicator & Switcher Button */
            onOpenAuthModal && (
              <button
                onClick={onOpenAuthModal}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xs border border-[#27272A] bg-[#161619] hover:bg-[#1E1E22] text-xs font-mono transition-colors cursor-pointer"
                title="Click to Switch Portal Role or Log out"
              >
                <span className="text-neutral-400 uppercase text-[10px] tracking-wider hidden sm:inline">
                  {authUser.role}:
                </span>
                <span className="text-white font-medium truncate max-w-[110px]">
                  {authUser.name}
                </span>
              </button>
            )
          )}

          {/* Search Button (Topology) */}
          <button 
            onClick={() => onTabChange('topology')}
            className="text-neutral-400 hover:text-white p-1.5 rounded-sm transition-colors cursor-pointer"
            title="Search stations & lines"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Report Incident Button (Only shown when logged in) */}
          {authUser.role !== 'guest' && (
            <button
              onClick={onOpenDispatch}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm border border-[#C5A880]/50 bg-[#1E1E22] hover:bg-[#28282D] text-[#C5A880] hover:text-[#D8BA92] text-xs font-semibold tracking-wider uppercase transition-colors cursor-pointer shadow-sm"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Report Incident</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
