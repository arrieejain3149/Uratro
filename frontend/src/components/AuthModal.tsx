import { useState } from 'react';
import { X, Shield } from 'lucide-react';
import type { AuthUser } from '../types/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AuthUser;
  onLogin: (user: AuthUser) => void;
  onLogout: () => void;
}

export default function AuthModal({
  isOpen,
  onClose,
  currentUser,
  onLogin,
  onLogout,
}: AuthModalProps) {
  const [selectedRole, setSelectedRole] = useState<'passenger' | 'employee' | 'admin'>(
    currentUser.role === 'guest' ? 'passenger' : currentUser.role
  );
  const [inputVal, setInputVal] = useState('');
  const [passcode, setPasscode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleRoleTabChange = (role: 'passenger' | 'employee' | 'admin') => {
    setSelectedRole(role);
    setInputVal('');
    setPasscode('');
    setErrorMsg('');
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (selectedRole === 'passenger') {
      const pId = parseInt(inputVal || '1', 10);
      onLogin({
        role: 'passenger',
        id: pId,
        name: pId === 1 ? 'Rahul Sharma' : `Passenger #${pId}`,
        contact: '9876543210',
        balance: 390.0,
      });
      onClose();
    } else if (selectedRole === 'employee') {
      if (passcode && passcode !== 'crew2026') {
        setErrorMsg('Invalid staff passcode. Demo code: crew2026');
        return;
      }
      onLogin({
        role: 'employee',
        id: inputVal || 'EMP-101',
        name: 'Vikram Singh',
        badge: 'Senior Pilot & Depot Supervisor',
      });
      onClose();
    } else if (selectedRole === 'admin') {
      if (passcode && passcode !== 'admin2026') {
        setErrorMsg('Invalid admin passcode. Demo code: admin2026');
        return;
      }
      onLogin({
        role: 'admin',
        id: 'ADMIN-01',
        name: 'Chief Operations Officer',
        badge: 'Data Feeder & Workbench',
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md bg-[#18181B] border border-[#27272A] rounded-sm p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.8)] z-10 text-white font-sans select-none">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#27272A]">
          <div className="flex items-center gap-2.5">
            <Shield className="w-4 h-4 text-[#C5A880]" />
            <h2 className="text-sm tracking-widest uppercase font-mono font-medium text-white">
              LOGIN PAGE
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-xs text-neutral-400 hover:text-white hover:bg-neutral-800/80 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current Session Banner */}
        <div className="mt-4 p-3 rounded-xs bg-[#121214] border border-[#27272A] flex items-center justify-between">
          <div>
            <div className="text-[10px] tracking-wider uppercase text-neutral-400 font-mono">
              Current Session
            </div>
            <div className="text-xs font-medium text-white capitalize mt-0.5">
              {currentUser.role} &bull; <span className="text-[#C5A880]">{currentUser.name}</span>
            </div>
          </div>
          {currentUser.role !== 'guest' && (
            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="text-[11px] text-neutral-400 hover:text-white underline cursor-pointer"
            >
              Log out
            </button>
          )}
        </div>

        {/* Role Selection Tabs */}
        <div className="mt-5 grid grid-cols-3 gap-1 p-1 bg-[#121214] border border-[#27272A] rounded-xs font-mono text-xs">
          {(['passenger', 'employee', 'admin'] as const).map((role) => (
            <button
              key={role}
              onClick={() => handleRoleTabChange(role)}
              className={`py-2 text-center rounded-xs uppercase tracking-wider transition-all cursor-pointer ${
                selectedRole === role
                  ? 'bg-[#27272A] text-white font-semibold shadow-xs'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {role}
            </button>
          ))}
        </div>

        {/* Form Body */}
        <form onSubmit={handleLoginSubmit} className="mt-5 space-y-4">
          {selectedRole === 'passenger' && (
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-neutral-400 font-mono mb-1.5">
                Passenger ID
              </label>
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="Enter Passenger ID (e.g. 1)"
                className="w-full bg-[#121214] border border-[#27272A] rounded-xs px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C5A880] font-mono"
              />
              <p className="text-[10px] text-neutral-500 mt-1">
                Linked to Passenger records in database. No password needed for public access.
              </p>
            </div>
          )}

          {selectedRole === 'employee' && (
            <>
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-neutral-400 font-mono mb-1.5">
                  Staff Badge ID
                </label>
                <input
                  type="text"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  placeholder="e.g. EMP-101"
                  className="w-full bg-[#121214] border border-[#27272A] rounded-xs px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C5A880] font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-neutral-400 font-mono mb-1.5">
                  Passcode
                </label>
                <input
                  type="password"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Demo code: crew2026"
                  className="w-full bg-[#121214] border border-[#27272A] rounded-xs px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C5A880] font-mono"
                />
              </div>
            </>
          )}

          {selectedRole === 'admin' && (
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-neutral-400 font-mono mb-1.5">
                Executive Admin Passcode
              </label>
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Demo code: admin2026"
                className="w-full bg-[#121214] border border-[#27272A] rounded-xs px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C5A880] font-mono"
              />
              <p className="text-[10px] text-neutral-500 mt-1">
                Unlocks Data Feeder, SQL Workbench, and ER Diagram tabs.
              </p>
            </div>
          )}

          {errorMsg && (
            <div className="p-2 bg-red-950/40 border border-red-800/60 rounded-xs text-red-300 text-xs font-mono">
              {errorMsg}
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xs bg-[#C5A880] hover:bg-[#D4AF37] text-neutral-950 text-xs font-semibold tracking-wider uppercase transition-colors cursor-pointer"
            >
              <span>Login</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
