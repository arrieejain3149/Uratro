import { useState, useEffect } from 'react';
import { CheckCircle, Play, AlertTriangle, RefreshCw } from 'lucide-react';
import type { AuthUser } from '../../types/auth';

interface ScheduleItem {
  Schedule_ID: number;
  Date: string;
  Shift: string;
  Metro_ID: number;
  Metro_Model: string;
  Current_Status: string;
  Route_ID: number;
  Route_Name: string;
  Driver_ID: number;
  Driver_Name: string;
}

interface MaintenanceJob {
  Job_ID: number;
  Component: string;
  Job_Type: string;
  Scheduled_Date: string;
  Resolution_Status: 'Scheduled' | 'In Progress' | 'Completed';
  Metro_ID: number;
  Metro_Model: string;
  Metro_Status: string;
  assigned_engineers?: Array<{ Emp_ID: number; Engineer_Name: string; Role_on_Job: string }>;
}

interface EmployeePortalProps {
  authUser: AuthUser;
  onOpenAuthModal: () => void;
  onOpenDispatchModal: () => void;
}

export default function EmployeePortal({
  authUser,
  onOpenAuthModal,
  onOpenDispatchModal,
}: EmployeePortalProps) {
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [jobs, setJobs] = useState<MaintenanceJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchStaffData = () => {
    setLoading(true);
    // 1. Fetch schedules
    fetch('/api/v1/fleet/schedules')
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'success' && Array.isArray(data.data)) {
          setSchedules(data.data);
        }
      })
      .catch((err) => console.error('Error fetching schedules:', err));

    // 2. Fetch maintenance jobs
    fetch('/api/v1/maintenance/jobs')
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'success' && Array.isArray(data.data)) {
          setJobs(data.data);
        }
      })
      .catch((err) => console.error('Error fetching maintenance jobs:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStaffData();
  }, []);

  const handleUpdateJobStatus = async (
    jobId: number,
    newStatus: 'Scheduled' | 'In Progress' | 'Completed'
  ) => {
    setUpdatingId(jobId);
    try {
      const res = await fetch(`/api/v1/maintenance/jobs/${jobId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setJobs((prev) =>
          prev.map((j) => (j.Job_ID === jobId ? { ...j, Resolution_Status: newStatus } : j))
        );
      }
    } catch (err) {
      console.error('Error updating job status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  // Group jobs by resolution status
  const scheduledJobs = jobs.filter(
    (j) => !j.Resolution_Status || j.Resolution_Status === 'Scheduled'
  );
  const inProgressJobs = jobs.filter((j) => j.Resolution_Status === 'In Progress');
  const completedJobs = jobs.filter((j) => j.Resolution_Status === 'Completed');

  return (
    <div className="w-full h-full overflow-y-auto px-4 sm:px-8 md:px-12 py-6 sm:py-8 font-sans select-none text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#242428]">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-white mt-1">
            Operations and Maintenance
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 rounded-xs bg-[#18181B] border border-[#27272A] flex items-center gap-3">
            <div>
              <div className="text-[9px] uppercase tracking-wider text-neutral-400 font-mono">
                Staff ID: {authUser.id || 'EMP-101'}
              </div>
              <div className="text-xs font-medium text-white">{authUser.name}</div>
            </div>
            <div className="h-6 w-[1px] bg-[#27272A]" />
            <div>
              <div className="text-[9px] uppercase tracking-wider text-[#C5A880] font-mono">
                Role
              </div>
              <div className="text-xs font-mono text-neutral-300">
                {authUser.badge || 'Operations Staff'}
              </div>
            </div>
          </div>

          <button
            onClick={onOpenDispatchModal}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xs bg-red-950/60 border border-red-700/60 hover:bg-red-900/60 text-red-200 text-xs font-mono transition-colors cursor-pointer"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
            <span>SOS Incident</span>
          </button>

          <button
            onClick={onOpenAuthModal}
            className="px-3 py-2 rounded-xs border border-[#27272A] bg-[#141416] hover:bg-neutral-800 text-neutral-300 text-xs font-mono transition-colors cursor-pointer"
          >
            Switch Role
          </button>
        </div>
      </div>

      {/* Grid: Daily Shift Roster + Maintenance Board */}
      <div className="mt-8 space-y-10">
        {/* Section 1: Maintenance Board */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-white mt-0.5">
                Rake Maintenance ({jobs.length} Active Work Orders)
              </h2>
            </div>

            <button
              onClick={fetchStaffData}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xs border border-[#27272A] bg-[#18181B] hover:bg-neutral-800 text-neutral-300 text-xs font-mono cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          {/* Maintenance Status Columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Column 1: Scheduled */}
            <div className="p-4 rounded-xs bg-[#141417] border border-[#242428] space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#242428]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span className="text-xs font-mono uppercase tracking-wider text-neutral-300 font-semibold">
                    Scheduled
                  </span>
                </div>
                <span className="text-xs font-mono px-1.5 py-0.5 rounded-xs bg-[#242428] text-neutral-400">
                  {scheduledJobs.length}
                </span>
              </div>

              <div className="space-y-3 min-h-[220px]">
                {scheduledJobs.map((job) => (
                  <div
                    key={job.Job_ID}
                    className="p-3.5 rounded-xs bg-[#18181B] border border-[#27272A] hover:border-neutral-700 space-y-2 font-mono text-xs transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-[#C5A880] font-bold">
                        Rake #{job.Metro_ID}
                      </span>
                      <span className="text-[10px] text-neutral-400 px-1.5 py-0.5 rounded-xs bg-[#242428]">
                        {job.Job_Type}
                      </span>
                    </div>

                    <div className="text-white font-medium text-xs">
                      {job.Component}
                    </div>

                    <div className="text-[10px] text-neutral-400">
                      Model: {job.Metro_Model} &bull; Due: {job.Scheduled_Date?.split('T')[0] || 'Today'}
                    </div>

                    <div className="pt-2 border-t border-[#242428] flex justify-end">
                      <button
                        onClick={() => handleUpdateJobStatus(job.Job_ID, 'In Progress')}
                        disabled={updatingId === job.Job_ID}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-xs bg-[#242428] hover:bg-[#323238] text-neutral-200 text-[11px] transition-colors cursor-pointer"
                      >
                        <Play className="w-3 h-3 text-amber-400" />
                        <span>Start Work</span>
                      </button>
                    </div>
                  </div>
                ))}
                {scheduledJobs.length === 0 && (
                  <div className="h-32 flex items-center justify-center text-xs text-neutral-500 font-mono">
                    No scheduled jobs
                  </div>
                )}
              </div>
            </div>

            {/* Column 2: In Progress */}
            <div className="p-4 rounded-xs bg-[#141417] border border-[#242428] space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#242428]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                  <span className="text-xs font-mono uppercase tracking-wider text-neutral-300 font-semibold">
                    In Progress
                  </span>
                </div>
                <span className="text-xs font-mono px-1.5 py-0.5 rounded-xs bg-[#242428] text-neutral-400">
                  {inProgressJobs.length}
                </span>
              </div>

              <div className="space-y-3 min-h-[220px]">
                {inProgressJobs.map((job) => (
                  <div
                    key={job.Job_ID}
                    className="p-3.5 rounded-xs bg-[#18181B] border border-blue-900/40 hover:border-blue-700/60 space-y-2 font-mono text-xs transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-[#C5A880] font-bold">
                        Rake #{job.Metro_ID}
                      </span>
                      <span className="text-[10px] text-blue-300 px-1.5 py-0.5 rounded-xs bg-blue-950/60">
                        Active Servicing
                      </span>
                    </div>

                    <div className="text-white font-medium text-xs">
                      {job.Component}
                    </div>

                    <div className="text-[10px] text-neutral-400">
                      Assigned: {job.assigned_engineers?.[0]?.Engineer_Name || 'Lead Tech'}
                    </div>

                    <div className="pt-2 border-t border-[#242428] flex justify-end">
                      <button
                        onClick={() => handleUpdateJobStatus(job.Job_ID, 'Completed')}
                        disabled={updatingId === job.Job_ID}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-xs bg-emerald-950/60 border border-emerald-800/60 hover:bg-emerald-900/60 text-emerald-200 text-[11px] transition-colors cursor-pointer"
                      >
                        <CheckCircle className="w-3 h-3 text-emerald-400" />
                        <span>Mark Completed</span>
                      </button>
                    </div>
                  </div>
                ))}
                {inProgressJobs.length === 0 && (
                  <div className="h-32 flex items-center justify-center text-xs text-neutral-500 font-mono">
                    No jobs in progress
                  </div>
                )}
              </div>
            </div>

            {/* Column 3: Completed */}
            <div className="p-4 rounded-xs bg-[#141417] border border-[#242428] space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#242428]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-xs font-mono uppercase tracking-wider text-neutral-300 font-semibold">
                    Completed
                  </span>
                </div>
                <span className="text-xs font-mono px-1.5 py-0.5 rounded-xs bg-[#242428] text-neutral-400">
                  {completedJobs.length}
                </span>
              </div>

              <div className="space-y-3 min-h-[220px]">
                {completedJobs.map((job) => (
                  <div
                    key={job.Job_ID}
                    className="p-3.5 rounded-xs bg-[#18181B] border border-[#27272A] opacity-80 space-y-2 font-mono text-xs"
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-neutral-300 font-bold">
                        Rake #{job.Metro_ID}
                      </span>
                      <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Restored Active
                      </span>
                    </div>

                    <div className="text-neutral-300 text-xs">
                      {job.Component}
                    </div>

                    <div className="text-[10px] text-neutral-500">
                      Inspection Verified &bull; Depot Cleared
                    </div>
                  </div>
                ))}
                {completedJobs.length === 0 && (
                  <div className="h-32 flex items-center justify-center text-xs text-neutral-500 font-mono">
                    No completed jobs today
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Daily Train Dispatch Roster */}
        <div>
          <div className="mb-4">
            <h2 className="text-base font-semibold text-white mt-0.5">
              Today's Train Schedule ({schedules.length} Timetabled Runs)
            </h2>
          </div>

          <div className="overflow-x-auto rounded-xs border border-[#27272A] bg-[#18181B]">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-[#141416] text-neutral-400 uppercase text-[10px] tracking-wider border-b border-[#27272A]">
                <tr>
                  <th className="py-3 px-4">Schedule ID</th>
                  <th className="py-3 px-4">Train Rake</th>
                  <th className="py-3 px-4">Corridor Route</th>
                  <th className="py-3 px-4">Shift</th>
                  <th className="py-3 px-4">Assigned Pilot</th>
                  <th className="py-3 px-4">Rake Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#242428] text-neutral-200">
                {schedules.map((item) => (
                  <tr key={item.Schedule_ID} className="hover:bg-neutral-800/40 transition-colors">
                    <td className="py-3 px-4 text-[#C5A880] font-bold">
                      SCH-{String(item.Schedule_ID).padStart(4, '0')}
                    </td>
                    <td className="py-3 px-4 text-white">
                      Rake #{item.Metro_ID} ({item.Metro_Model})
                    </td>
                    <td className="py-3 px-4">
                      {item.Route_Name}
                    </td>
                    <td className="py-3 px-4">
                      {item.Shift}
                    </td>
                    <td className="py-3 px-4 text-neutral-300">
                      {item.Driver_Name}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-xs text-[10px] uppercase font-mono ${
                          item.Current_Status === 'Active'
                            ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60'
                            : 'bg-amber-950/60 text-amber-400 border border-amber-800/60'
                        }`}
                      >
                        {item.Current_Status}
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
  );
}
