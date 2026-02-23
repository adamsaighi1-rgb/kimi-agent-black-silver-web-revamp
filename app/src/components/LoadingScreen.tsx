import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface LoadingScreenProps {
  brandMain: string;
  brandSuffix: string;
  brandSubtext: string;
  loadingText: string;
}

const LoadingScreen = ({ brandMain, brandSuffix, brandSubtext, loadingText }: LoadingScreenProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      tl.fromTo(logoRef.current, { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.8, ease: 'power3.out' });

      tl.fromTo(lineRef.current, { scaleX: 0 }, { scaleX: 1, duration: 0.6, ease: 'power3.out' }, '-=0.3');

      tl.fromTo(progressRef.current, { scaleX: 0 }, { scaleX: 1, duration: 1.5, ease: 'power2.inOut' }, '-=0.2');

      tl.fromTo(textRef.current, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out' }, '-=1.2');

      tl.to(containerRef.current, {
        opacity: 0,
        duration: 0.5,
        ease: 'power2.inOut',
        delay: 0.3,
      });

      tl.to(containerRef.current, {
        display: 'none',
        duration: 0,
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="loading-screen fixed inset-0 z-[9999] bg-[#0a0a0a] flex flex-col items-center justify-center">
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, #d4a853 1px, transparent 0)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div ref={logoRef} className="relative z-10 text-center">
        <h1 className="text-4xl md:text-6xl font-bold tracking-wider">
          <span className="text-white">{brandMain}</span>
          <span className="text-[#d4a853]">{brandSuffix}</span>
        </h1>
        <p className="text-[#888888] text-sm tracking-[0.3em] mt-2 uppercase">{brandSubtext}</p>
      </div>

      <div ref={lineRef} className="w-32 h-[2px] bg-gradient-to-r from-transparent via-[#d4a853] to-transparent mt-8 origin-center" />

      <div className="w-48 h-[2px] bg-[#2d2d2d] mt-8 rounded-full overflow-hidden">
        <div ref={progressRef} className="h-full bg-gradient-to-r from-[#d4a853] to-[#b8923d] origin-left" />
      </div>

      <div ref={textRef} className="mt-6 text-[#888888] text-xs tracking-[0.2em] uppercase">
        {loadingText}
      </div>

      <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-[#d4a853] rounded-full opacity-20 animate-pulse" />
      <div className="absolute bottom-1/3 right-1/4 w-3 h-3 bg-[#d4a853] rounded-full opacity-10 animate-pulse animation-delay-500" />
      <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-[#d4a853] rounded-full opacity-30 animate-pulse animation-delay-300" />
    </div>
  );
};

export default LoadingScreen;
