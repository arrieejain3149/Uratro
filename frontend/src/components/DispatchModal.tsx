import { useState } from 'react';
import { X, AlertTriangle, ShieldAlert, Zap } from 'lucide-react';

interface DispatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DispatchModal({ isOpen, onClose, onSuccess }: DispatchModalProps) {
  const [incidentType, setIncidentType] = useState<'emergency' | 'security'>('emergency');
  
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
          setMessage("EMERGENCY DISPATCHED: Autonomous cascade triggers executed on Metro & Track tables.");
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
          setMessage("SECURITY ALERT LOGGED: Station security response unit alerted.");
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 font-mono">
      <div className="w-full max-w-lg bg-[#0e1017] border border-neutral-700 rounded-sm p-6 relative shadow-[0_0_35px_rgba(0,0,0,0.9)] space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500 animate-pulse" />
            <span className="text-sm font-bold text-white uppercase tracking-wider">
              TACTICAL EMERGENCY DISPATCH // ISA CONSOLE
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-white p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Type toggle */}
        <div className="grid grid-cols-2 gap-2 bg-black/60 p-1 border border-neutral-800 rounded-xs">
          <button
            type="button"
            onClick={() => setIncidentType('emergency')}
            className={`py-2 text-xs font-bold uppercase rounded-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
              incidentType === 'emergency'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            Technical Emergency
          </button>

          <button
            type="button"
            onClick={() => setIncidentType('security')}
            className={`py-2 text-xs font-bold uppercase rounded-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
              incidentType === 'security'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            Station Security
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {incidentType === 'emergency' ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-neutral-400 block uppercase mb-1">Affected Metro Rake</label>
                  <select
                    value={metroId}
                    onChange={(e) => setMetroId(Number(e.target.value))}
                    className="w-full bg-black border border-neutral-800 text-white px-2.5 py-1.5 rounded-xs"
                  >
                    <option value={1}>#1 Alstom Metropolis 2020</option>
                    <option value={2}>#2 BEML Metro Series-2</option>
                    <option value={4}>#4 Hyundai Rotem Express</option>
                    <option value={5}>#5 CRRC Vanguard 3000</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-neutral-400 block uppercase mb-1">Track Segment</label>
                  <select
                    value={trackId}
                    onChange={(e) => setTrackId(Number(e.target.value))}
                    className="w-full bg-black border border-neutral-800 text-white px-2.5 py-1.5 rounded-xs"
                  >
                    <option value={1}>Track 1 (Pink Line Sector A)</option>
                    <option value={2}>Track 2 (Pink Line Sector B)</option>
                    <option value={3}>Track 3 (Blue Line Sector A)</option>
                  </select>
                </div>
              </div>

              {/* Status Flags */}
              <div className="bg-black/60 p-3 border border-neutral-800 rounded-xs space-y-2">
                <span className="text-[9px] text-neutral-400 block uppercase font-bold">FAILURE MODES (TRIGGERS):</span>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-1.5 text-red-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={breakdown}
                      onChange={(e) => setBreakdown(e.target.checked)}
                      className="accent-red-500"
                    />
                    Mechanical Breakdown
                  </label>
                  <label className="flex items-center gap-1.5 text-amber-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={power}
                      onChange={(e) => setPower(e.target.checked)}
                      className="accent-amber-500"
                    />
                    Power Grid
                  </label>
                  <label className="flex items-center gap-1.5 text-blue-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={signalFailure}
                      onChange={(e) => setSignalFailure(e.target.checked)}
                      className="accent-blue-500"
                    />
                    Signal Failure
                  </label>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-neutral-400 block uppercase mb-1">Description / Coordinates</label>
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
                  <label className="text-[10px] text-neutral-400 block uppercase mb-1">Station Location</label>
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
                  <label className="text-[10px] text-neutral-400 block uppercase mb-1">Category Type</label>
                  <select
                    value={securityCategory}
                    onChange={(e) => setSecurityCategory(e.target.value)}
                    className="w-full bg-black border border-neutral-800 text-white px-2.5 py-1.5 rounded-xs"
                  >
                    <option value="Medical">Medical Emergency</option>
                    <option value="Dispute">Commuter Dispute</option>
                    <option value="Unattended Item">Unattended Item</option>
                    <option value="Theft">Theft Report</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-neutral-400 block uppercase mb-1">Event Narrative</label>
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
            <div className="p-2 text-xs text-cyan-300 bg-cyan-950/40 border border-cyan-800 rounded-xs">
              {message}
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-500 text-white font-extrabold py-2.5 rounded-xs uppercase tracking-wider transition-colors cursor-pointer"
            >
              {loading ? "DISPATCHING..." : "COMMIT INCIDENT TO DATABASE // EXECUTE TRIGGER"}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
