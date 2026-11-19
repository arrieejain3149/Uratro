import { useRef, useState } from 'react';
import { Download, CheckCircle, ArrowRight, Printer, ShieldCheck } from 'lucide-react';

export interface TicketData {
  ticket_id: number;
  passenger_id?: number;
  passenger_name: string;
  entry_station: string;
  exit_station: string;
  line_name?: string;
  hops?: number;
  fare: number;
  entry_time: string;
  payment_method: string;
}

interface TicketReceiptProps {
  ticket: TicketData;
  onSimulateTap?: () => void;
}

export default function TicketReceipt({ ticket, onSimulateTap }: TicketReceiptProps) {
  const receiptRef = useRef<HTMLDivElement>(null);
  const [tapState, setTapState] = useState<'idle' | 'scanning' | 'cleared'>('idle');
  const [gateMessage, setGateMessage] = useState('');

  // Format date & time
  const formatDateTime = (raw: string) => {
    try {
      const d = new Date(raw);
      if (isNaN(d.getTime())) return raw;
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    } catch {
      return raw;
    }
  };

  // One-click PNG Download using HTML5 Canvas (Zero dependencies)
  const handleDownloadPNG = () => {
    const canvas = document.createElement('canvas');
    const width = 420;
    const height = 660;
    const scale = 2; // High-res 2x
    canvas.width = width * scale;
    canvas.height = height * scale;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.scale(scale, scale);

    // Thermal Receipt Background (Aer Charcoal / Dark Slate)
    ctx.fillStyle = '#18181B';
    ctx.fillRect(0, 0, width, height);

    // Subtle paper edge border
    ctx.strokeStyle = '#27272A';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(10, 10, width - 20, height - 20);

    // Header: RECEIPT & Ticket No.
    ctx.fillStyle = '#C5A880';
    ctx.font = 'bold 12px "Courier New", monospace';
    ctx.fillText('RECEIPT', 24, 40);

    ctx.fillStyle = '#A1A1AA';
    ctx.font = '11px "Courier New", monospace';
    const noStr = `No. TK-${String(ticket.ticket_id).padStart(6, '0')}`;
    ctx.fillText(noStr, width - 24 - ctx.measureText(noStr).width, 40);

    // Main Brand Title (Cursive / Elegant)
    ctx.fillStyle = '#C5A880';
    ctx.font = 'italic bold 24px Georgia, serif';
    const brand = 'Uratro Metro';
    ctx.fillText(brand, (width - ctx.measureText(brand).width) / 2, 75);

    // Slogan
    ctx.fillStyle = '#71717A';
    ctx.font = '10px "Courier New", monospace';
    const slogan = '/ Smart Transit Network - Rapid Metro Pass /';
    ctx.fillText(slogan, (width - ctx.measureText(slogan).width) / 2, 95);

    // Divider Line 1
    ctx.fillStyle = '#3F3F46';
    ctx.font = '10px "Courier New", monospace';
    const dashLine = '- - - - - - - - - - - - - - - - - - - - - - - - - - - -';
    ctx.fillText(dashLine, 24, 115);

    // Date & Terminal
    ctx.fillStyle = '#E4E4E7';
    ctx.font = '10px "Courier New", monospace';
    ctx.fillText(`DATE: ${formatDateTime(ticket.entry_time)}`, 24, 133);
    const termStr = 'GATE: 02 (NORTH)';
    ctx.fillText(termStr, width - 24 - ctx.measureText(termStr).width, 133);

    ctx.fillStyle = '#3F3F46';
    ctx.fillText(dashLine, 24, 150);

    // Journey details
    ctx.fillStyle = '#A1A1AA';
    ctx.font = '11px "Courier New", monospace';
    ctx.fillText('ORIGIN STATION', 24, 175);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(ticket.entry_station.toUpperCase(), 24, 192);

    ctx.fillStyle = '#A1A1AA';
    ctx.fillText('DESTINATION', 24, 218);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(ticket.exit_station.toUpperCase(), 24, 235);

    ctx.fillStyle = '#A1A1AA';
    ctx.fillText('PASSENGER', 24, 260);
    ctx.fillStyle = '#E4E4E7';
    ctx.fillText(ticket.passenger_name, 24, 276);

    ctx.fillStyle = '#A1A1AA';
    ctx.fillText('PAYMENT METHOD', width / 2, 260);
    ctx.fillStyle = '#C5A880';
    ctx.fillText(ticket.payment_method, width / 2, 276);

    // Divider Line 2
    ctx.fillStyle = '#3F3F46';
    ctx.fillText(dashLine, 24, 305);

    // Price Breakdown
    ctx.fillStyle = '#A1A1AA';
    ctx.fillText('Base Fare', 24, 328);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('₹ 10.00', width - 24 - ctx.measureText('₹ 10.00').width, 328);

    ctx.fillStyle = '#A1A1AA';
    ctx.fillText('Distance Rate (Hops)', 24, 348);
    const distFare = `₹ ${Math.max(0, ticket.fare - 10).toFixed(2)}`;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(distFare, width - 24 - ctx.measureText(distFare).width, 348);

    // Divider Line 3
    ctx.fillStyle = '#3F3F46';
    ctx.fillText(dashLine, 24, 370);

    // TOTAL
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 16px "Courier New", monospace';
    ctx.fillText('TOTAL:', 24, 400);

    ctx.fillStyle = '#C5A880';
    const totalStr = `₹ ${ticket.fare.toFixed(2)}`;
    ctx.font = 'bold 18px "Courier New", monospace';
    ctx.fillText(totalStr, width - 24 - ctx.measureText(totalStr).width, 400);

    // Authentic Barcode Drawing
    const barcodeY = 430;
    const barcodeH = 50;
    const barStartX = 34;
    const barWidth = width - 68;

    ctx.fillStyle = '#FFFFFF';
    // Generate pseudo barcode bars based on ticket ID
    let currentX = barStartX;
    const seed = (ticket.ticket_id * 37) + 101;
    for (let i = 0; currentX < barStartX + barWidth; i++) {
      const bit = ((seed >> (i % 16)) & 1) ^ (i % 3 === 0 ? 1 : 0);
      const w = bit ? 3 : 1.5;
      const gap = bit ? 2 : 2.5;
      ctx.fillRect(currentX, barcodeY, w, barcodeH);
      currentX += w + gap;
    }

    // Barcode Token Text
    ctx.fillStyle = '#A1A1AA';
    ctx.font = '10px "Courier New", monospace';
    const tokenStr = `* TK-${String(ticket.ticket_id).padStart(6, '0')}-METRO *`;
    ctx.fillText(tokenStr, (width - ctx.measureText(tokenStr).width) / 2, 498);

    // Sign off
    ctx.fillStyle = '#C5A880';
    ctx.font = 'italic bold 20px Georgia, serif';
    const thanks = 'Thank You!';
    ctx.fillText(thanks, (width - ctx.measureText(thanks).width) / 2, 535);

    // Footer info
    ctx.fillStyle = '#52525B';
    ctx.font = '9px "Courier New", monospace';
    ctx.fillText('HELPLINE: 1800-URATRO-GO', 24, 570);
    const site = 'WWW.URATRO.TRANSIT';
    ctx.fillText(site, width - 24 - ctx.measureText(site).width, 570);

    // Trigger PNG Download
    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `Uratro-Ticket-TK${String(ticket.ticket_id).padStart(6, '0')}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleSimulateTap = () => {
    setTapState('scanning');
    setGateMessage('Reading Token at Turnstile Gate 02...');

    setTimeout(() => {
      setTapState('cleared');
      setGateMessage('Gate 02 Flaps Opened. Transit In Progress.');
      if (onSimulateTap) onSimulateTap();
    }, 1200);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col items-center select-none font-mono">
      {/* Turnstile Clearance Banner */}
      {tapState !== 'idle' && (
        <div
          className={`w-full max-w-[380px] mb-3 p-3 rounded-xs border text-xs font-mono flex items-center justify-between transition-all ${
            tapState === 'scanning'
              ? 'bg-amber-950/40 border-amber-600/60 text-amber-300 animate-pulse'
              : 'bg-emerald-950/40 border-emerald-600/60 text-emerald-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {tapState === 'cleared' ? (
              <CheckCircle className="w-4 h-4 text-emerald-400" />
            ) : (
              <ShieldCheck className="w-4 h-4 text-amber-400" />
            )}
            <span>{gateMessage}</span>
          </div>
          <span className="text-[10px] text-neutral-400 uppercase">TURNSTILE</span>
        </div>
      )}

      {/* The Vintage Thermal Receipt Card */}
      <div
        ref={receiptRef}
        className="relative w-full max-w-[380px] bg-[#18181B] border border-[#27272A] rounded-xs shadow-[0_15px_40px_rgba(0,0,0,0.8)] overflow-hidden text-white"
        style={{
          // Perforated zig-zag tear-off edge styling
          maskImage: 'radial-gradient(circle at 10px 0, transparent 0, transparent 4px, black 4.5px)',
          maskRepeat: 'repeat-x',
          maskSize: '16px 100%',
        }}
      >
        {/* Top Paper Perforation Bar */}
        <div className="h-2 bg-[#27272A]/40 w-full border-b border-dashed border-[#3F3F46]/60" />

        <div className="p-6 sm:p-7 space-y-4">
          {/* Header: RECEIPT & No */}
          <div className="flex items-center justify-between text-xs tracking-wider">
            <span className="text-[#C5A880] font-bold">RECEIPT</span>
            <span className="text-neutral-400 font-mono">
              No. TK-{String(ticket.ticket_id).padStart(6, '0')}
            </span>
          </div>

          {/* Brand Script Title */}
          <div className="text-center pt-1">
            <div className="text-2xl font-serif italic font-bold tracking-wide text-[#C5A880]">
              Uratro Metro
            </div>
            <div className="text-[10px] tracking-widest uppercase text-neutral-400 font-mono mt-0.5">
              / Smart Transit Network - Rapid Metro Pass /
            </div>
          </div>

          {/* Divider */}
          <div className="text-center text-neutral-400 text-xs tracking-widest select-none overflow-hidden">
            - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
          </div>

          {/* Date & Terminal */}
          <div className="flex items-center justify-between text-[11px] text-neutral-300">
            <span>DATE: {formatDateTime(ticket.entry_time)}</span>
            <span className="text-neutral-400">GATE: 02 (NORTH)</span>
          </div>

          {/* Divider */}
          <div className="text-center text-neutral-400 text-xs tracking-widest select-none overflow-hidden">
            - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
          </div>

          {/* Journey Stations */}
          <div className="space-y-2 text-xs">
            <div>
              <div className="text-[10px] uppercase text-neutral-400">Origin Station</div>
              <div className="text-white font-semibold text-sm tracking-wide">
                {ticket.entry_station}
              </div>
            </div>

            <div className="flex items-center gap-2 text-neutral-400 py-0.5">
              <span className="h-[1px] flex-1 bg-neutral-800" />
              <ArrowRight className="w-3.5 h-3.5 text-[#C5A880]" />
              <span className="h-[1px] flex-1 bg-neutral-800" />
            </div>

            <div>
              <div className="text-[10px] uppercase text-neutral-400">Destination</div>
              <div className="text-white font-semibold text-sm tracking-wide">
                {ticket.exit_station}
              </div>
            </div>
          </div>

          {/* Passenger & Payment Method */}
          <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
            <div>
              <div className="text-[10px] uppercase text-neutral-400">Passenger</div>
              <div className="text-neutral-200 truncate">{ticket.passenger_name}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase text-neutral-400">Payment</div>
              <div className="text-[#C5A880] truncate">{ticket.payment_method}</div>
            </div>
          </div>

          {/* Divider */}
          <div className="text-center text-neutral-400 text-xs tracking-widest select-none overflow-hidden">
            - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
          </div>

          {/* Fare Breakdown */}
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-neutral-400">
              <span>Base Fare</span>
              <span className="text-neutral-200">₹ 10.00</span>
            </div>
            <div className="flex justify-between text-neutral-400">
              <span>Distance Rate (Hops)</span>
              <span className="text-neutral-200">
                ₹ {Math.max(0, ticket.fare - 10).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Divider */}
          <div className="text-center text-neutral-400 text-xs tracking-widest select-none overflow-hidden">
            - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
          </div>

          {/* TOTAL */}
          <div className="flex items-baseline justify-between pt-1">
            <span className="text-sm font-bold tracking-wider text-white">TOTAL:</span>
            <span className="text-xl font-bold tracking-wider text-[#C5A880]">
              ₹ {ticket.fare.toFixed(2)}
            </span>
          </div>

          {/* Centered Barcode Pattern */}
          <div className="pt-2 flex flex-col items-center gap-1.5">
            <div className="h-12 w-full flex items-center justify-center gap-[2px] bg-white p-2 rounded-xs">
              {Array.from({ length: 48 }).map((_, i) => {
                const bit = ((ticket.ticket_id * 37 + i * 13) % 5 === 0) || (i % 2 === 0);
                return (
                  <div
                    key={i}
                    className={`h-full ${bit ? 'bg-neutral-900' : 'bg-transparent'}`}
                    style={{ width: (i % 3 === 0 ? '4px' : '2px') }}
                  />
                );
              })}
            </div>
            <span className="text-[10px] text-neutral-400 tracking-widest">
              * TK-{String(ticket.ticket_id).padStart(6, '0')}-METRO *
            </span>
          </div>

          {/* Script Sign-Off */}
          <div className="text-center pt-2">
            <span className="font-serif italic font-bold text-lg text-[#C5A880]">
              Thank You!
            </span>
          </div>

          {/* Footer Info */}
          <div className="pt-2 border-t border-dashed border-[#27272A] flex items-center justify-between text-[9px] text-neutral-400 tracking-wider">
            <span>HELPLINE: 1800-URATRO</span>
            <span>WWW.URATRO.TRANSIT</span>
          </div>
        </div>

        {/* Bottom Paper Perforation Notch */}
        <div className="h-2 bg-[#27272A]/40 w-full border-t border-dashed border-[#3F3F46]/60" />
      </div>

      {/* Ticket Action Bar */}
      <div className="w-full max-w-[380px] mt-4 flex items-center gap-2 select-none">
        <button
          onClick={handleDownloadPNG}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xs bg-[#C5A880] hover:bg-[#D4AF37] text-neutral-950 text-xs font-semibold tracking-wider uppercase transition-colors cursor-pointer shadow-sm"
          title="Download PNG Receipt to your computer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download Ticket</span>
        </button>

        <button
          onClick={handleSimulateTap}
          disabled={tapState === 'scanning'}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xs border border-[#27272A] bg-[#18181B] hover:bg-neutral-800 text-neutral-200 text-xs font-mono tracking-wider transition-colors cursor-pointer"
          title="Simulate Turnstile Gate Clearance"
        >
          <CheckCircle className="w-3.5 h-3.5 text-[#C5A880]" />
          <span>Simulate Gate Tap</span>
        </button>

        <button
          onClick={handlePrint}
          className="p-2.5 rounded-xs border border-[#27272A] bg-[#18181B] hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          title="Print Receipt"
        >
          <Printer className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
