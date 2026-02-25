import { useEffect, useRef } from 'react';
import { ArrowRight, User } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import type { HomePageContent } from '@/types/content';

gsap.registerPlugin(ScrollTrigger);

const FeaturedBanner = ({ content }: { content: HomePageContent }) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(bgRef.current, {
        y: '-30%',
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      });

      gsap.fromTo(
        contentRef.current,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 70%',
            toggleActions: 'play none none none',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="image-banner relative h-[70vh] min-h-[500px] overflow-hidden">
      <div
        ref={bgRef}
        className="absolute inset-0 w-full h-[150%] -top-[25%]"
        style={{
          backgroundImage: `url(${content.featuredBannerImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          willChange: 'transform',
        }}
      />

      <div className="featured-overlay-x absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/90 via-[#0a0a0a]/50 to-transparent" />
      <div className="featured-overlay-y absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-[#0a0a0a]/30" />

      <div ref={contentRef} className="relative z-10 h-full flex items-center section-padding">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-2 h-2 bg-[#d4a853] rounded-full animate-pulse" />
            <span className="text-[#d4a853] text-sm tracking-[0.2em] uppercase font-medium">{content.featuredBannerLabel}</span>
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
            {content.featuredBannerTitle} <span className="text-[#d4a853]">{content.featuredBannerTitleHighlight}</span>
          </h2>

          <p className="text-white/70 text-lg mb-8 max-w-lg">{content.featuredBannerDescription}</p>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#d4a853]/20 flex items-center justify-center border border-[#d4a853]/30">
                <User className="w-6 h-6 text-[#d4a853]" />
              </div>
              <div>
                <p className="text-white font-medium">{content.featuredBannerAgent.name}</p>
                <p className="text-[#888888] text-sm">{content.featuredBannerAgent.title}</p>
              </div>
            </div>

            <button className="btn-gold inline-flex items-center gap-3 group">
              <span>{content.featuredBannerDiscoverLabel || content.featuredBannerCtaLabel}</span>
              <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </div>

          <div className="mt-12 flex gap-12">
            {content.featuredBannerStats.map((stat) => (
              <div key={`${stat.value}-${stat.label}`}>
                <p className="text-3xl font-bold text-[#d4a853]">{stat.value}</p>
                <p className="text-[#888888] text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#d4a853]/30 to-transparent" />
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-1 h-32 bg-gradient-to-b from-transparent via-[#d4a853] to-transparent opacity-50" />
    </section>
  );
};

export default FeaturedBanner;
