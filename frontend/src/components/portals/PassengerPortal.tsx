import { useState, useEffect } from 'react';
import { CreditCard, Train, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import TicketReceipt, { type TicketData } from './TicketReceipt';
import type { AuthUser } from '../../types/auth';

interface StationItem {
  Station_ID: number;
  Name: string;
  Type: string;
  Status: string;
}

interface PassengerPortalProps {
  authUser: AuthUser;
  onOpenAuthModal: () => void;
  onSelectStationForMap?: (stnName: string) => void;
}

export default function PassengerPortal({
  authUser,
  onOpenAuthModal,
}: PassengerPortalProps) {
  const [stations, setStations] = useState<StationItem[]>([]);
  const [originId, setOriginId] = useState<number>(1);
  const [destId, setDestId] = useState<number>(7);
  const [paymentMethod, setPaymentMethod] = useState<'Smart Card' | 'Simulated UPI'>('Smart Card');
  const [walletBalance, setWalletBalance] = useState<number>(authUser.balance || 390.0);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [activeTicket, setActiveTicket] = useState<TicketData | null>(null);
  const [ticketHistory, setTicketHistory] = useState<any[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'book' | 'history'>('book');
  const [topUpSuccess, setTopUpSuccess] = useState('');

  // Fetch stations
  useEffect(() => {
    fetch('/api/v1/stations')
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'success' && Array.isArray(data.data)) {
          setStations(data.data);
          if (data.data.length >= 2) {
            setOriginId(data.data[0].Station_ID);
            setDestId(data.data[Math.min(6, data.data.length - 1)].Station_ID);
          }
        }
      })
      .catch((err) => console.error('Error fetching stations:', err));
  }, []);

  // Fetch passenger tickets and balance
  const fetchPassengerData = () => {
    const pId = authUser.id || 1;
    // 1. Fetch tickets
    fetch(`/api/v1/ticketing/passenger/${pId}/tickets`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'success' && Array.isArray(data.data)) {
          setTicketHistory(data.data);
          if (data.data.length > 0 && !activeTicket) {
            const first = data.data[0];
            setActiveTicket({
              ticket_id: first.Ticket_ID,
              passenger_id: first.Passenger_ID,
              passenger_name: first.Passenger_Name,
              entry_station: first.Entry_Station,
              exit_station: first.Exit_Station || 'Central Terminal',
              fare: parseFloat(first.Fare || '20.0'),
              entry_time: first.Entry_Time,
              payment_method: first.Payment_Method || 'Smart Card',
            });
          }
        }
      })
      .catch((err) => console.error('Error fetching tickets:', err));

    // 2. Fetch fresh passenger balance
    fetch('/api/v1/ticketing/passengers')
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'success' && Array.isArray(data.data)) {
          const match = data.data.find((p: any) => p.Passenger_ID === pId);
          if (match) {
            setWalletBalance(parseFloat(match.Card_Balance || '0.0'));
          }
        }
      })
      .catch((err) => console.error('Error fetching balance:', err));
  };

  useEffect(() => {
    fetchPassengerData();
  }, [authUser.id]);

  // Compute hops and fare
  const stationHops = Math.max(1, Math.abs(destId - originId));
  const computedFare = 10.0 + (stationHops * 1.66);

  // Handle booking
  const handleBookTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError('');
    setIsBooking(true);

    try {
      const pId = authUser.id ? Number(authUser.id) : 1;
      const res = await fetch('/api/v1/ticketing/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          passenger_id: pId,
          entry_station_id: originId,
          exit_station_id: destId,
          fare: Math.round(computedFare),
          payment_method: paymentMethod,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.status !== 'success') {
        throw new Error(data.detail || data.message || 'Failed to book ticket.');
      }

      // Success
      const newTicket: TicketData = {
        ticket_id: data.ticket_id,
        passenger_id: data.passenger_id,
        passenger_name: data.passenger_name,
        entry_station: data.entry_station,
        exit_station: data.exit_station,
        fare: data.fare,
        entry_time: new Date().toISOString(),
        payment_method: data.payment_method,
      };

      setActiveTicket(newTicket);
      if (typeof data.new_balance === 'number') {
        setWalletBalance(data.new_balance);
      }
      fetchPassengerData();
    } catch (err: any) {
      setBookingError(err.message || 'An error occurred during booking.');
    } finally {
      setIsBooking(false);
    }
  };

  // Handle simulated wallet top-up
  const handleTopUp = async (amount: number) => {
    setTopUpSuccess('');
    try {
      const pId = authUser.id ? Number(authUser.id) : 1;
      const res = await fetch('/api/v1/ticketing/topup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          passenger_id: pId,
          amount: amount,
        }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setWalletBalance(data.new_balance);
        setTopUpSuccess(`Added ₹${amount} to your card balance.`);
        setTimeout(() => setTopUpSuccess(''), 4000);
      }
    } catch (err) {
      console.error('Error topping up:', err);
    }
  };

  return (
    <div className="w-full h-full overflow-y-auto px-4 sm:px-8 md:px-12 py-6 sm:py-8 font-sans select-none text-white">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#242428]">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-white">
            Ticket Pass
          </h1>
        </div>

        {/* Passenger Profile & Wallet Status */}
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 rounded-xs bg-[#18181B] border border-[#27272A] flex items-center gap-3">
            <div>
              <div className="text-[9px] uppercase tracking-wider text-neutral-400 font-mono">
                Passenger Card #{authUser.id || 1}
              </div>
              <div className="text-xs font-medium text-white">
                {authUser.name}
              </div>
            </div>
            <div className="h-6 w-[1px] bg-[#27272A]" />
            <div>
              <div className="text-[9px] uppercase tracking-wider text-[#C5A880] font-mono">
                Card Balance
              </div>
              <div className="text-xs font-mono font-bold text-white">
                ₹ {walletBalance.toFixed(2)}
              </div>
            </div>
          </div>

          <button
            onClick={onOpenAuthModal}
            className="px-3 py-2 rounded-xs border border-[#27272A] bg-[#141416] hover:bg-neutral-800 text-neutral-300 hover:text-white text-xs font-mono transition-colors cursor-pointer"
          >
            Switch Account
          </button>
        </div>
      </div>

      {/* Top-up Notification */}
      {topUpSuccess && (
        <div className="mt-4 p-3 rounded-xs bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs font-mono flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{topUpSuccess}</span>
        </div>
      )}

      {/* Sub Tabs: Book Ticket | My Tickets Passbook */}
      <div className="mt-6 flex items-center justify-between border-b border-[#242428] pb-3">
        <div className="flex items-center gap-4 text-xs font-mono">
          <button
            onClick={() => setActiveSubTab('book')}
            className={`pb-1 cursor-pointer transition-colors relative ${
              activeSubTab === 'book'
                ? 'text-white font-semibold'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Book Journey & Pass
            {activeSubTab === 'book' && (
              <span className="absolute -bottom-3 left-0 right-0 h-[2px] bg-[#C5A880]" />
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('history')}
            className={`pb-1 cursor-pointer transition-colors relative ${
              activeSubTab === 'history'
                ? 'text-white font-semibold'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            My Tickets Passbook ({ticketHistory.length})
            {activeSubTab === 'history' && (
              <span className="absolute -bottom-3 left-0 right-0 h-[2px] bg-[#C5A880]" />
            )}
          </button>
        </div>

        {/* Quick Top-Up Simulation Buttons */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-[10px] text-neutral-500 uppercase">Top-Up:</span>
          <button
            onClick={() => handleTopUp(50)}
            className="px-2.5 py-1 rounded-xs bg-[#18181B] border border-[#27272A] hover:border-[#C5A880] text-neutral-300 hover:text-[#C5A880] text-[11px] transition-colors cursor-pointer"
          >
            +₹50
          </button>
          <button
            onClick={() => handleTopUp(100)}
            className="px-2.5 py-1 rounded-xs bg-[#18181B] border border-[#27272A] hover:border-[#C5A880] text-neutral-300 hover:text-[#C5A880] text-[11px] transition-colors cursor-pointer"
          >
            +₹100
          </button>
        </div>
      </div>

      {/* TAB 1: BOOKING & ACTIVE PASS */}
      {activeSubTab === 'book' && (
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Journey Booking Form */}
          <div className="lg:col-span-6 space-y-6">
            <div className="p-6 rounded-xs bg-[#18181B] border border-[#27272A] space-y-5">
              <div>
                <h2 className="text-base font-semibold text-white">
                  Select Origin & Destination
                </h2>
              </div>

              <form onSubmit={handleBookTicket} className="space-y-4">
                {/* Origin Station */}
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-neutral-400 font-mono mb-1.5">
                    Origin Station (Boarding)
                  </label>
                  <select
                    value={originId}
                    onChange={(e) => setOriginId(Number(e.target.value))}
                    className="w-full bg-[#121214] border border-[#27272A] rounded-xs px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#C5A880] font-mono cursor-pointer"
                  >
                    {stations.map((stn) => (
                      <option key={stn.Station_ID} value={stn.Station_ID}>
                        {stn.Name} ({stn.Type})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Destination Station */}
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-neutral-400 font-mono mb-1.5">
                    Destination Station (Alighting)
                  </label>
                  <select
                    value={destId}
                    onChange={(e) => setDestId(Number(e.target.value))}
                    className="w-full bg-[#121214] border border-[#27272A] rounded-xs px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#C5A880] font-mono cursor-pointer"
                  >
                    {stations.map((stn) => (
                      <option key={stn.Station_ID} value={stn.Station_ID}>
                        {stn.Name} ({stn.Type})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Journey Summary Chips */}
                <div className="p-3 bg-[#121214] border border-[#27272A] rounded-xs space-y-2 text-xs font-mono">
                  <div className="flex justify-between text-neutral-400">
                    <span>Route Corridor</span>
                    <span className="text-white font-medium">Pink Line (East-West)</span>
                  </div>
                  <div className="flex justify-between text-neutral-400">
                    <span>Station Distance</span>
                    <span className="text-white">{stationHops} Station Hops</span>
                  </div>
                  <div className="flex justify-between text-neutral-400">
                    <span>Estimated Travel Time</span>
                    <span className="text-white">~{stationHops * 3} Minutes</span>
                  </div>
                  <div className="pt-2 border-t border-[#27272A] flex justify-between items-baseline">
                    <span className="text-neutral-300">Total Calculated Fare</span>
                    <span className="text-base font-bold text-[#C5A880]">
                      ₹ {Math.round(computedFare)}.00
                    </span>
                  </div>
                </div>

                {/* Simulated Payment Selector */}
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-neutral-400 font-mono mb-1.5">
                    Simulated Payment Method
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('Smart Card')}
                      className={`p-2.5 rounded-xs border text-left transition-all cursor-pointer ${
                        paymentMethod === 'Smart Card'
                          ? 'bg-[#27272A] border-[#C5A880] text-white'
                          : 'bg-[#121214] border-[#27272A] text-neutral-400 hover:text-neutral-200'
                      }`}
                    >
                      <div className="font-semibold">Smart Card</div>
                      <div className="text-[10px] text-neutral-400 mt-0.5">
                        Bal: ₹{walletBalance.toFixed(2)}
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('Simulated UPI')}
                      className={`p-2.5 rounded-xs border text-left transition-all cursor-pointer ${
                        paymentMethod === 'Simulated UPI'
                          ? 'bg-[#27272A] border-[#C5A880] text-white'
                          : 'bg-[#121214] border-[#27272A] text-neutral-400 hover:text-neutral-200'
                      }`}
                    >
                      <div className="font-semibold">Simulated UPI</div>
                      <div className="text-[10px] text-neutral-400 mt-0.5">Instant QR</div>
                    </button>
                  </div>
                </div>

                {bookingError && (
                  <div className="p-3 bg-red-950/40 border border-red-800/60 rounded-xs text-red-300 text-xs font-mono flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>{bookingError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isBooking || originId === destId}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xs bg-[#C5A880] hover:bg-[#D4AF37] disabled:opacity-50 text-neutral-950 text-xs font-semibold tracking-wider uppercase transition-colors cursor-pointer shadow-md"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>{isBooking ? 'Issuing Ticket...' : 'Book Journey & Issue Ticket'}</span>
                </button>
              </form>
            </div>
          </div>

          {/* Right: Active Boarding Pass & Thermal Receipt */}
          <div className="lg:col-span-6 flex flex-col items-center">
            <div className="w-full max-w-[380px] mb-2 flex items-center justify-between text-xs font-mono">
              <span className="text-[10px] uppercase text-neutral-400 tracking-wider">
                Active Digital Pass
              </span>
              <button
                onClick={fetchPassengerData}
                className="text-[11px] text-neutral-400 hover:text-white flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Refresh</span>
              </button>
            </div>

            {activeTicket ? (
              <TicketReceipt
                ticket={activeTicket}
                onSimulateTap={() => {
                  console.log('Turnstile gate clearance recorded.');
                }}
              />
            ) : (
              <div className="w-full max-w-[380px] p-8 rounded-xs bg-[#18181B] border border-[#27272A] text-center space-y-3 font-mono text-xs text-neutral-400">
                <Train className="w-8 h-8 text-neutral-600 mx-auto" />
                <p>No active ticket issued yet.</p>
                <p className="text-[11px] text-neutral-500">
                  Select your stations on the left and click "Book Journey" to issue your digital pass.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: MY TICKETS PASSBOOK */}
      {activeSubTab === 'history' && (
        <div className="mt-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-white">
                Your Ticket History ({ticketHistory.length} Recorded)
              </h2>
            </div>
            <button
              onClick={fetchPassengerData}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xs border border-[#27272A] bg-[#18181B] hover:bg-neutral-800 text-neutral-300 text-xs font-mono cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Records</span>
            </button>
          </div>

          {ticketHistory.length === 0 ? (
            <div className="p-8 rounded-xs bg-[#18181B] border border-[#27272A] text-center text-neutral-400 font-mono text-xs">
              No tickets recorded for this passenger yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ticketHistory.map((item) => (
                <div
                  key={item.Ticket_ID}
                  className="p-5 rounded-xs bg-[#18181B] border border-[#27272A] hover:border-[#3F3F46] space-y-3 font-mono text-xs transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[#C5A880] font-bold">
                      TK-{String(item.Ticket_ID).padStart(6, '0')}
                    </span>
                    <span className="text-[10px] text-neutral-400">
                      {item.Payment_Method || 'Smart Card'}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="text-white font-medium text-sm truncate">
                      {item.Entry_Station} &rarr; {item.Exit_Station || 'Central Terminal'}
                    </div>
                    <div className="text-[10px] text-neutral-400">
                      {new Date(item.Entry_Time).toLocaleString()}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#27272A] flex items-center justify-between">
                    <span className="font-bold text-[#C5A880]">
                      ₹ {parseFloat(item.Fare || '20.0').toFixed(2)}
                    </span>
                    <button
                      onClick={() => {
                        setActiveTicket({
                          ticket_id: item.Ticket_ID,
                          passenger_id: item.Passenger_ID,
                          passenger_name: item.Passenger_Name,
                          entry_station: item.Entry_Station,
                          exit_station: item.Exit_Station || 'Central Terminal',
                          fare: parseFloat(item.Fare || '20.0'),
                          entry_time: item.Entry_Time,
                          payment_method: item.Payment_Method || 'Smart Card',
                        });
                        setActiveSubTab('book');
                      }}
                      className="px-2.5 py-1 rounded-xs bg-[#27272A] hover:bg-[#3F3F46] text-white text-[11px] transition-colors cursor-pointer"
                    >
                      View & Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
