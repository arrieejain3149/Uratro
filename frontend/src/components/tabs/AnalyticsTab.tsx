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
    <div className="w-full h-full p-4 sm:p-8 flex flex-col gap-6 overflow-y-auto font-mono pb-24">
      {/* Analytics Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-neutral-800 gap-2">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold tracking-widest uppercase">
            <BarChart3 className="w-4 h-4 animate-pulse" />
            <span>DATA ANALYTICS COMMAND CENTER // OLAP VIEWS</span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Real-time multi-dimensional aggregations backed by MySQL indexed analytical views.
          </p>
        </div>
        <div className="text-[10px] text-neutral-500 uppercase tracking-widest border border-neutral-800 px-3 py-1 rounded-xs bg-black/40">
          SQL ENGINE: MYSQL 8.0 // WINDOW AGGREGATES
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64 text-neutral-500 text-sm">
          Computing Analytical Rollups...
        </div>
      ) : (
        <div className="space-y-6">
          {/* Top Row: Route Financial Yield & Fleet MTBF */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Route Financial Yield */}
            <div className="bg-[#0c0d12]/90 border border-neutral-800 rounded-sm p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-800/80 pb-2">
                <span className="text-xs font-bold text-neutral-200 flex items-center gap-1.5 uppercase">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  Route Financial Yield & Dispatches
                </span>
                <span className="text-[9px] text-neutral-500">VIEW: vw_RouteFinancialYield</span>
              </div>

              <div className="space-y-3">
                {routeYield.map((r) => (
                  <div key={r.Route_ID} className="bg-black/60 border border-neutral-900 p-3 rounded-xs flex flex-col gap-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-white font-bold">{r.Route_Name}</span>
                      <span className="text-emerald-400 font-extrabold text-sm">
                        ₹{Number(r.Total_Route_Revenue).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-[10px] text-neutral-400 pt-2 border-t border-neutral-900">
                      <div>
                        <span className="text-neutral-500 block">DISPATCH TRIPS</span>
                        <span className="text-neutral-200 font-semibold">{r.Daily_Dispatched_Trips} Scheduled</span>
                      </div>
                      <div>
                        <span className="text-neutral-500 block">COMMUTER TRIPS</span>
                        <span className="text-neutral-200 font-semibold">{r.Total_Commuter_Trips} Recorded</span>
                      </div>
                      <div>
                        <span className="text-neutral-500 block">AVG TICKET YIELD</span>
                        <span className="text-cyan-400 font-semibold">₹{r.Average_Ticket_Yield}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Fleet Health & MTBF Reliability */}
            <div className="bg-[#0c0d12]/90 border border-neutral-800 rounded-sm p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-800/80 pb-2">
                <span className="text-xs font-bold text-neutral-200 flex items-center gap-1.5 uppercase">
                  <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                  Fleet Reliability & Failure Diagnostics
                </span>
                <span className="text-[9px] text-neutral-500">VIEW: vw_FleetHealthAnalytics</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-neutral-800 text-[10px] text-neutral-500 uppercase">
                      <th className="py-2">Metro Model</th>
                      <th className="py-2">Status</th>
                      <th className="py-2 text-center">Mech</th>
                      <th className="py-2 text-center">Power</th>
                      <th className="py-2 text-center">Signal</th>
                      <th className="py-2 text-right">Work Orders</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-900">
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
            <div className="bg-[#0c0d12]/90 border border-neutral-800 rounded-sm p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-800/80 pb-2">
                <span className="text-xs font-bold text-neutral-200 flex items-center gap-1.5 uppercase">
                  <Users className="w-3.5 h-3.5 text-pink-400" />
                  Origin-Destination (O-D) Commuter Flow Matrix
                </span>
                <span className="text-[9px] text-neutral-500">VIEW: vw_OriginDestinationMatrix</span>
              </div>

              <div className="overflow-x-auto max-h-72">
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 bg-[#0c0d12]">
                    <tr className="border-b border-neutral-800 text-[10px] text-neutral-500 uppercase">
                      <th className="py-2">Origin Station</th>
                      <th className="py-2">&rarr; Destination</th>
                      <th className="py-2 text-center">Volume</th>
                      <th className="py-2 text-right">Avg Mins</th>
                      <th className="py-2 text-right">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-900">
                    {odMatrix.map((od, i) => (
                      <tr key={i} className="hover:bg-neutral-900/40">
                        <td className="py-2 text-neutral-200 font-semibold">{od.Origin_Station}</td>
                        <td className="py-2 text-cyan-400">{od.Destination_Station}</td>
                        <td className="py-2 text-center font-bold text-white">{od.Total_Journeys}</td>
                        <td className="py-2 text-right text-neutral-400">{od.Avg_Travel_Minutes || '22.0'} m</td>
                        <td className="py-2 text-right text-emerald-400 font-bold">₹{od.Total_Revenue_Generated}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Station Hourly Congestion Heatmap */}
            <div className="bg-[#0c0d12]/90 border border-neutral-800 rounded-sm p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-800/80 pb-2">
                <span className="text-xs font-bold text-neutral-200 flex items-center gap-1.5 uppercase">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                  Station Hourly Congestion & Bottlenecks
                </span>
                <span className="text-[9px] text-neutral-500">VIEW: vw_StationHourlyCongestion</span>
              </div>

              <div className="overflow-x-auto max-h-72">
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 bg-[#0c0d12]">
                    <tr className="border-b border-neutral-800 text-[10px] text-neutral-500 uppercase">
                      <th className="py-2">Station</th>
                      <th className="py-2">Type</th>
                      <th className="py-2 text-center">Hour</th>
                      <th className="py-2 text-center">Taps</th>
                      <th className="py-2 text-right">Tier</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-900">
                    {congestion.map((c, i) => (
                      <tr key={i} className="hover:bg-neutral-900/40">
                        <td className="py-2 text-neutral-200 font-semibold">{c.Station_Name}</td>
                        <td className="py-2 text-[10px] text-neutral-500">{c.Station_Type}</td>
                        <td className="py-2 text-center font-mono text-cyan-400">{c.Hour_Of_Day}:00</td>
                        <td className="py-2 text-center font-bold text-white">{c.Entries_Count}</td>
                        <td className="py-2 text-right">
                          <span className={`px-1.5 py-0.5 text-[8px] rounded-xs font-bold uppercase ${
                            c.Congestion_Tier === 'Severe Congestion' 
                              ? 'bg-red-500/20 text-red-400' 
                              : c.Congestion_Tier === 'Moderate Transit' 
                              ? 'bg-amber-500/20 text-amber-300' 
                              : 'bg-emerald-500/20 text-emerald-400'
                          }`}>
                            {c.Congestion_Tier}
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
