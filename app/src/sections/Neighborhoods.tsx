import { useMemo, useRef } from 'react';
import { ArrowUpRight, MapPin } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link } from 'react-router-dom';

import { APP_ROUTES } from '@/lib/siteRoutes';
import type { HomePageContent, NeighborhoodContent } from '@/types/content';

gsap.registerPlugin(ScrollTrigger);

interface NeighborhoodsProps {
  content: HomePageContent;
  neighborhoods: NeighborhoodContent[];
}

const NeighborhoodCard = ({
  neighborhood,
  index,
  areaLabel,
  listingsLabel,
}: {
  neighborhood: NeighborhoodContent;
  index: number;
  areaLabel: string;
  listingsLabel: string;
}) => {
  const rotations = [-2, 1, -1];
  const rotation = rotations[index % rotations.length];

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl cursor-pointer stagger-item ${
        neighborhood.size === 'large'
          ? 'md:col-span-2 md:row-span-2'
          : neighborhood.size === 'medium'
            ? 'md:col-span-1 md:row-span-2'
            : 'md:col-span-1 md:row-span-1'
      }`}
      style={{
        transform: `rotate(${rotation}deg)`,
        transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <div className="relative h-full min-h-[250px] md:min-h-[300px] overflow-hidden rounded-2xl" style={{ transform: 'rotate(0deg)' }}>
        <img src={neighborhood.image} alt={neighborhood.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" decoding="async" />

        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/30 to-transparent opacity-70 group-hover:opacity-80 transition-opacity duration-300" />

        <div className="absolute inset-0 p-6 flex flex-col justify-end">
          <div className="flex items-center gap-2 text-[#d4a853] mb-2">
            <MapPin className="w-4 h-4" />
            <span className="text-xs tracking-wider uppercase">{areaLabel}</span>
          </div>

          <h3 className="text-2xl md:text-3xl font-bold text-white mb-2 group-hover:text-[#d4a853] transition-colors duration-300">{neighborhood.name}</h3>

          <div className="flex items-center justify-between">
            <span className="text-[#888888] text-sm">
              {neighborhood.listings} {listingsLabel}
            </span>

            <div className="w-10 h-10 rounded-full bg-[#d4a853]/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
              <ArrowUpRight className="w-5 h-5 text-[#d4a853]" />
            </div>
          </div>
        </div>

        <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-[#d4a853]/30 transition-colors duration-300 pointer-events-none" />
      </div>
    </div>
  );
};

const Neighborhoods = ({ content, neighborhoods }: NeighborhoodsProps) => {
  const sectionRef = useRef<HTMLDivElement>(null);

  const sortedNeighborhoods = useMemo(() => {
    return [...neighborhoods].sort((a, b) => a.order - b.order);
  }, [neighborhoods]);

  return (
    <section ref={sectionRef} className="py-20 section-padding">
      <div className="mb-12">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-[2px] bg-[#d4a853]" />
          <span className="text-[#d4a853] text-sm tracking-[0.2em] uppercase font-medium">{content.neighborhoodsLabel}</span>
        </div>
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">
          {content.neighborhoodsTitle} <span className="text-[#d4a853]">{content.neighborhoodsTitleHighlight}</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-container" style={{ perspective: '1000px' }}>
        {sortedNeighborhoods.map((neighborhood, index) => (
          <NeighborhoodCard
            key={neighborhood.seedKey}
            neighborhood={neighborhood}
            index={index}
            areaLabel={content.neighborhoodsAreaLabel}
            listingsLabel={content.neighborhoodsListingsLabel}
          />
        ))}
      </div>

      <div className="mt-12 text-center">
        <Link to={APP_ROUTES.sell} className="inline-flex items-center gap-2 text-[#d4a853] hover:text-white transition-colors duration-300 group">
          <span className="text-sm font-medium tracking-wider uppercase">{content.neighborhoodsViewAllLabel}</span>
          <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
        </Link>
      </div>
    </section>
  );
};

export default Neighborhoods;


