import { useEffect, useState } from 'react';
import { AlertTriangle, ShieldCheck, Zap, Check } from 'lucide-react';

export default function IncidentsTab() {
  const [emergencies, setEmergencies] = useState<any[]>([]);
  const [securities, setSecurities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchIncidents = () => {
    Promise.all([
      fetch('/api/v1/incidents/emergency').then(r => r.json()),
      fetch('/api/v1/incidents/security').then(r => r.json())
    ]).then(([emRes, secRes]) => {
      if (emRes.status === 'success') setEmergencies(emRes.data);
      if (secRes.status === 'success') setSecurities(secRes.data);
    }).catch(err => console.error("Error loading incidents:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  const handleResolveEmergency = async (id: number) => {
    try {
      await fetch(`/api/v1/incidents/emergency/${id}/resolve`, { method: 'PUT' });
      fetchIncidents();
    } catch (err) {
      console.error(err);
    }
  };

  const handleResolveSecurity = async (id: number) => {
    try {
      await fetch(`/api/v1/incidents/security/${id}/resolve`, { method: 'PUT' });
      fetchIncidents();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="w-full h-full p-4 sm:p-8 flex flex-col gap-6 overflow-y-auto font-sans pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#27272A] gap-2">
        <div>
          <div className="flex items-center gap-2 text-[#C5A880] text-xs font-bold tracking-widest uppercase font-mono">
            <AlertTriangle className="w-4 h-4 text-[#C5A880]" />
            <span>SAFETY &amp; INCIDENTS &bull; LIVE ALERTS</span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Real-time management of technical train issues and station passenger assistance alerts.
          </p>
        </div>
        <div className="text-[10px] text-neutral-400 uppercase tracking-widest border border-[#27272A] px-3 py-1 rounded-xs bg-[#18181B] font-mono">
          SAFETY SYSTEM: ACTIVE
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64 text-neutral-500 text-sm">
          Loading active incidents...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Emergency Incidents Subtype (Left Pane) */}
          <div className="bg-[#18181B]/95 border border-[#27272A] rounded-sm p-6 space-y-4 shadow-lg">
            <div className="flex items-center justify-between border-b border-[#27272A] pb-2 font-mono">
              <span className="text-xs font-bold text-[#C5A880] flex items-center gap-1.5 uppercase">
                <Zap className="w-3.5 h-3.5 text-[#C5A880]" />
                Train &amp; Track Technical Alerts
              </span>
              <span className="text-[9px] text-neutral-500">CATEGORY: TECHNICAL</span>
            </div>

            <div className="space-y-3">
              {emergencies.map((em) => (
                <div key={em.Incident_ID} className="bg-[#121214] border border-[#27272A] p-4 rounded-xs flex flex-col gap-2.5">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-[9px] text-neutral-400 font-bold uppercase font-mono">
                        INCIDENT #{em.Incident_ID} • {new Date(em.Timestamp).toLocaleTimeString()}
                      </div>
                      <div className="text-xs font-bold text-white mt-0.5">
                        {em.Location_Description || 'Rail Section Alert'}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 text-[8px] font-bold rounded-xs uppercase font-mono ${
                        em.Resolution_Status === 'Resolved'
                          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                          : 'bg-[#C5A880]/15 text-[#C5A880] border border-[#C5A880]/30 animate-pulse'
                      }`}>
                        {em.Resolution_Status}
                      </span>

                      {em.Resolution_Status !== 'Resolved' && (
                        <button
                          onClick={() => handleResolveEmergency(em.Incident_ID)}
                          className="bg-[#C5A880] hover:bg-[#D4B995] text-[#121214] text-[9px] font-bold px-2.5 py-1 rounded-xs uppercase flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Check className="w-3 h-3" />
                          Mark Resolved
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Status Flags */}
                  <div className="flex items-center gap-2 text-[9px] font-mono">
                    <span className={`px-2 py-0.5 rounded-xs font-bold ${
                      em.Breakdown ? 'bg-red-500/15 text-red-300 border border-red-500/30' : 'bg-[#18181B] text-neutral-500 border border-[#27272A]'
                    }`}>
                      BREAKDOWN: {em.Breakdown ? 'YES' : 'NO'}
                    </span>
                    <span className={`px-2 py-0.5 rounded-xs font-bold ${
                      em.Power ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30' : 'bg-[#18181B] text-neutral-500 border border-[#27272A]'
                    }`}>
                      POWER: {em.Power ? 'FAILURE' : 'OK'}
                    </span>
                    <span className={`px-2 py-0.5 rounded-xs font-bold ${
                      em.Signal_Failure ? 'bg-[#C5A880]/15 text-[#C5A880] border border-[#C5A880]/30' : 'bg-[#18181B] text-neutral-500 border border-[#27272A]'
                    }`}>
                      SIGNALS: {em.Signal_Failure ? 'GLITCH' : 'OK'}
                    </span>
                  </div>

                  <div className="text-[10px] text-neutral-400 pt-2 border-t border-[#27272A] flex justify-between font-mono">
                    <span>Train: #{em.Metro_ID} ({em.Metro_Model?.split(' ')[0]})</span>
                    <span>Reported By: {em.Reporter_Name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Security Incidents Subtype (Right Pane) */}
          <div className="bg-[#18181B]/95 border border-[#27272A] rounded-sm p-6 space-y-4 shadow-lg">
            <div className="flex items-center justify-between border-b border-[#27272A] pb-2 font-mono">
              <span className="text-xs font-bold text-[#C5A880] flex items-center gap-1.5 uppercase">
                <ShieldCheck className="w-3.5 h-3.5 text-[#C5A880]" />
                Station &amp; Passenger Assistance Alerts
              </span>
              <span className="text-[9px] text-[#C5A880]">CATEGORY: STATION</span>
            </div>

            <div className="space-y-3">
              {securities.map((sec) => (
                <div key={sec.Security_Inc_ID} className="bg-[#121214] border border-[#27272A] p-4 rounded-xs flex flex-col gap-2.5">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-[9px] text-neutral-400 font-bold uppercase font-mono">
                        REPORT #{sec.Security_Inc_ID} • {new Date(sec.Timestamp).toLocaleTimeString()}
                      </div>
                      <div className="text-xs font-bold text-white mt-0.5">
                        {sec.Incident_Type} @ {sec.Station_Name}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 text-[8px] font-bold rounded-xs uppercase font-mono ${
                        sec.Resolution_Status === 'Resolved'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : 'bg-[#C5A880]/15 text-[#C5A880] border border-[#C5A880]/30 animate-pulse'
                      }`}>
                        {sec.Resolution_Status}
                      </span>

                      {sec.Resolution_Status !== 'Resolved' && (
                        <button
                          onClick={() => handleResolveSecurity(sec.Security_Inc_ID)}
                          className="bg-[#C5A880] hover:bg-[#D4B995] text-[#121214] text-[9px] font-bold px-2.5 py-1 rounded-xs uppercase flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Check className="w-3 h-3" />
                          Mark Resolved
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-neutral-300 leading-relaxed bg-[#18181B] p-2.5 border border-[#27272A] rounded-xs font-sans">
                    {sec.Details}
                  </p>

                  <div className="text-[10px] text-neutral-400 pt-1 flex justify-between font-mono">
                    <span>Station: {sec.Station_Name} ({sec.Station_Type})</span>
                    <span>Staff Member: {sec.Reporter_Name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
