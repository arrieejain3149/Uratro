import { useState, useEffect } from 'react';
import { X, AlertTriangle, ShieldAlert, Zap } from 'lucide-react';
import type { UserRole } from '../types/auth';

interface DispatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userRole?: UserRole;
}

export default function DispatchModal({ isOpen, onClose, onSuccess, userRole = 'guest' }: DispatchModalProps) {
  const [incidentType, setIncidentType] = useState<'emergency' | 'security'>(
    userRole === 'passenger' ? 'security' : 'emergency'
  );

  useEffect(() => {
    if (userRole === 'passenger') {
      setIncidentType('security');
    }
  }, [userRole]);
  
  // Emergency fields
  const [metroId, setMetroId] = useState(1);
  const [trackId, setTrackId] = useState(1);
  const reporterId = 2;
  const [breakdown, setBreakdown] = useState(true);
  const [power, setPower] = useState(false);
  const [signalFailure, setSignalFailure] = useState(false);
  const [locationDesc, setLocationDesc] = useState('Braking pressure drop detected at station approach.');

  // Security fields
  const [stationId, setStationId] = useState(1);
  const [securityCategory, setSecurityCategory] = useState('Medical');
  const [details, setDetails] = useState('Passenger fainted near ticket counter, needs immediate attention.');

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (incidentType === 'emergency') {
        const res = await fetch('/api/v1/incidents/emergency', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            metro_id: metroId,
            track_id: trackId,
            reporter_emp_id: reporterId,
            breakdown,
            power,
            signal_failure: signalFailure,
            location_description: locationDesc
          })
        });
        const data = await res.json();
        if (data.status === 'success') {
          setMessage("ALERT LOGGED: Technical team notified and track status updated.");
          setTimeout(() => {
            onSuccess();
            onClose();
          }, 1200);
        }
      } else {
        const res = await fetch('/api/v1/incidents/security', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            station_id: stationId,
            reporter_emp_id: reporterId,
            incident_type: securityCategory,
            details
          })
        });
        const data = await res.json();
        if (data.status === 'success') {
          setMessage("ALERT LOGGED: Station staff and security team notified.");
          setTimeout(() => {
            onSuccess();
            onClose();
          }, 1200);
        }
      }
    } catch (err: any) {
      setMessage(`Failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 font-sans">
      <div className="w-full max-w-lg bg-[#18181B] border border-[#2E2E34] rounded-sm p-6 relative shadow-[0_0_50px_rgba(0,0,0,0.85)] space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-[#C5A880]" />
            <span className="text-sm font-bold text-white uppercase tracking-wider">
              REPORT INCIDENT
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1 cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Type toggle: Restricted to Station & Passenger Issue for Passengers; Both for Employee/Admin */}
        {userRole === 'passenger' ? (
          <div className="p-2.5 bg-[#121214] border border-[#27272A] rounded-xs flex items-center gap-2 text-xs font-semibold text-white">
            <ShieldAlert className="w-4 h-4 text-[#C5A880]" />
            <span>Station & Passenger Issue Report</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 bg-[#121214] p-1 border border-[#27272A] rounded-xs">
            <button
              type="button"
              onClick={() => setIncidentType('emergency')}
              className={`py-2 text-xs font-bold uppercase rounded-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                incidentType === 'emergency'
                  ? 'bg-[#C5A880] text-[#121214] shadow-md'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              Train & Track Issue
            </button>

            <button
              type="button"
              onClick={() => setIncidentType('security')}
              className={`py-2 text-xs font-bold uppercase rounded-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                incidentType === 'security'
                  ? 'bg-[#C5A880] text-[#121214] shadow-md'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              Station & Passenger Issue
            </button>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {incidentType === 'emergency' ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-neutral-400 block uppercase mb-1">Select Train</label>
                  <select
                    value={metroId}
                    onChange={(e) => setMetroId(Number(e.target.value))}
                    className="w-full bg-black border border-neutral-800 text-white px-2.5 py-1.5 rounded-xs"
                  >
                    <option value={1}>Train #1 (Alstom Metropolis)</option>
                    <option value={2}>Train #2 (BEML Series-2)</option>
                    <option value={4}>Train #4 (Hyundai Rotem)</option>
                    <option value={5}>Train #5 (CRRC Vanguard)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-neutral-400 block uppercase mb-1">Select Track / Line</label>
                  <select
                    value={trackId}
                    onChange={(e) => setTrackId(Number(e.target.value))}
                    className="w-full bg-black border border-neutral-800 text-white px-2.5 py-1.5 rounded-xs"
                  >
                    <option value={1}>Track 1 (Pink Line West)</option>
                    <option value={2}>Track 2 (Pink Line East)</option>
                    <option value={3}>Track 3 (Blue Line Central)</option>
                  </select>
                </div>
              </div>

              {/* Status Flags */}
              <div className="bg-black/60 p-3 border border-neutral-800 rounded-xs space-y-2">
                <span className="text-[9px] text-neutral-400 block uppercase font-bold">ISSUE TYPE:</span>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-1.5 text-red-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={breakdown}
                      onChange={(e) => setBreakdown(e.target.checked)}
                      className="accent-red-500"
                    />
                    Mechanical Issue
                  </label>
                  <label className="flex items-center gap-1.5 text-amber-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={power}
                      onChange={(e) => setPower(e.target.checked)}
                      className="accent-amber-500"
                    />
                    Power Supply
                  </label>
                  <label className="flex items-center gap-1.5 text-blue-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={signalFailure}
                      onChange={(e) => setSignalFailure(e.target.checked)}
                      className="accent-blue-500"
                    />
                    Signal Glitch
                  </label>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-neutral-400 block uppercase mb-1">Location / Description</label>
                <input
                  type="text"
                  value={locationDesc}
                  onChange={(e) => setLocationDesc(e.target.value)}
                  className="w-full bg-black border border-neutral-800 text-white px-2.5 py-1.5 rounded-xs"
                  required
                />
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-neutral-400 block uppercase mb-1">Select Station</label>
                  <select
                    value={stationId}
                    onChange={(e) => setStationId(Number(e.target.value))}
                    className="w-full bg-black border border-neutral-800 text-white px-2.5 py-1.5 rounded-xs"
                  >
                    <option value={1}>Mansarovar</option>
                    <option value={5}>Civil Lines</option>
                    <option value={6}>Railway Station</option>
                    <option value={7}>Sindhi Camp</option>
                    <option value={8}>Chandpole</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-neutral-400 block uppercase mb-1">Issue Category</label>
                  <select
                    value={securityCategory}
                    onChange={(e) => setSecurityCategory(e.target.value)}
                    className="w-full bg-black border border-neutral-800 text-white px-2.5 py-1.5 rounded-xs"
                  >
                    <option value="Medical">Medical Assistance</option>
                    <option value="Dispute">Passenger Dispute</option>
                    <option value="Unattended Item">Lost or Unattended Bag</option>
                    <option value="Theft">Theft / Security</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-neutral-400 block uppercase mb-1">Incident Details & Notes</label>
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  rows={3}
                  className="w-full bg-black border border-neutral-800 text-white px-2.5 py-1.5 rounded-xs"
                  required
                />
              </div>
            </>
          )}

          {message && (
            <div className="p-2.5 text-xs text-[#C5A880] bg-[#C5A880]/10 border border-[#C5A880]/30 rounded-xs">
              {message}
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#C5A880] hover:bg-[#D4B995] text-[#121214] font-extrabold py-2.5 rounded-xs uppercase tracking-wider transition-colors cursor-pointer shadow-md"
            >
              {loading ? "SUBMITTING..." : "SUBMIT REPORT & NOTIFY CREW"}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
