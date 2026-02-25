import { useEffect, useRef } from 'react';
import { ArrowRight, Brain, HandshakeIcon, Key, Play, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { APP_ROUTES } from '@/lib/siteRoutes';
import type { HomePageContent } from '@/types/content';

gsap.registerPlugin(ScrollTrigger);

const iconMap = {
  brain: Brain,
  'trending-up': TrendingUp,
  key: Key,
  handshake: HandshakeIcon,
} as const;

const About = ({ content }: { content: HomePageContent }) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(imageRef.current, {
        y: -30,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="agence" className="py-20 section-padding overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        <div className="order-2 lg:order-1">
          <div className="fade-up flex items-center gap-4 mb-6">
            <div className="w-12 h-[2px] bg-[#d4a853]" />
            <span className="text-[#d4a853] text-sm tracking-[0.2em] uppercase font-medium">{content.aboutLabel}</span>
          </div>

          <h2 className="fade-up text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-8">
            {content.aboutTitle} <span className="text-[#d4a853]">{content.aboutTitleHighlight}</span>
          </h2>

          <div className="fade-up space-y-4 mb-8">
            <p className="text-white/80 text-lg leading-relaxed">{content.aboutLead}</p>
            <p className="text-[#888888] leading-relaxed">{content.aboutBody}</p>
          </div>

          <div className="space-y-4 mb-10">
            {content.aboutFeatures.map((feature, index) => {
              const Icon = iconMap[feature.icon as keyof typeof iconMap] ?? Brain;

              return (
                <div
                  key={`${feature.icon}-${index}`}
                  className="fade-up flex items-center gap-4 group cursor-pointer"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="w-10 h-10 rounded-full bg-[#d4a853]/10 flex items-center justify-center group-hover:bg-[#d4a853]/20 transition-colors duration-300">
                    <Icon className="w-5 h-5 text-[#d4a853]" />
                  </div>
                  <span className="text-white/80 group-hover:text-[#d4a853] transition-colors duration-300">{feature.text}</span>
                </div>
              );
            })}
          </div>

          <p className="fade-up text-[#888888] leading-relaxed mb-8">{content.aboutAdditionalText}</p>

          <div className="fade-up">
            <Link to={APP_ROUTES.contact} className="btn-gold inline-flex items-center gap-3 group">
              <span>{content.aboutCtaLabel}</span>
              <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        <div ref={imageRef} className="order-1 lg:order-2 relative">
          <div className="slide-right relative rounded-2xl overflow-hidden group">
            <img
              src={content.aboutImage}
              alt={content.aboutImageAlt}
              className="w-full h-[400px] lg:h-[600px] object-cover transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
              decoding="async"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/60 via-transparent to-transparent" />

            <Link
              to={APP_ROUTES.agency}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-[#d4a853] rounded-full flex items-center justify-center group/btn pulse-gold hover:scale-110 transition-transform duration-300"
              aria-label={content.aboutCtaLabel}
            >
              <Play className="w-8 h-8 text-[#0a0a0a] ml-1" fill="#0a0a0a" />
              <span className="absolute inset-0 rounded-full border-2 border-[#d4a853] animate-ping opacity-30" />
              <span className="absolute inset-[-10px] rounded-full border border-[#d4a853]/30 animate-ping opacity-20 animation-delay-200" />
            </Link>

            <div className="absolute bottom-6 left-6 right-6 flex justify-between gap-3">
              {content.aboutStats.map((stat) => (
                <div key={`${stat.value}-${stat.label}`} className="bg-[#0a0a0a]/80 backdrop-blur-sm rounded-lg px-4 py-3">
                  <p className="text-2xl font-bold text-[#d4a853]">{stat.value}</p>
                  <p className="text-xs text-[#888888]">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="absolute -top-4 -right-4 w-24 h-24 border border-[#d4a853]/20 rounded-lg -z-10" />
          <div className="absolute -bottom-4 -left-4 w-32 h-32 border border-[#d4a853]/20 rounded-lg -z-10" />
        </div>
      </div>
    </section>
  );
};

export default About;
