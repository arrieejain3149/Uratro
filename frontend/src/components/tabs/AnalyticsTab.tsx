import { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, Users, ShieldAlert, Cpu } from 'lucide-react';

export default function AnalyticsTab() {
  const [odMatrix, setOdMatrix] = useState<any[]>([]);
  const [congestion, setCongestion] = useState<any[]>([]);
  const [fleetHealth, setFleetHealth] = useState<any[]>([]);
  const [routeYield, setRouteYield] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/v1/analytics/od-matrix').then(r => r.json()),
      fetch('/api/v1/analytics/congestion-heatmap').then(r => r.json()),
      fetch('/api/v1/analytics/fleet-health').then(r => r.json()),
      fetch('/api/v1/analytics/financial-yield').then(r => r.json())
    ]).then(([odRes, congRes, fleetRes, yieldRes]) => {
      if (odRes.status === 'success') setOdMatrix(odRes.data);
      if (congRes.status === 'success') setCongestion(congRes.data);
      if (fleetRes.status === 'success') setFleetHealth(fleetRes.data);
      if (yieldRes.status === 'success') setRouteYield(yieldRes.data);
    }).catch(err => console.error("Error loading analytics:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="w-full h-full p-4 sm:p-8 flex flex-col gap-6 overflow-y-auto font-sans pb-24">
      {/* Analytics Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#27272A] gap-2">
        <div>
          <div className="flex items-center gap-2 text-[#C5A880] text-xs font-bold tracking-widest uppercase font-mono">
            <BarChart3 className="w-4 h-4 animate-pulse" />
            <span>METRO ANALYTICS &bull; PASSENGER &amp; REVENUE DASHBOARD</span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Live analytics on ticket sales, busiest routes, train reliability, and station crowd levels.
          </p>
        </div>
        <div className="text-[10px] text-neutral-400 uppercase tracking-widest border border-[#27272A] px-3 py-1 rounded-xs bg-[#18181B] font-mono">
          DATABASE: CONNECTED &bull; REAL-TIME METRICS
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64 text-neutral-500 text-sm">
          Loading live analytics data...
        </div>
      ) : (
        <div className="space-y-6">
          {/* Top Row: Route Financial Yield & Fleet MTBF */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Route Financial Yield */}
            <div className="bg-[#18181B]/95 border border-[#27272A] rounded-sm p-6 space-y-4 shadow-lg">
              <div className="flex items-center justify-between border-b border-[#27272A] pb-2">
                <span className="text-xs font-bold text-neutral-200 flex items-center gap-1.5 uppercase font-mono">
                  <TrendingUp className="w-3.5 h-3.5 text-[#C5A880]" />
                  Route Revenue &amp; Scheduled Trips
                </span>
                <span className="text-[9px] text-[#C5A880] font-mono">LIVE REVENUE STATS</span>
              </div>

              <div className="space-y-3">
                {routeYield.map((r) => (
                  <div key={r.Route_ID} className="bg-[#121214] border border-[#27272A] p-3.5 rounded-xs flex flex-col gap-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-white font-bold">{r.Route_Name}</span>
                      <span className="text-[#C5A880] font-extrabold text-base">
                        ₹{Number(r.Total_Route_Revenue).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-[10px] text-neutral-400 pt-2 border-t border-[#27272A] font-mono">
                      <div>
                        <span className="text-neutral-500 block">SCHEDULED TRIPS</span>
                        <span className="text-neutral-200 font-semibold">{r.Daily_Dispatched_Trips} Trips</span>
                      </div>
                      <div>
                        <span className="text-neutral-500 block">PASSENGER TRIPS</span>
                        <span className="text-neutral-200 font-semibold">{r.Total_Commuter_Trips} Passengers</span>
                      </div>
                      <div>
                        <span className="text-neutral-500 block">AVG TICKET FARE</span>
                        <span className="text-[#C5A880] font-semibold">₹{r.Average_Ticket_Yield}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Fleet Health & MTBF Reliability */}
            <div className="bg-[#18181B]/95 border border-[#27272A] rounded-sm p-6 space-y-4 shadow-lg">
              <div className="flex items-center justify-between border-b border-[#27272A] pb-2">
                <span className="text-xs font-bold text-neutral-200 flex items-center gap-1.5 uppercase font-mono">
                  <Cpu className="w-3.5 h-3.5 text-[#C5A880]" />
                  Train Fleet Condition &amp; Reliability
                </span>
                <span className="text-[9px] text-[#C5A880] font-mono">FLEET HEALTH STATS</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#27272A] text-[10px] text-neutral-500 uppercase font-mono">
                      <th className="py-2">Train Model</th>
                      <th className="py-2">Status</th>
                      <th className="py-2 text-center">Mechanical</th>
                      <th className="py-2 text-center">Power</th>
                      <th className="py-2 text-center">Signals</th>
                      <th className="py-2 text-right">Repairs Done</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#27272A]">
                    {fleetHealth.map((m) => (
                      <tr key={m.Metro_ID} className="hover:bg-neutral-900/40">
                        <td className="py-2.5 font-bold text-white text-[11px]">
                          #{m.Metro_ID} {m.Model}
                        </td>
                        <td className="py-2.5">
                          <span className={`px-1.5 py-0.5 text-[8px] rounded-xs font-bold uppercase ${
                            m.Current_Status === 'Active' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                          }`}>
                            {m.Current_Status}
                          </span>
                        </td>
                        <td className="py-2.5 text-center text-red-400">{m.Mechanical_Breakdowns || 0}</td>
                        <td className="py-2.5 text-center text-amber-400">{m.Power_Failures || 0}</td>
                        <td className="py-2.5 text-center text-blue-400">{m.Signaling_Errors || 0}</td>
                        <td className="py-2.5 text-right font-semibold text-neutral-300">{m.Total_Maintenance_Jobs || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* Bottom Row: Origin-Destination Matrix & Congestion Heatmap */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* O-D Commuter Flow Matrix */}
            <div className="bg-[#18181B]/95 border border-[#27272A] rounded-sm p-6 space-y-4 shadow-lg">
              <div className="flex items-center justify-between border-b border-[#27272A] pb-2">
                <span className="text-xs font-bold text-neutral-200 flex items-center gap-1.5 uppercase font-mono">
                  <Users className="w-3.5 h-3.5 text-[#C5A880]" />
                  Popular Passenger Routes (From - To)
                </span>
                <span className="text-[9px] text-[#C5A880] font-mono">TRAVEL PATTERNS</span>
              </div>

              <div className="overflow-x-auto max-h-72">
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 bg-[#18181B]">
                    <tr className="border-b border-[#27272A] text-[10px] text-neutral-500 uppercase font-mono">
                      <th className="py-2">Origin Station</th>
                      <th className="py-2">&rarr; Destination</th>
                      <th className="py-2 text-center">Passengers</th>
                      <th className="py-2 text-right">Avg Time</th>
                      <th className="py-2 text-right">Total Fare</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#27272A]">
                    {odMatrix.map((od, i) => (
                      <tr key={i} className="hover:bg-[#222226]">
                        <td className="py-2 text-neutral-200 font-semibold">{od.Origin_Station}</td>
                        <td className="py-2 text-[#C5A880]">{od.Destination_Station}</td>
                        <td className="py-2 text-center font-bold text-white">{od.Total_Journeys}</td>
                        <td className="py-2 text-right text-neutral-400 font-mono">{od.Avg_Travel_Minutes || '22.0'} min</td>
                        <td className="py-2 text-right text-[#C5A880] font-bold font-mono">₹{od.Total_Revenue_Generated}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Station Hourly Congestion Heatmap */}
            <div className="bg-[#18181B]/95 border border-[#27272A] rounded-sm p-6 space-y-4 shadow-lg">
              <div className="flex items-center justify-between border-b border-[#27272A] pb-2">
                <span className="text-xs font-bold text-neutral-200 flex items-center gap-1.5 uppercase font-mono">
                  <ShieldAlert className="w-3.5 h-3.5 text-[#C5A880]" />
                  Busiest Stations by Hour
                </span>
                <span className="text-[9px] text-[#C5A880] font-mono">CROWD MONITOR</span>
              </div>

              <div className="overflow-x-auto max-h-72">
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 bg-[#18181B]">
                    <tr className="border-b border-[#27272A] text-[10px] text-neutral-500 uppercase font-mono">
                      <th className="py-2">Station</th>
                      <th className="py-2">Type</th>
                      <th className="py-2 text-center">Time</th>
                      <th className="py-2 text-center">Entries</th>
                      <th className="py-2 text-right">Crowd Level</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#27272A]">
                    {congestion.map((c, i) => (
                      <tr key={i} className="hover:bg-[#222226]">
                        <td className="py-2 text-neutral-200 font-semibold">{c.Station_Name}</td>
                        <td className="py-2 text-[10px] text-neutral-500">{c.Station_Type}</td>
                        <td className="py-2 text-center font-mono text-[#C5A880]">{c.Hour_Of_Day}:00</td>
                        <td className="py-2 text-center font-bold text-white font-mono">{c.Entries_Count}</td>
                        <td className="py-2 text-right">
                          <span className={`px-2 py-0.5 text-[8px] rounded-xs font-bold uppercase ${
                            c.Congestion_Tier === 'Severe Congestion' 
                              ? 'bg-red-500/15 text-red-300 border border-red-500/30' 
                              : c.Congestion_Tier === 'Moderate Transit' 
                              ? 'bg-[#C5A880]/15 text-[#C5A880] border border-[#C5A880]/30' 
                              : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                          }`}>
                            {c.Congestion_Tier === 'Severe Congestion' ? 'Very Busy' : c.Congestion_Tier === 'Moderate Transit' ? 'Moderate' : 'Normal'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
