import { useState, useEffect } from 'react';
import type { TabKey } from './BottomDock';

interface BottomEditorialBarProps {
  onTabChange: (tab: TabKey) => void;
  kpis?: any;
}

export default function BottomEditorialBar({ onTabChange }: BottomEditorialBarProps) {
  const [activeSlide, setActiveSlide] = useState(0);

  const events = [
    {
      title: 'Pink Line Shift A',
      location: 'Mansarovar → Chandpole',
      time: 'Departs in 3 mins (Train #1 Alstom)',
    },
    {
      title: 'Blue Line Express',
      location: 'Civil Lines → Railway Stn',
      time: 'On Schedule: 08:45 AM (Train #2 BEML)',
    },
    {
      title: 'Signal Automation',
      location: 'Sindhi Camp Interchange',
      time: 'Track Switch Clear • Interlock Active',
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % events.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [events.length]);

  return (
    <footer className="fixed bottom-0 left-14 sm:left-16 right-0 z-40 bg-[#141416]/95 backdrop-blur-xl border-t border-[#242428] px-6 sm:px-12 py-3 flex items-center justify-between gap-6 select-none">
      
      {/* Column 1: Events & Live Schedules */}
      <div className="flex-1 max-w-sm hidden sm:block">
        <div className="text-[10px] tracking-[0.25em] text-neutral-400 font-mono uppercase mb-1">
          EVENTS &amp; SCHEDULES
        </div>
        <div className="text-xs text-white font-medium truncate">
          <span className="font-bold text-[#C5A880]">{events[activeSlide].title}:</span>{' '}
          {events[activeSlide].location}
        </div>
        <div className="text-[11px] text-neutral-400 mt-0.5">
          {events[activeSlide].time}
        </div>
        
        {/* Pagination Dots */}
        <div className="flex items-center gap-1.5 mt-1.5">
          {events.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveSlide(i)}
              className={`w-1.5 h-1.5 rounded-full transition-all cursor-pointer ${
                activeSlide === i ? 'w-4 bg-[#C5A880]' : 'bg-neutral-600 hover:bg-neutral-400'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Column 2: Center Visual Inset Thumbnail */}
      <div 
        onClick={() => onTabChange('topology')}
        className="hidden lg:flex items-center gap-3 p-1.5 px-3 rounded-sm bg-[#1C1C20] border border-[#27272A] hover:border-[#C5A880]/50 transition-colors cursor-pointer group"
        title="Open interactive Metro Map"
      >
        <div className="w-14 h-9 rounded-xs bg-[#121214] border border-neutral-700 overflow-hidden flex items-center justify-center p-1">
          <img 
            src="/uratro-pin-logo.png" 
            alt="Preview" 
            className="w-full h-full object-contain group-hover:scale-110 transition-transform"
          />
        </div>
        <div className="text-left text-xs">
          <span className="font-semibold text-white group-hover:text-[#C5A880] transition-colors">
            10 Stations Active
          </span>
        </div>
      </div>
    </footer>
  );
}
