import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowUpRight, Bath, Bed, ChevronLeft, ChevronRight, MapPin, Maximize } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link } from 'react-router-dom';

import { useCurrency } from '@/context/CurrencyContext';
import { useLocale } from '@/context/LocaleContext';
import { formatPriceFromAed } from '@/lib/currency';
import { propertyDetailsHref } from '@/lib/siteRoutes';
import { uiCopy } from '@/lib/uiCopy';
import type { HomePageContent, PropertyContent } from '@/types/content';

gsap.registerPlugin(ScrollTrigger);

interface FeaturedPropertiesProps {
  content: HomePageContent;
  properties: PropertyContent[];
}

const FeaturedProperties = ({ content, properties }: FeaturedPropertiesProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const { currency } = useCurrency();
  const { locale } = useLocale();
  const copy = uiCopy[locale];

  const carouselProperties = useMemo(() => {
    return [...properties].filter((property) => property.showInFeaturedCarousel).sort((a, b) => a.order - b.order);
  }, [properties]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        sliderRef.current,
        { opacity: 0, scale: 0.95 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const nextSlide = () => {
    if (carouselProperties.length === 0) return;
    setCurrentIndex((previous) => (previous + 1) % carouselProperties.length);
  };

  const prevSlide = () => {
    if (carouselProperties.length === 0) return;
    setCurrentIndex((previous) => (previous - 1 + carouselProperties.length) % carouselProperties.length);
  };

  const getSlideStyle = (index: number) => {
    const diff = index - currentIndex;
    const normalizedDiff = (diff + carouselProperties.length) % carouselProperties.length;
    const adjustedDiff = normalizedDiff > carouselProperties.length / 2 ? normalizedDiff - carouselProperties.length : normalizedDiff;

    if (adjustedDiff === 0) {
      return { transform: 'translateX(0) scale(1) rotateY(0deg)', opacity: 1, zIndex: 10 };
    }

    if (adjustedDiff === 1 || adjustedDiff === -carouselProperties.length + 1) {
      return { transform: 'translateX(60%) scale(0.85) rotateY(-15deg)', opacity: 0.6, zIndex: 5 };
    }

    if (adjustedDiff === -1 || adjustedDiff === carouselProperties.length - 1) {
      return { transform: 'translateX(-60%) scale(0.85) rotateY(15deg)', opacity: 0.6, zIndex: 5 };
    }

    return { transform: 'translateX(0) scale(0.7)', opacity: 0, zIndex: 0 };
  };

  const shouldRenderSlide = (index: number) => {
    if (carouselProperties.length <= 3) {
      return true;
    }

    const distance = Math.abs(index - currentIndex);
    const wrappedDistance = Math.min(distance, carouselProperties.length - distance);
    return wrappedDistance <= 1;
  };

  return (
    <section ref={sectionRef} className="py-20 overflow-hidden">
      <div className="section-padding mb-12">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-[2px] bg-[#d4a853]" />
              <span className="text-[#d4a853] text-sm tracking-[0.2em] uppercase font-medium">{content.featuredPropertiesLabel}</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              {content.featuredPropertiesTitle} <span className="text-[#d4a853]">{content.featuredPropertiesTitleHighlight}</span>
            </h2>
          </div>

          <div className="hidden md:flex gap-3">
            <button
              onClick={prevSlide}
              className="w-12 h-12 rounded-full border border-[#333333] flex items-center justify-center text-white hover:border-[#d4a853] hover:text-[#d4a853] hover:bg-[#d4a853]/10 transition-all duration-300"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextSlide}
              className="w-12 h-12 rounded-full border border-[#333333] flex items-center justify-center text-white hover:border-[#d4a853] hover:text-[#d4a853] hover:bg-[#d4a853]/10 transition-all duration-300"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div ref={sliderRef} className="relative h-[500px] md:h-[620px] perspective-1000">
        <div className="absolute inset-0 flex items-center justify-center preserve-3d">
          {carouselProperties.map((property, index) => {
            if (!shouldRenderSlide(index)) {
              return null;
            }

            const formattedPrice = formatPriceFromAed({
              amountAed: property.priceAed,
              currency,
              locale,
              fallback: property.price || copy.onRequest,
            });

            return (
              <div
                key={property.seedKey}
                className="absolute w-[90%] md:w-[600px] transition-all duration-500 ease-out cursor-pointer"
                style={getSlideStyle(index)}
                onClick={() => setCurrentIndex(index)}
              >
                <div className="bg-[#1a1a1a] rounded-2xl overflow-hidden shadow-2xl">
                  <div className="relative h-64 md:h-80 overflow-hidden">
                    <img
                      src={property.image}
                      alt={property.title}
                      className="w-full h-full object-cover"
                      loading={index === currentIndex ? 'eager' : 'lazy'}
                      decoding="async"
                      fetchPriority={index === currentIndex ? 'high' : 'low'}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />

                    {property.featured && (
                      <span className="absolute top-4 left-4 px-3 py-1 bg-[#d4a853] text-[#0a0a0a] text-xs font-bold rounded-full">
                        {content.featuredBadgeLabel}
                      </span>
                    )}

                    <div className="absolute bottom-4 left-4">
                      <p className="text-3xl font-bold text-white">{formattedPrice}</p>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-2 hover:text-[#d4a853] transition-colors">{property.title}</h3>

                    <div className="flex items-center gap-2 text-[#888888] mb-4">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{property.location}</span>
                    </div>

                    <div className="flex items-center gap-6 pt-4 border-t border-[#333333]">
                      <div className="flex items-center gap-2 text-[#888888]">
                        <Bed className="w-4 h-4" />
                        <span className="text-sm">{property.beds}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[#888888]">
                        <Bath className="w-4 h-4" />
                        <span className="text-sm">{property.baths ?? 0}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[#888888]">
                        <Maximize className="w-4 h-4" />
                        <span className="text-sm">{property.area}</span>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3">
                      {property.agent ? (
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#d4a853]/20 flex items-center justify-center">
                            <span className="text-[#d4a853] text-xs font-bold">
                              {property.agent.name
                                .split(' ')
                                .map((name) => name[0])
                                .join('')}
                            </span>
                          </div>
                          <span className="text-sm text-[#888888]">{property.agent.name}</span>
                        </div>
                      ) : (
                        <div />
                      )}

                      <Link
                        to={propertyDetailsHref(property.slug || property.seedKey)}
                        className="inline-flex items-center gap-2 text-[#d4a853] text-sm font-medium hover:text-white transition-colors"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <span>{content.propertyViewDetailsLabel}</span>
                        <ArrowUpRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-2">
          {carouselProperties.map((property, index) => (
            <button
              key={`${property.seedKey}-dot`}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex ? 'w-8 bg-[#d4a853]' : 'bg-[#333333] hover:bg-[#555555]'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="flex md:hidden justify-center gap-3 mt-8">
        <button
          onClick={prevSlide}
          className="w-12 h-12 rounded-full border border-[#333333] flex items-center justify-center text-white hover:border-[#d4a853] hover:text-[#d4a853] transition-all duration-300"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={nextSlide}
          className="w-12 h-12 rounded-full border border-[#333333] flex items-center justify-center text-white hover:border-[#d4a853] hover:text-[#d4a853] transition-all duration-300"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </section>
  );
};

export default FeaturedProperties;
