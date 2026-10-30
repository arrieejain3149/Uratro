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
    <div className="w-full h-full p-4 sm:p-8 flex flex-col gap-6 overflow-y-auto font-mono pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-neutral-800 gap-2">
        <div>
          <div className="flex items-center gap-2 text-red-500 text-xs font-bold tracking-widest uppercase">
            <AlertTriangle className="w-4 h-4 animate-bounce" />
            <span>INCIDENT COMMAND CENTER // ISA SPECIALIZATION HIERARCHY</span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Decoupled technical track/fleet failures vs. physical station security events.
          </p>
        </div>
        <div className="text-[10px] text-neutral-500 uppercase tracking-widest border border-neutral-800 px-3 py-1 rounded-xs bg-black/40">
          AUTONOMOUS CASCADE TRIGGERS ACTIVE
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64 text-neutral-500 text-sm">
          Querying Active Incidents...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Emergency Incidents Subtype (Left Pane) */}
          <div className="bg-[#0c0d12]/90 border border-red-950/40 rounded-sm p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <span className="text-xs font-bold text-red-400 flex items-center gap-1.5 uppercase">
                <Zap className="w-3.5 h-3.5" />
                Technical & Fleet Emergencies
              </span>
              <span className="text-[9px] text-neutral-500">SUBTYPE: Emergency_Incident</span>
            </div>

            <div className="space-y-3">
              {emergencies.map((em) => (
                <div key={em.Incident_ID} className="bg-black/60 border border-neutral-900 p-3.5 rounded-xs flex flex-col gap-2.5">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-[9px] text-neutral-500 font-bold uppercase">
                        INCIDENT #{em.Incident_ID} // {new Date(em.Timestamp).toLocaleTimeString()}
                      </div>
                      <div className="text-xs font-bold text-white mt-0.5">
                        {em.Location_Description || 'Rail Section Alert'}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-1.5 py-0.5 text-[8px] font-bold rounded-xs uppercase ${
                        em.Resolution_Status === 'Resolved'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-red-500/20 text-red-400 animate-pulse'
                      }`}>
                        {em.Resolution_Status}
                      </span>

                      {em.Resolution_Status !== 'Resolved' && (
                        <button
                          onClick={() => handleResolveEmergency(em.Incident_ID)}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white text-[9px] font-bold px-2 py-1 rounded-xs uppercase flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" />
                          Resolve
                        </button>
                      )}
                    </div>
                  </div>

                  {/* ISA Flags */}
                  <div className="flex items-center gap-2 text-[9px]">
                    <span className={`px-2 py-0.5 rounded-xs font-bold ${
                      em.Breakdown ? 'bg-red-900/60 text-red-300 border border-red-700' : 'bg-neutral-900 text-neutral-600'
                    }`}>
                      BREAKDOWN: {em.Breakdown ? 'YES' : 'NO'}
                    </span>
                    <span className={`px-2 py-0.5 rounded-xs font-bold ${
                      em.Power ? 'bg-amber-900/60 text-amber-300 border border-amber-700' : 'bg-neutral-900 text-neutral-600'
                    }`}>
                      POWER GRID: {em.Power ? 'FAILURE' : 'OK'}
                    </span>
                    <span className={`px-2 py-0.5 rounded-xs font-bold ${
                      em.Signal_Failure ? 'bg-blue-900/60 text-blue-300 border border-blue-700' : 'bg-neutral-900 text-neutral-600'
                    }`}>
                      SIGNAL: {em.Signal_Failure ? 'GLITCH' : 'OK'}
                    </span>
                  </div>

                  <div className="text-[10px] text-neutral-400 pt-2 border-t border-neutral-900 flex justify-between">
                    <span>Train: #{em.Metro_ID} ({em.Metro_Model?.split(' ')[0]})</span>
                    <span>Reporter: {em.Reporter_Name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Security Incidents Subtype (Right Pane) */}
          <div className="bg-[#0c0d12]/90 border border-blue-950/40 rounded-sm p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <span className="text-xs font-bold text-blue-400 flex items-center gap-1.5 uppercase">
                <ShieldCheck className="w-3.5 h-3.5" />
                Station Security Events
              </span>
              <span className="text-[9px] text-neutral-500">SUBTYPE: Security_Incident</span>
            </div>

            <div className="space-y-3">
              {securities.map((sec) => (
                <div key={sec.Security_Inc_ID} className="bg-black/60 border border-neutral-900 p-3.5 rounded-xs flex flex-col gap-2.5">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-[9px] text-neutral-500 font-bold uppercase">
                        SECURITY LOG #{sec.Security_Inc_ID} // {new Date(sec.Timestamp).toLocaleTimeString()}
                      </div>
                      <div className="text-xs font-bold text-white mt-0.5">
                        {sec.Incident_Type} @ {sec.Station_Name}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-1.5 py-0.5 text-[8px] font-bold rounded-xs uppercase ${
                        sec.Resolution_Status === 'Resolved'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-amber-500/20 text-amber-400 animate-pulse'
                      }`}>
                        {sec.Resolution_Status}
                      </span>

                      {sec.Resolution_Status !== 'Resolved' && (
                        <button
                          onClick={() => handleResolveSecurity(sec.Security_Inc_ID)}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white text-[9px] font-bold px-2 py-1 rounded-xs uppercase flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" />
                          Resolve
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-neutral-300 leading-relaxed bg-neutral-950 p-2 border border-neutral-900 rounded-xs">
                    {sec.Details}
                  </p>

                  <div className="text-[10px] text-neutral-400 pt-1 flex justify-between">
                    <span>Station Type: {sec.Station_Type}</span>
                    <span>Officer: {sec.Reporter_Name}</span>
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
