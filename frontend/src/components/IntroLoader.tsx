import { useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';

interface IntroLoaderProps {
  onIntroComplete?: () => void;
}

export default function IntroLoader({ onIntroComplete }: IntroLoaderProps) {
  const isFinishedRef = useRef(false);
  const onIntroCompleteRef = useRef(onIntroComplete);
  onIntroCompleteRef.current = onIntroComplete;

  const wrapRef = useRef<HTMLDivElement>(null);
  const uratroBrandRef = useRef<HTMLDivElement>(null);
  const emblemRef = useRef<HTMLDivElement>(null);
  const uraRef = useRef<HTMLSpanElement>(null);
  const dividerRef = useRef<HTMLSpanElement>(null);
  const troRef = useRef<HTMLSpanElement>(null);
  const masterTimelineRef = useRef<gsap.core.Timeline | null>(null);

  // Smooth exit transition that lifts the curtain into the live homepage
  const finishAndRevealHomepage = useCallback(() => {
    if (isFinishedRef.current) return;
    isFinishedRef.current = true;

    if (masterTimelineRef.current) {
      masterTimelineRef.current.kill();
    }

    const exitTl = gsap.timeline({
      onComplete: () => {
        if (onIntroCompleteRef.current) {
          onIntroCompleteRef.current();
        }
      }
    });

    // 1. Brand logo softly dissolves and blurs
    exitTl.to(uratroBrandRef.current, {
      opacity: 0,
      scale: 0.95,
      filter: 'blur(10px)',
      duration: 0.4,
      ease: 'power2.inOut'
    });

    // 2. The black curtain slides up smoothly revealing the live Uratro homepage
    exitTl.to(
      wrapRef.current,
      {
        yPercent: -100,
        duration: 0.8,
        ease: 'power3.inOut'
      },
      '-=0.15'
    );
  }, []);

  useEffect(() => {
    if (!wrapRef.current || !uratroBrandRef.current) return;

    const ctx = gsap.context(() => {
      // Set initial states (matching inline styles)
      gsap.set(uratroBrandRef.current, { opacity: 0 });
      gsap.set(emblemRef.current, { scale: 0.88, opacity: 0, filter: 'blur(8px)' });
      gsap.set(uraRef.current, { opacity: 0, x: -16, filter: 'blur(4px)' });
      gsap.set(dividerRef.current, { scaleY: 0, opacity: 0 });
      gsap.set(troRef.current, { opacity: 0, x: 16, filter: 'blur(4px)' });

      const tl = gsap.timeline();
      masterTimelineRef.current = tl;

      // Step 1: Fade in the brand container
      tl.to(uratroBrandRef.current, {
        opacity: 1,
        duration: 0.35,
        delay: 0.15,
        ease: 'power2.out'
      });

      // Step 2: Emblem scales in and unblurs
      tl.to(
        emblemRef.current,
        {
          scale: 1,
          opacity: 1,
          filter: 'blur(0px)',
          duration: 0.7,
          ease: 'power3.out'
        },
        '<'
      );

      // Step 3: 'URA' slides in smoothly
      tl.to(
        uraRef.current,
        {
          opacity: 1,
          x: 0,
          filter: 'blur(0px)',
          duration: 0.55,
          ease: 'power3.out'
        },
        '-=0.25'
      );

      // Step 4: Vertical separator bar '|' expands
      tl.to(
        dividerRef.current,
        {
          scaleY: 1,
          opacity: 1,
          duration: 0.35,
          ease: 'power2.out'
        },
        '-=0.3'
      );

      // Step 5: 'TRO' slides in smoothly
      tl.to(
        troRef.current,
        {
          opacity: 1,
          x: 0,
          filter: 'blur(0px)',
          duration: 0.55,
          ease: 'power3.out'
        },
        '-=0.25'
      );

      // Step 6: Calm hold so the full logo is appreciated
      tl.to({}, { duration: 1.1 });

      // Step 7: Transition to homepage
      tl.add(() => {
        finishAndRevealHomepage();
      });
    }, wrapRef);

    // Failsafe timer so it NEVER gets stuck
    const failsafe = setTimeout(() => {
      finishAndRevealHomepage();
    }, 4500);

    return () => {
      clearTimeout(failsafe);
      ctx.revert();
    };
  }, [finishAndRevealHomepage]);

  return (
    <div
      ref={wrapRef}
      onClick={finishAndRevealHomepage}
      className="fixed inset-0 z-[99999] bg-[#0B0B0B] pointer-events-auto select-none overflow-hidden flex items-center justify-center cursor-pointer will-change-transform"
      title="Click to skip intro"
    >
      <div
        ref={uratroBrandRef}
        style={{ opacity: 0 }}
        className="flex items-center justify-center pointer-events-none will-change-transform"
      >
        <div className="flex items-center justify-center">
          {/* Official Uratro Metro Pin Logo Mark */}
          <div
            ref={emblemRef}
            style={{ opacity: 0, filter: 'blur(8px)', transform: 'scale(0.88)' }}
            className="w-12 h-14 sm:w-16 sm:h-20 md:w-20 md:h-24 mr-4 sm:mr-6 flex items-center justify-center drop-shadow-[0_0_25px_rgba(255,255,255,0.3)] will-change-transform"
          >
            <img
              src="/uratro-pin-logo.png"
              alt="Uratro"
              className="w-full h-full object-contain"
            />
          </div>

          {/* Typography: U R A  |  T R O */}
          <div className="flex items-center font-sans tracking-[0.38em] text-xl sm:text-2xl md:text-3xl font-light text-white uppercase select-none">
            <span
              ref={uraRef}
              style={{ opacity: 0, filter: 'blur(4px)', transform: 'translateX(-16px)' }}
              className="inline-block font-light will-change-transform"
            >
              URA
            </span>

            {/* Crisp vertical separator line */}
            <span
              ref={dividerRef}
              style={{ opacity: 0, transform: 'scaleY(0)' }}
              className="inline-block h-6 sm:h-8 w-[1.5px] bg-white/70 mx-3 sm:mx-5 origin-center will-change-transform"
            />

            <span
              ref={troRef}
              style={{ opacity: 0, filter: 'blur(4px)', transform: 'translateX(16px)' }}
              className="inline-block font-light will-change-transform"
            >
              TRO
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
