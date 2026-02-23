import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, Bed, MapPin, Maximize } from 'lucide-react';
import { Link } from 'react-router-dom';

import { useCurrency } from '@/context/CurrencyContext';
import { useLocale } from '@/context/LocaleContext';
import { formatPriceFromAed } from '@/lib/currency';
import { propertyDetailsHref } from '@/lib/siteRoutes';
import { uiCopy } from '@/lib/uiCopy';
import type { HomePageContent, PropertyContent } from '@/types/content';

interface OffPlanProjectsProps {
  content: HomePageContent;
  properties: PropertyContent[];
}

const mapCopy = {
  en: {
    title: 'Property Map',
    subtitle: 'Explore filtered off-plan properties by location.',
    noData: 'No map coordinates are available for the current filtered properties.',
    selectHint: 'Select a property to center the map.',
    openMaps: 'Open in Maps',
  },
  fr: {
    title: 'Carte des biens',
    subtitle: 'Explorez les biens off-plan filtres par localisation.',
    noData: 'Aucune coordonnee cartographique disponible pour les biens filtres.',
    selectHint: 'Selectionnez un bien pour centrer la carte.',
    openMaps: 'Ouvrir dans Maps',
  },
  ar: {
    title: 'خريطة العقارات',
    subtitle: 'استكشف العقارات قيد الإنشاء حسب الموقع.',
    noData: 'لا توجد إحداثيات خريطة للعقارات المطابقة للفلاتر الحالية.',
    selectHint: 'اختر عقاراً لتركيز الخريطة عليه.',
    openMaps: 'فتح في الخرائط',
  },
} as const;

const hasCoordinates = (property: PropertyContent) => {
  return (
    typeof property.latitude === 'number' &&
    Number.isFinite(property.latitude) &&
    typeof property.longitude === 'number' &&
    Number.isFinite(property.longitude)
  );
};

const PropertyCard = ({
  property,
  index,
  viewDetailsLabel,
}: {
  property: PropertyContent;
  index: number;
  viewDetailsLabel: string;
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const { currency } = useCurrency();
  const { locale } = useLocale();
  const copy = uiCopy[locale];

  const formattedPrice = formatPriceFromAed({
    amountAed: property.priceAed,
    currency,
    locale,
    fallback: property.price || copy.onRequest,
  });

  const detailsHref = propertyDetailsHref(property.slug || property.seedKey);

  return (
    <div
      ref={cardRef}
      className={`group relative bg-[#1a1a1a] rounded-xl overflow-hidden card-3d stagger-item ${
        property.featured ? 'md:col-span-2 md:row-span-2' : ''
      }`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className={`relative overflow-hidden ${property.featured ? 'h-64 md:h-96' : 'h-48'}`}>
        <img src={property.image} alt={property.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" decoding="async" />

        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent opacity-60" />

        <div className="absolute top-4 left-4 flex gap-2">
          <span className="px-3 py-1 bg-[#d4a853] text-[#0a0a0a] text-xs font-bold rounded-full">{property.typeLabel}</span>
          <span className="px-3 py-1 bg-[#2d2d2d]/80 text-white text-xs font-medium rounded-full backdrop-blur-sm">{property.statusLabel}</span>
        </div>

        <div className="absolute bottom-4 left-4">
          {property.pricePrefix && <p className="text-[#888888] text-xs mb-1">{property.pricePrefix}</p>}
          <p className="text-2xl font-bold text-white">{formattedPrice}</p>
        </div>
      </div>

      <div className="p-5">
        <h3 className={`font-bold text-white group-hover:text-[#d4a853] transition-colors duration-300 ${property.featured ? 'text-xl' : 'text-lg'}`}>
          {property.title}
        </h3>

        <div className="flex items-center gap-2 mt-2 text-[#888888]">
          <MapPin className="w-4 h-4" />
          <span className="text-sm">{property.location}</span>
        </div>

        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-[#333333]">
          <div className="flex items-center gap-2 text-[#888888]">
            <Bed className="w-4 h-4" />
            <span className="text-sm">{property.beds}</span>
          </div>
          <div className="flex items-center gap-2 text-[#888888]">
            <Maximize className="w-4 h-4" />
            <span className="text-sm">{property.area}</span>
          </div>
        </div>

        <Link
          to={detailsHref}
          className="mt-4 w-full flex items-center justify-center gap-2 py-3 border border-[#333333] rounded-lg text-white/80 text-sm font-medium hover:border-[#d4a853] hover:text-[#d4a853] transition-all duration-300 group/btn"
        >
          <span>{viewDetailsLabel}</span>
          <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
        </Link>
      </div>
    </div>
  );
};

const resultCopy: Record<'en' | 'fr' | 'ar', { count: (n: number) => string; empty: string }> = {
  en: {
    count: (n) => `${n} properties found`,
    empty: 'No properties match the selected filters.',
  },
  fr: {
    count: (n) => `${n} biens trouves`,
    empty: 'Aucun bien ne correspond aux filtres selectionnes.',
  },
  ar: {
    count: (n) => `${n} عقار`,
    empty: 'لا توجد عقارات تطابق الفلاتر المحددة.',
  },
};

const OffPlanProjects = ({ content, properties }: OffPlanProjectsProps) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const { locale, dir } = useLocale();
  const { currency } = useCurrency();

  const offPlanProperties = useMemo(() => {
    return [...properties].filter((property) => property.showInOffPlan).sort((a, b) => a.order - b.order);
  }, [properties]);

  const mappableProperties = useMemo(() => {
    return offPlanProperties.filter(hasCoordinates);
  }, [offPlanProperties]);

  const [selectedMapSeedKey, setSelectedMapSeedKey] = useState<string | null>(null);

  useEffect(() => {
    if (mappableProperties.length === 0) {
      setSelectedMapSeedKey(null);
      return;
    }

    setSelectedMapSeedKey((current) => {
      if (current && mappableProperties.some((property) => property.seedKey === current)) {
        return current;
      }

      return mappableProperties[0].seedKey;
    });
  }, [mappableProperties]);

  const selectedMapProperty = useMemo(() => {
    if (!selectedMapSeedKey) return mappableProperties[0] ?? null;
    return mappableProperties.find((property) => property.seedKey === selectedMapSeedKey) ?? mappableProperties[0] ?? null;
  }, [mappableProperties, selectedMapSeedKey]);

  const mapEmbedSrc = selectedMapProperty
    ? `https://maps.google.com/maps?q=${selectedMapProperty.latitude},${selectedMapProperty.longitude}&z=13&output=embed`
    : null;

  return (
    <section ref={sectionRef} id="acheter" className="py-20 section-padding">
      <div ref={headerRef} className="mb-12">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-[2px] bg-[#d4a853]" />
          <span className="text-[#d4a853] text-sm tracking-[0.2em] uppercase font-medium">{content.offPlanLabel}</span>
        </div>
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white max-w-3xl">
          {content.offPlanTitle} <span className="text-[#d4a853]">{content.offPlanTitleHighlight}</span>
        </h2>
        <p className="mt-4 text-sm text-[#888888]">{resultCopy[locale].count(offPlanProperties.length)}</p>
      </div>

      <div className="flex flex-wrap gap-3 mb-10 stagger-container">
        {content.offPlanFilterChips.map((filter, index) => (
          <button
            key={`${filter}-${index}`}
            className="stagger-item px-5 py-2 bg-[#1a1a1a] border border-[#333333] rounded-full text-white/80 text-sm hover:border-[#d4a853] hover:text-[#d4a853] transition-all duration-300"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {filter}
          </button>
        ))}
      </div>

      <div id="listing-map" className="mb-12 rounded-2xl border border-[#2f2f2f] bg-[#121212] p-5 md:p-6">
        <div className="mb-4">
          <h3 className="text-2xl font-semibold text-white">{mapCopy[locale].title}</h3>
          <p className="text-sm text-[#8e8e8e] mt-1">{mapCopy[locale].subtitle}</p>
        </div>

        {selectedMapProperty && mapEmbedSrc ? (
          <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-5">
            <div className="rounded-xl overflow-hidden border border-[#2c2c2c] bg-[#0f0f0f]">
              <iframe
                title={`${selectedMapProperty.title} map`}
                src={mapEmbedSrc}
                className="w-full h-[360px] md:h-[440px]"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            <div className="rounded-xl border border-[#2c2c2c] bg-[#0f0f0f] p-3 md:p-4">
              <p className="text-xs text-[#8a8a8a] mb-3">{mapCopy[locale].selectHint}</p>
              <div className="max-h-[390px] overflow-y-auto space-y-2 pr-1">
                {mappableProperties.map((property) => {
                  const isActive = property.seedKey === selectedMapProperty.seedKey;
                  const googleHref = `https://www.google.com/maps?q=${property.latitude},${property.longitude}`;
                  const formattedPrice = formatPriceFromAed({
                    amountAed: property.priceAed,
                    currency,
                    locale,
                    fallback: property.price,
                  });

                  return (
                    <button
                      key={property.seedKey}
                      onClick={() => setSelectedMapSeedKey(property.seedKey)}
                      className={`w-full text-start rounded-lg border p-3 transition-colors ${
                        isActive
                          ? 'border-[#d4a853] bg-[#1a1a1a]'
                          : 'border-[#303030] bg-[#151515] hover:border-[#5a5a5a]'
                      }`}
                    >
                      <p className="text-sm font-semibold text-white line-clamp-1">{property.title}</p>
                      <p className="text-xs text-[#9a9a9a] line-clamp-1 mt-1">{property.location}</p>
                      <p className="text-xs text-[#d4a853] mt-1">{formattedPrice}</p>

                      <a
                        href={googleHref}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(event) => event.stopPropagation()}
                        className="inline-flex items-center gap-1 text-xs text-[#8ec5ff] hover:text-white mt-2"
                      >
                        <MapPin className="w-3 h-3" />
                        <span>{mapCopy[locale].openMaps}</span>
                      </a>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-[#2f2f2f] bg-[#0f0f0f] p-8 text-center text-[#888888]">
            {mapCopy[locale].noData}
          </div>
        )}
      </div>

      {offPlanProperties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-container">
          {offPlanProperties.map((property, index) => (
            <PropertyCard
              key={`${property.seedKey}-${index}`}
              property={property}
              index={index}
              viewDetailsLabel={content.propertyViewDetailsLabel}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-[#333333] bg-[#121212] p-10 text-center text-[#888888]">{resultCopy[locale].empty}</div>
      )}

      <div className="mt-12 text-center">
        <button className="btn-primary inline-flex items-center gap-3 group">
          <span>{content.offPlanViewAllLabel}</span>
          <ArrowRight className={`w-4 h-4 transition-transform duration-300 ${dir === 'rtl' ? 'group-hover:-translate-x-1' : 'group-hover:translate-x-1'}`} />
        </button>
      </div>
    </section>
  );
};

export default OffPlanProjects;


