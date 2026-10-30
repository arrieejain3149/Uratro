import { useEffect, useState } from 'react';
import { Train, Calendar, Wrench } from 'lucide-react';

export default function FleetTab() {
  const [metros, setMetros] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/v1/fleet/metros').then(r => r.json()),
      fetch('/api/v1/fleet/schedules').then(r => r.json()),
      fetch('/api/v1/maintenance/jobs').then(r => r.json())
    ]).then(([mRes, sRes, jRes]) => {
      if (mRes.status === 'success') setMetros(mRes.data);
      if (sRes.status === 'success') setSchedules(sRes.data);
      if (jRes.status === 'success') setJobs(jRes.data);
    }).catch(err => console.error("Error loading fleet data:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleCompleteJob = async (jobId: number) => {
    try {
      const res = await fetch(`/api/v1/maintenance/jobs/${jobId}/complete`, { method: 'PUT' });
      const data = await res.json();
      if (data.status === 'success') {
        // Refresh jobs and metros
        const jRes = await (await fetch('/api/v1/maintenance/jobs')).json();
        const mRes = await (await fetch('/api/v1/fleet/metros')).json();
        setJobs(jRes.data);
        setMetros(mRes.data);
      }
    } catch (err) {
      console.error("Error completing job:", err);
    }
  };

  return (
    <div className="w-full h-full p-4 sm:p-8 flex flex-col gap-6 overflow-y-auto font-mono pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-neutral-800 gap-2">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold tracking-widest uppercase">
            <Train className="w-4 h-4 animate-pulse" />
            <span>FLEET OPERATIONS // ROLLING STOCK & WORK ORDERS</span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Asset tracking, daily driver roster scheduling, and technical maintenance work orders.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64 text-neutral-500 text-sm">
          Loading Fleet Assets & Schedules...
        </div>
      ) : (
        <div className="space-y-6">
          {/* Metros Grid */}
          <div>
            <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Train className="w-3.5 h-3.5 text-cyan-400" />
              Rolling Stock Rakes ({metros.length} Units)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {metros.map((m) => (
                <div key={m.Metro_ID} className="bg-[#0c0d12]/90 border border-neutral-800 p-4 rounded-sm flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] text-neutral-500 font-bold">RAKE #{m.Metro_ID}</span>
                      <span className={`px-1.5 py-0.5 text-[8px] rounded-xs font-bold uppercase ${
                        m.Current_Status === 'Active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {m.Current_Status}
                      </span>
                    </div>
                    <div className="text-sm font-bold text-white leading-tight mb-2">
                      {m.Model}
                    </div>
                  </div>
                  <div className="text-[10px] text-neutral-400 pt-2 border-t border-neutral-900 flex justify-between">
                    <span>CAPACITY:</span>
                    <span className="text-white font-bold">{m.Capacity} PAX</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Schedules and Maintenance split */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Daily Schedule Timetable */}
            <div className="bg-[#0c0d12]/90 border border-neutral-800 rounded-sm p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                <span className="text-xs font-bold text-neutral-200 flex items-center gap-1.5 uppercase">
                  <Calendar className="w-3.5 h-3.5 text-blue-400" />
                  Daily Dispatch Timetable
                </span>
                <span className="text-[9px] text-neutral-500">RELATION: Daily_Train_Schedule</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-neutral-800 text-[10px] text-neutral-500 uppercase">
                      <th className="py-2">Rake</th>
                      <th className="py-2">Line</th>
                      <th className="py-2">Driver</th>
                      <th className="py-2 text-right">Shift</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-900">
                    {schedules.map((s) => (
                      <tr key={s.Schedule_ID} className="hover:bg-neutral-900/40">
                        <td className="py-2.5 font-bold text-white text-[11px]">
                          #{s.Metro_ID} ({s.Metro_Model?.split(' ')[0]})
                        </td>
                        <td className="py-2.5 text-neutral-300">{s.Route_Name}</td>
                        <td className="py-2.5 text-cyan-400">{s.Driver_Name}</td>
                        <td className="py-2.5 text-right">
                          <span className="px-2 py-0.5 text-[9px] bg-neutral-800 text-neutral-300 rounded-xs uppercase">
                            {s.Shift}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Maintenance Work Orders */}
            <div className="bg-[#0c0d12]/90 border border-neutral-800 rounded-sm p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                <span className="text-xs font-bold text-neutral-200 flex items-center gap-1.5 uppercase">
                  <Wrench className="w-3.5 h-3.5 text-amber-400" />
                  Maintenance Work Orders
                </span>
                <span className="text-[9px] text-neutral-500">RELATION: Maintenance_Job</span>
              </div>

              <div className="space-y-3">
                {jobs.map((j) => (
                  <div key={j.Job_ID} className="bg-black/60 border border-neutral-900 p-3 rounded-xs flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[9px] text-neutral-500 font-bold uppercase">
                          JOB #{j.Job_ID} // RAKE #{j.Metro_ID} ({j.Metro_Model})
                        </span>
                        <div className="text-xs font-bold text-white mt-0.5">
                          {j.Component}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-1.5 py-0.5 text-[8px] font-bold rounded-xs uppercase ${
                          j.Resolution_Status === 'Completed'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-amber-500/20 text-amber-400 animate-pulse'
                        }`}>
                          {j.Resolution_Status}
                        </span>

                        {j.Resolution_Status !== 'Completed' && (
                          <button
                            onClick={() => handleCompleteJob(j.Job_ID)}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white text-[9px] font-bold px-2 py-1 rounded-xs uppercase transition-colors"
                          >
                            Mark Done
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="text-[10px] text-neutral-400 flex flex-wrap gap-2 pt-1 border-t border-neutral-900">
                      <span>Assigned:</span>
                      {j.assigned_engineers?.map((e: any, idx: number) => (
                        <span key={idx} className="text-cyan-400 bg-neutral-900 px-1.5 py-0.5 rounded-xs">
                          {e.Engineer_Name} ({e.Role_on_Job})
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
