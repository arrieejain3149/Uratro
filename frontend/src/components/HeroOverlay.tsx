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
      {/* Top Content: Bold Editorial Headline */}
      <div className="w-full flex justify-end items-start">
        <div className="pointer-events-auto max-w-md lg:max-w-lg text-left">
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
          </div>
        </div>
      </div>
    </div>
  );
}
