import { useEffect, useState, useRef } from 'react';
import { useProgress } from '@react-three/drei';
import gsap from 'gsap';

interface IntroLoaderProps {
  onIntroComplete?: () => void;
}

export default function IntroLoader({ onIntroComplete }: IntroLoaderProps) {
  const { progress: modelProgress, active } = useProgress();
  const [displayProgress, setDisplayProgress] = useState(0);
  const [statusText, setStatusText] = useState('INITIALIZING TRANSIT ARCHITECTURE');
  const [isDone, setIsDone] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLImageElement>(null);
  const textWrapRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  // Smooth numeric counter interpolator
  useEffect(() => {
    // Ensure minimum visual duration of ~3.2 seconds for cinematic feel,
    // while strictly waiting for the real 3D model to be 100% loaded.
    let startTime = performance.now();
    const minDuration = 3200; // ms

    const interval = setInterval(() => {
      const elapsed = performance.now() - startTime;
      const timeRatio = Math.min(1, elapsed / minDuration);
      
      // Calculate effective progress: real 3D model progress weighted with time
      const target = Math.min(100, Math.max(Math.round(timeRatio * 90), Math.round(modelProgress)));

      setDisplayProgress(prev => {
        if (prev < target) {
          const next = prev + 1;
          
          if (next < 25) {
            setStatusText('INITIALIZING TRANSIT ARCHITECTURE');
          } else if (next < 60) {
            setStatusText('PRELOADING 3D ROLLING STOCK (20.2 MB)');
          } else if (next < 90) {
            setStatusText('SYNCHRONIZING ORBITAL DIGITAL TWIN');
          } else if (next < 100) {
            setStatusText('FINALIZING TELEMETRY STREAM');
          } else {
            setStatusText('SYSTEM ONLINE // READY');
          }
          return next;
        }
        return prev;
      });

      // When both real model is done AND min duration passed
      if (!active && modelProgress >= 100 && elapsed >= minDuration) {
        setDisplayProgress(100);
        setStatusText('SYSTEM ONLINE // READY');
        clearInterval(interval);
      }
    }, 28);

    return () => clearInterval(interval);
  }, [modelProgress, active]);

  // When displayProgress hits 100%, trigger the exact Nabil Issa outro sequence
  useEffect(() => {
    if (displayProgress < 100 || isDone) return;
    setIsDone(true);

    const tl = gsap.timeline({
      delay: 0.25,
      onComplete: () => {
        if (onIntroComplete) onIntroComplete();
      }
    });

    // 1. Logo blurs and lifts gently
    tl.to(logoRef.current, {
      filter: 'blur(10px)',
      opacity: 0,
      y: -15,
      scale: 1.04,
      duration: 0.9,
      ease: 'power4.inOut'
    });

    // 2. Subtitle & counter fade out simultaneously
    tl.to([textWrapRef.current, counterRef.current, lineRef.current], {
      opacity: 0,
      y: 10,
      duration: 0.7,
      ease: 'power3.inOut'
    }, '<0.1');

    // 3. The entire curtain lifts / dissolves with luxury ease
    tl.to(containerRef.current, {
      yPercent: -100,
      duration: 1.2,
      ease: 'power4.inOut',
      pointerEvents: 'none'
    }, '-=0.4');

  }, [displayProgress, isDone, onIntroComplete]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100] bg-black flex flex-col justify-between items-center p-6 sm:p-12 select-none overflow-hidden"
      style={{
        background: 'radial-gradient(circle at 50% 50%, rgba(20, 20, 25, 0.9) 0%, #000000 80%)'
      }}
    >
      {/* Top subtle branding index */}
      <div className="w-full flex justify-between items-center text-[10px] sm:text-[11px] font-mono tracking-[0.3em] text-neutral-500 uppercase">
        <span>URATRO.SYS // VER 2.0</span>
        <span>DELUXE MINIMALISM</span>
      </div>

      {/* Centerpiece: The Uratro Serif Logo & Architectural Subtitle */}
      <div className="flex flex-col items-center justify-center text-center my-auto px-4 max-w-2xl">
        {/* Ambient backglow */}
        <div className="relative flex items-center justify-center">
          <div className="absolute -inset-10 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>

          <img
            ref={logoRef}
            src="/uratro-logo-clean.png"
            alt="Uratro"
            className="h-16 sm:h-24 md:h-28 w-auto object-contain filter drop-shadow-[0_0_25px_rgba(255,255,255,0.15)] transition-all"
          />
        </div>

        {/* Nabil Issa style architectural question & identity */}
        <div ref={textWrapRef} className="mt-6 space-y-2">
          <h1 className="text-xs sm:text-sm md:text-base font-light tracking-[0.25em] text-neutral-300 font-sans uppercase">
            Can data shape how cities move?
          </h1>
          <p className="text-[9px] sm:text-[10px] tracking-[0.35em] text-neutral-500 font-mono uppercase">
            Autonomous Rapid Transit Operations // Digital Twin
          </p>
        </div>
      </div>

      {/* Bottom: Luxury Hairline Progress Line & Counter */}
      <div ref={counterRef} className="w-full max-w-md flex flex-col gap-3 font-mono">
        <div className="flex justify-between items-end text-xs tracking-widest">
          <span className="text-[10px] text-neutral-500 uppercase">
            {statusText}
          </span>
          <span className="text-sm font-light text-white font-mono">
            {String(displayProgress).padStart(2, '0')}%
          </span>
        </div>

        {/* Hairline Progress Track */}
        <div className="w-full h-[1px] bg-neutral-900 relative overflow-hidden">
          <div
            ref={lineRef}
            className="absolute top-0 left-0 bottom-0 bg-gradient-to-r from-neutral-500 via-white to-cyan-300 transition-all duration-150 ease-out"
            style={{ width: `${displayProgress}%` }}
          />
        </div>

        <div className="flex justify-between text-[8px] text-neutral-600 uppercase tracking-widest">
          <span>JAIPUR METRO NETWORK</span>
          <span>EST. 2026 // 3NF / BCNF</span>
        </div>
      </div>
    </div>
  );
}
