import { useEffect, useState } from 'react';

interface HudOverlayProps {
  mouseCoords: { x: number; y: number };
  kpis?: {
    total_revenue?: number;
    total_trips?: number;
    active_rakes?: number;
    total_rakes?: number;
    rake_availability_pct?: number;
    grid_frequency_hz?: number;
    signal_integrity_pct?: number;
  };
}

export default function HudOverlay({ mouseCoords, kpis }: HudOverlayProps) {
  const [sliderVal, setSliderVal] = useState(88);

  useEffect(() => {
    const interval = setInterval(() => {
      setSliderVal(prev => (prev >= 180 ? 0 : prev + 1));
    }, 120);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 z-10 pointer-events-none select-none text-[10px] sm:text-[11px] font-mono tracking-wider text-neutral-400">
      
      {/* ================= TOP-LEFT MINI RADAR & TELEMETRY ================= */}
      <div className="absolute top-6 left-6 sm:top-8 sm:left-8 flex flex-col gap-2">
        {/* Radar bounding box */}
        <div className="w-28 sm:w-32 h-20 sm:h-24 border border-neutral-800 bg-black/60 backdrop-blur-md relative p-2 flex flex-col justify-between">
          <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/60"></div>
          <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/60"></div>
          <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white/60"></div>
          <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/60"></div>

          {/* Mini rotating silhouette indicator */}
          <div className="flex justify-center items-center h-full">
            <div className="w-10 h-3 border border-cyan-400/80 bg-cyan-500/20 rounded-xs animate-pulse"></div>
          </div>

          <div className="flex justify-between items-center text-[9px] text-neutral-300 font-bold border-t border-neutral-800 pt-1">
            <span>X {mouseCoords.x}</span>
            <span>Y {mouseCoords.y}</span>
          </div>
        </div>

        {/* Tactical status text */}
        <div className="space-y-0.5 leading-tight">
          <div className="text-neutral-200 font-semibold tracking-widest">LIVE TRAIN TRACKER</div>
          <div className="text-neutral-400">MONITORING ROUTE & SPEED</div>
          <div className="text-neutral-500">AUTO-SCHEDULE READY</div>
        </div>
      </div>

      {/* ================= TOP-CENTER BRAND LOGO ================= */}
      <div className="absolute top-5 sm:top-6 left-1/2 -translate-x-1/2 flex flex-col items-center">
        <img 
          src="/uratro-logo-clean.png" 
          alt="Uratro" 
          className="h-7 sm:h-8 md:h-10 w-auto object-contain block"
        />
        <div className="text-[8px] sm:text-[9px] tracking-[0.28em] text-neutral-400 uppercase mt-1 text-center font-mono">
          Smart Metro Rail Network
        </div>
      </div>

      {/* ================= TOP-RIGHT METRIC TELEMETRY MATRIX ================= */}
      <div className="absolute top-6 right-6 sm:top-8 sm:right-8 text-right hidden md:block">
        <div className="text-neutral-200 font-semibold tracking-widest mb-1.5">
          LIVE NETWORK STATUS
        </div>
        <div className="space-y-0.5 text-neutral-400 font-mono text-[10px]">
          <div className="flex justify-end gap-6">
            <span className="text-neutral-600">[NETWORK]</span>
            <span className="w-48 text-left">PINK LINE OCCUPANCY</span>
            <span className="text-neutral-200 font-bold">94%</span>
          </div>
          <div className="flex justify-end gap-6">
            <span className="text-transparent">[NETWORK]</span>
            <span className="w-48 text-left">BLUE LINE OCCUPANCY</span>
            <span className="text-neutral-200 font-bold">81%</span>
          </div>
          <div className="flex justify-end gap-6">
            <span className="text-transparent">[NETWORK]</span>
            <span className="w-48 text-left">POWER SUPPLY</span>
            <span className="text-cyan-400 font-bold">{kpis?.grid_frequency_hz || '50.0'} HZ (NORMAL)</span>
          </div>
          <div className="flex justify-end gap-6">
            <span className="text-transparent">[NETWORK]</span>
            <span className="w-48 text-left">TRACK SIGNALS</span>
            <span className="text-emerald-400 font-bold">{kpis?.signal_integrity_pct || '99.98'}% HEALTHY</span>
          </div>
          <div className="flex justify-end gap-6">
            <span className="text-transparent">[NETWORK]</span>
            <span className="w-48 text-left">TRAINS IN SERVICE</span>
            <span className="text-neutral-200 font-bold">{kpis?.active_rakes || 4} ACTIVE TRAINS</span>
          </div>
          <div className="flex justify-end gap-6">
            <span className="text-neutral-600">[DATA]</span>
            <span className="w-48 text-left text-neutral-500">SYSTEM DATABASE</span>
            <span className="text-emerald-400 font-bold">CONNECTED &amp; SYNCED</span>
          </div>
        </div>
      </div>

      {/* ================= MID-LEFT & MID-RIGHT GPS CROSSHAIRS ================= */}
      <div className="absolute top-1/2 left-6 sm:left-8 -translate-y-1/2 flex items-center gap-2">
        <span className="text-white/80 font-bold">26.8500° N</span>
      </div>

      <div className="absolute top-1/2 right-6 sm:right-8 -translate-y-1/2 flex items-center gap-2">
        <span className="text-white/80 font-bold">75.7600° E</span>
      </div>

      {/* ================= BOTTOM-LEFT PROTOCOL CODE HUD ================= */}
      <div className="absolute bottom-20 left-6 sm:bottom-22 sm:left-8 flex flex-col gap-2 max-w-[240px]">
        <div className="border border-neutral-800 bg-black/60 backdrop-blur-md p-3 relative space-y-1">
          <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/60"></div>
          <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/60"></div>
          <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white/60"></div>
          <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/60"></div>

          <div className="text-neutral-200 font-semibold tracking-widest">SAFETY SYSTEM</div>
          <div className="text-neutral-400">AUTOMATIC SIGNAL LOCK</div>
          <div className="text-neutral-500 text-[9px] pt-1 border-t border-neutral-900 flex justify-between">
            <span>TRACK SAFETY</span>
            <span className="text-emerald-400">NORMAL</span>
          </div>
          <div className="text-neutral-500 text-[9px] flex justify-between">
            <span>SYSTEM HEALTH</span>
            <span className="text-emerald-400">100% OPERATIONAL</span>
          </div>
          <div className="text-neutral-300 text-[9px] pt-1 font-bold">
            JAIPUR METRO NETWORK
          </div>
        </div>

        {/* Micro Slider */}
        <div className="flex items-center gap-2 text-[9px] text-neutral-500">
          <span>000</span>
          <div className="flex-1 h-0.5 bg-neutral-800 relative">
            <div 
              className="absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-white rounded-full"
              style={{ left: `${(sliderVal / 180) * 100}%` }}
            ></div>
          </div>
          <span>180</span>
        </div>
      </div>

      {/* ================= BOTTOM-RIGHT VERTICAL SCROLL INDICATOR ================= */}
      <div className="absolute bottom-20 right-6 sm:bottom-22 sm:right-8 flex flex-col items-center gap-2">
        <span className="text-[9px] tracking-widest uppercase text-neutral-400 [writing-mode:vertical-lr]">
          SCROLL
        </span>
        <div className="w-0.5 h-6 bg-neutral-800 relative overflow-hidden">
          <div className="w-full h-2 bg-white animate-bounce"></div>
        </div>
      </div>

    </div>
  );
}
