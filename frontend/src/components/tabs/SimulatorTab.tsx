import { useEffect, useState } from 'react';
import { CreditCard, ArrowRight, CheckCircle2, RefreshCw, Terminal } from 'lucide-react';

export default function SimulatorTab() {
  const [passengers, setPassengers] = useState<any[]>([]);
  const [stations, setStations] = useState<any[]>([]);
  const [activeJourneys, setActiveJourneys] = useState<any[]>([]);
  const [recentJourneys, setRecentJourneys] = useState<any[]>([]);

  // Form states
  const [selectedPassengerId, setSelectedPassengerId] = useState<number>(1);
  const [selectedEntryStationId, setSelectedEntryStationId] = useState<number>(1);
  const [selectedExitStationId, setSelectedExitStationId] = useState<number>(6);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("Smart Card");

  // Output telemetry
  const [logMessages, setLogMessages] = useState<string[]>([]);
  const [latestReceipt, setLatestReceipt] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const addLog = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogMessages(prev => [`[${timestamp}] ${msg}`, ...prev.slice(0, 8)]);
  };

  const refreshData = () => {
    Promise.all([
      fetch('/api/v1/ticketing/passengers').then(r => r.json()),
      fetch('/api/v1/stations').then(r => r.json()),
      fetch('/api/v1/ticketing/active-journeys').then(r => r.json()),
      fetch('/api/v1/ticketing/history').then(r => r.json())
    ]).then(([pRes, sRes, ajRes, hRes]) => {
      if (pRes.status === 'success') setPassengers(pRes.data);
      if (sRes.status === 'success') setStations(sRes.data);
      if (ajRes.status === 'success') setActiveJourneys(ajRes.data);
      if (hRes.status === 'success') setRecentJourneys(hRes.data);
    }).catch(err => console.error(err));
  };

  useEffect(() => {
    refreshData();
    addLog("Simulator initialized. Ready for turnstile transactions.");
  }, []);

  const handleTapIn = async () => {
    setLoading(true);
    addLog(`Calling sp_TapInPassenger(Passenger_ID=${selectedPassengerId}, Station_ID=${selectedEntryStationId})...`);
    try {
      const res = await fetch('/api/v1/ticketing/tap-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          passenger_id: selectedPassengerId,
          station_id: selectedEntryStationId,
          payment_method: selectedPaymentMethod
        })
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        addLog(`SUCCESS: ${data.message} (Ticket #${data.ticket_id})`);
        setLatestReceipt({
          type: 'TAP_IN',
          ticket_id: data.ticket_id,
          passenger_name: data.passenger.Name,
          balance: data.passenger.Card_Balance,
          message: data.message
        });
        refreshData();
      } else {
        addLog(`REJECTED: ${data.detail || 'Insufficient Balance or Station Closed'}`);
      }
    } catch (err: any) {
      addLog(`ERROR: Network exception ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTapOut = async (ticketId: number) => {
    setLoading(true);
    addLog(`Calling sp_TapOutPassenger(Ticket_ID=${ticketId}, Exit_Station_ID=${selectedExitStationId})...`);
    try {
      const res = await fetch('/api/v1/ticketing/tap-out', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticket_id: ticketId,
          exit_station_id: selectedExitStationId
        })
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        addLog(`SUCCESS: ${data.message}`);
        setLatestReceipt({
          type: 'TAP_OUT',
          ticket_id: ticketId,
          fare: data.fare,
          new_balance: data.new_balance,
          message: data.message
        });
        refreshData();
      } else {
        addLog(`REJECTED: ${data.detail || 'Invalid tap-out attempt'}`);
      }
    } catch (err: any) {
      addLog(`ERROR: Network exception ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const currentPassenger = passengers.find(p => p.Passenger_ID === selectedPassengerId);

  return (
    <div className="w-full h-full p-4 sm:p-8 flex flex-col gap-6 overflow-y-auto font-mono pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-neutral-800 gap-2">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold tracking-widest uppercase">
            <CreditCard className="w-4 h-4 animate-pulse" />
            <span>COMMUTER TURNSTILE SIMULATOR // ATOMIC LEDGER</span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Live interactive sandbox executing stored procedures <code className="text-cyan-300">sp_TapInPassenger</code> and <code className="text-cyan-300">sp_TapOutPassenger</code>.
          </p>
        </div>
        <button
          onClick={refreshData}
          className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white border border-neutral-800 px-3 py-1.5 rounded-xs bg-black/40 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Ledger
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Tap-In / Tap-Out Interactive Sandbox */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-[#0c0d12]/90 border border-neutral-800 rounded-sm p-6 space-y-5">
            <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Turnstile Terminal #01 (Gate Controls)
              </span>
              {currentPassenger && (
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-neutral-400">Card Balance:</span>
                  <span className={`font-bold ${currentPassenger.Card_Balance >= 20 ? 'text-emerald-400' : 'text-red-400'}`}>
                    ₹{Number(currentPassenger.Card_Balance).toFixed(2)}
                  </span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Select Passenger */}
              <div>
                <label className="text-[10px] text-neutral-400 block uppercase mb-1.5">
                  1. Select Commuter Card
                </label>
                <select
                  value={selectedPassengerId}
                  onChange={(e) => setSelectedPassengerId(Number(e.target.value))}
                  className="w-full bg-black border border-neutral-800 text-white text-xs px-3 py-2 rounded-xs focus:border-cyan-500 focus:outline-none"
                >
                  {passengers.map((p) => (
                    <option key={p.Passenger_ID} value={p.Passenger_ID}>
                      #{p.Passenger_ID} {p.Name} (₹{p.Card_Balance})
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Entry Station */}
              <div>
                <label className="text-[10px] text-neutral-400 block uppercase mb-1.5">
                  2. Entry Station (Tap In)
                </label>
                <select
                  value={selectedEntryStationId}
                  onChange={(e) => setSelectedEntryStationId(Number(e.target.value))}
                  className="w-full bg-black border border-neutral-800 text-white text-xs px-3 py-2 rounded-xs focus:border-cyan-500 focus:outline-none"
                >
                  {stations.map((s) => (
                    <option key={s.Station_ID} value={s.Station_ID}>
                      #{s.Station_ID} {s.Name} ({s.Type})
                    </option>
                  ))}
                </select>
              </div>

              {/* Payment Method */}
              <div>
                <label className="text-[10px] text-neutral-400 block uppercase mb-1.5">
                  3. Payment Mode
                </label>
                <select
                  value={selectedPaymentMethod}
                  onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                  className="w-full bg-black border border-neutral-800 text-white text-xs px-3 py-2 rounded-xs focus:border-cyan-500 focus:outline-none"
                >
                  <option value="Smart Card">Smart Card (Auto-deduct)</option>
                  <option value="Token">Single Journey Token</option>
                  <option value="UPI">UPI Digital Tap</option>
                </select>
              </div>
            </div>

            {/* Tap In Button */}
            <div className="pt-2">
              <button
                onClick={handleTapIn}
                disabled={loading}
                className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs py-2.5 rounded-xs tracking-wider uppercase transition-transform active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>EXECUTE TAP IN // OPEN ENTRY TURNSTILE</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Active Journeys (Tap Out Station Selector) */}
          <div className="bg-[#0c0d12]/90 border border-neutral-800 rounded-sm p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-neutral-800 pb-2">
              <span className="text-xs font-bold text-neutral-200 uppercase tracking-wider">
                Ongoing Journeys ({activeJourneys.length} Passengers in Transit)
              </span>
              <span className="text-[10px] text-neutral-500">
                Destination Station:
                <select
                  value={selectedExitStationId}
                  onChange={(e) => setSelectedExitStationId(Number(e.target.value))}
                  className="ml-2 bg-black border border-neutral-800 text-cyan-400 text-xs px-2 py-1 rounded-xs"
                >
                  {stations.map((s) => (
                    <option key={s.Station_ID} value={s.Station_ID}>
                      #{s.Station_ID} {s.Name}
                    </option>
                  ))}
                </select>
              </span>
            </div>

            {activeJourneys.length === 0 ? (
              <div className="text-neutral-500 text-xs text-center py-6">
                No active journeys. Tap in a passenger above to create an open ticket.
              </div>
            ) : (
              <div className="space-y-2.5">
                {activeJourneys.map((aj) => (
                  <div key={aj.Ticket_ID} className="bg-black/60 border border-neutral-900 p-3 rounded-xs flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white">
                        Ticket #{aj.Ticket_ID} — {aj.Passenger_Name}
                      </div>
                      <div className="text-[10px] text-neutral-400 mt-0.5">
                        Tapped in at <span className="text-cyan-400">{aj.Entry_Station}</span> // {new Date(aj.Entry_Time).toLocaleTimeString()}
                      </div>
                    </div>

                    <button
                      onClick={() => handleTapOut(aj.Ticket_ID)}
                      disabled={loading}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] px-3 py-1.5 rounded-xs uppercase cursor-pointer"
                    >
                      TAP OUT & DEDUCT FARE &rarr;
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right: Live Transaction Log & Receipt */}
        <div className="space-y-6">
          
          {/* Latest Receipt Card */}
          {latestReceipt && (
            <div className="bg-emerald-950/20 border border-emerald-800/50 p-4 rounded-sm space-y-2">
              <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold uppercase">
                <CheckCircle2 className="w-4 h-4" />
                <span>Transaction Approved</span>
              </div>
              <div className="text-xs text-neutral-200">
                {latestReceipt.message}
              </div>
              {latestReceipt.fare !== undefined && (
                <div className="text-[11px] text-neutral-400 pt-2 border-t border-emerald-900/60 flex justify-between">
                  <span>Deducted Fare:</span>
                  <span className="text-white font-bold">₹{latestReceipt.fare.toFixed(2)}</span>
                </div>
              )}
            </div>
          )}

          {/* SQL Telemetry Console Output */}
          <div className="bg-[#0c0d12]/95 border border-neutral-800 rounded-sm p-4 space-y-3">
            <div className="flex items-center gap-1.5 text-xs text-neutral-400 border-b border-neutral-800 pb-2">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-bold text-neutral-200 uppercase">Live SQL Execution Stream</span>
            </div>

            <div className="space-y-1.5 text-[10px] font-mono text-neutral-400 max-h-56 overflow-y-auto">
              {logMessages.map((log, index) => (
                <div key={index} className="leading-tight text-neutral-300">
                  {log}
                </div>
              ))}
            </div>
          </div>

          {/* Recent Completed Tickets */}
          <div className="bg-[#0c0d12]/90 border border-neutral-800 rounded-sm p-4 space-y-3">
            <span className="text-xs font-bold text-neutral-200 uppercase tracking-wider block border-b border-neutral-800 pb-2">
              Recent Closed Transactions
            </span>

            <div className="space-y-2 max-h-48 overflow-y-auto text-xs">
              {recentJourneys.slice(0, 6).map((j) => (
                <div key={j.Ticket_ID} className="bg-black/50 p-2 rounded-xs border border-neutral-900 flex justify-between items-center text-[10px]">
                  <div>
                    <span className="text-white font-semibold">#{j.Ticket_ID} {j.Passenger_Name}</span>
                    <div className="text-neutral-500">{j.Entry_Station} &rarr; {j.Exit_Station || 'Ongoing'}</div>
                  </div>
                  <span className="text-emerald-400 font-bold">₹{j.Fare}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
