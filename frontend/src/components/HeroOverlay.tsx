import type { MutableRefObject } from 'react';
import type { TabKey } from './BottomDock';

interface HeroOverlayProps {
  onTabChange: (tab: TabKey) => void;
  kpis?: any;
  mouse?: MutableRefObject<{ x: number; y: number }>;
}

export default function HeroOverlay({ onTabChange }: HeroOverlayProps) {
  return (
    <div className="absolute inset-0 pointer-events-none select-none z-10 flex flex-col justify-between p-6 sm:p-12 pt-24 sm:pt-28">
      
      {/* Top Content Row: Left Collection Tag & Right Bold Editorial Headline */}
      <div className="w-full flex flex-col lg:flex-row justify-between items-start gap-8">
        
        {/* Left Editorial Section: / 01 & Lines List */}
        <div className="pointer-events-auto max-w-xs animate-fade-in">
          <div className="text-sm font-semibold tracking-widest text-[#C5A880] uppercase">
            / 01
          </div>

          {/* Thin Progress Rule with Gold Fill */}
          <div className="w-32 sm:w-40 h-[2px] bg-neutral-800 my-3 relative overflow-hidden rounded-full">
            <div className="w-2/5 h-full bg-[#C5A880] rounded-full"></div>
          </div>

          <div className="space-y-1.5 text-xs sm:text-sm">
            <button
              onClick={() => onTabChange('topology')}
              className="block font-bold text-white hover:text-[#C5A880] transition-colors cursor-pointer text-left"
            >
              Pink Line Corridor
            </button>
            <button
              onClick={() => onTabChange('topology')}
              className="block text-neutral-400 hover:text-white transition-colors cursor-pointer text-left"
            >
              Blue Line Connector
            </button>
            <button
              onClick={() => onTabChange('topology')}
              className="block text-neutral-400 hover:text-white transition-colors cursor-pointer text-left"
            >
              Central Transfer Hub
            </button>
          </div>
        </div>

        {/* Right Editorial Section: Bold Headline & Prose (Exact Aer Style) */}
        <div className="pointer-events-auto max-w-md lg:max-w-lg text-left lg:text-left">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.08] mb-3">
            Urban Mobility<br />Redefined.
          </h1>

          <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed font-normal">
            Introducing Uratro, a next-generation smart metro rail network designed for{' '}
            <span className="text-neutral-200 underline decoration-[#C5A880] underline-offset-4">
              autonomous operations
            </span>{' '}
            and high-frequency passenger transit across Jaipur.
          </p>

          <div className="mt-4 flex items-center gap-4 text-xs font-semibold">
            <button
              onClick={() => onTabChange('topology')}
              className="text-[#C5A880] hover:text-[#D8BA92] hover:underline underline-offset-4 transition-colors cursor-pointer flex items-center gap-1"
            >
              Explore Network Map &rarr;
            </button>
            <button
              onClick={() => onTabChange('simulator')}
              className="text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              Test Ticket Gates
            </button>
          </div>
        </div>

      </div>

      {/* Floating 3D Interaction Cue */}
      <div className="w-full flex justify-center pb-20 pointer-events-none">
        <div className="px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-[#27272A] text-[10px] tracking-widest text-neutral-400 uppercase font-mono">
          Drag to Rotate 3D Metro Rake • Scroll to Zoom
        </div>
      </div>

    </div>
  );
}
