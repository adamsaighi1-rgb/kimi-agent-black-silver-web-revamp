import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import type { HomePageContent } from '@/types/content';

gsap.registerPlugin(ScrollTrigger);

const Hero = ({ content }: { content: HomePageContent }) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const headline1Ref = useRef<HTMLDivElement>(null);
  const headline2Ref = useRef<HTMLDivElement>(null);
  const subheadlineRef = useRef<HTMLParagraphElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(bgRef.current, { scale: 1.1 }, { scale: 1, duration: 8, ease: 'none' });

      gsap.fromTo(
        headline1Ref.current,
        { opacity: 0, y: 60, clipPath: 'inset(0 100% 0 0)' },
        {
          opacity: 1,
          y: 0,
          clipPath: 'inset(0 0% 0 0)',
          duration: 1,
          delay: 0.3,
          ease: 'power3.out',
        }
      );

      gsap.fromTo(
        headline2Ref.current,
        { opacity: 0, y: 60, clipPath: 'inset(0 100% 0 0)' },
        {
          opacity: 1,
          y: 0,
          clipPath: 'inset(0 0% 0 0)',
          duration: 1,
          delay: 0.5,
          ease: 'power3.out',
        }
      );

      gsap.fromTo(
        subheadlineRef.current,
        { opacity: 0, y: 30, filter: 'blur(10px)' },
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 0.8,
          delay: 0.9,
          ease: 'power3.out',
        }
      );

      gsap.fromTo(mediaRef.current, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.6, delay: 1.2, ease: 'power3.out' });

      gsap.to(bgRef.current, {
        y: '-20%',
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });

      gsap.to(contentRef.current, {
        opacity: 0,
        y: -50,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '50% top',
          scrub: true,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="image-banner relative h-screen w-full overflow-hidden">
      <div
        ref={bgRef}
        className="absolute inset-0 w-full h-full"
        style={{
          backgroundImage: `url(${content.heroBackground})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          willChange: 'transform',
        }}
      />

      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/60 via-[#0a0a0a]/40 to-[#0a0a0a]/80" />
      <div className="absolute inset-0 opacity-[0.03] noise-overlay pointer-events-none" />

      <div ref={contentRef} className="relative z-10 h-full flex flex-col items-center justify-center section-padding text-center">
        <div className="max-w-5xl mx-auto">
          <div ref={headline1Ref} className="overflow-hidden">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight">{content.heroTitleLine1}</h1>
          </div>
          <div ref={headline2Ref} className="overflow-hidden mt-2">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              <span className="text-[#d4a853]">{content.heroTitleHighlight}</span>
            </h1>
          </div>

          <p ref={subheadlineRef} className="mt-8 text-base sm:text-lg md:text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
            {content.heroSubtitle}
          </p>
        </div>

        <div ref={mediaRef} className="absolute bottom-32 left-0 right-0 section-padding">
          <div className="flex flex-col items-center">
            <p className="text-[#888888] text-xs tracking-[0.2em] uppercase mb-6">{content.mediaMentionsLabel}</p>
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
              {content.mediaLogos.map((logo) => (
                <div
                  key={`${logo.name}-${logo.widthClass}`}
                  className={`${logo.widthClass} h-8 flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity duration-300`}
                >
                  <span className="text-white font-bold text-sm tracking-wider">{logo.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#d4a853]/30 to-transparent" />

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <span className="text-[#888888] text-xs tracking-wider uppercase">{content.scrollLabel}</span>
        <div className="w-[1px] h-8 bg-gradient-to-b from-[#d4a853] to-transparent animate-pulse" />
      </div>
    </section>
  );
};

export default Hero;
