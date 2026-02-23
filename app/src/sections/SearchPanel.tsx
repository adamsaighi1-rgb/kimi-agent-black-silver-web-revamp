import { useEffect, useMemo, useRef, useState } from 'react';
import { Bed, ChevronDown, Coins, Home, MapPin, Search, Wallet, X } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { useCurrency } from '@/context/CurrencyContext';
import { useLocale } from '@/context/LocaleContext';
import { convertFromAed } from '@/lib/currency';
import {
  filterProperties,
  getReellyStyleBedrooms,
  getReellyStylePropertyType,
  type PropertyFilterCriteria,
} from '@/lib/propertyFilters';
import { uiCopy } from '@/lib/uiCopy';
import type { CurrencyCode, HomePageContent, PropertyContent, SearchFilter } from '@/types/content';

gsap.registerPlugin(ScrollTrigger);

const iconMap = {
  home: Home,
  bed: Bed,
  'map-pin': MapPin,
  euro: Coins,
  price: Wallet,
  coins: Coins,
  wallet: Wallet,
} as const;

const propertyTypeLabels = {
  studio: { en: 'Studio', fr: 'Studio', ar: '\u0627\u0633\u062a\u0648\u062f\u064a\u0648' },
  apartment: { en: 'Apartment', fr: 'Appartement', ar: '\u0634\u0642\u0629' },
  penthouse: { en: 'Penthouse', fr: 'Penthouse', ar: '\u0628\u0646\u062a\u0647\u0627\u0648\u0633' },
  townhouse: { en: 'Townhouse', fr: 'Maison de ville', ar: '\u062a\u0627\u0648\u0646 \u0647\u0627\u0648\u0633' },
  villa: { en: 'Villa', fr: 'Villa', ar: '\u0641\u064a\u0644\u0627' },
  duplex: { en: 'Duplex', fr: 'Duplex', ar: '\u062f\u0648\u0628\u0644\u0643\u0633' },
  mansion: { en: 'Mansion', fr: 'Manoir', ar: '\u0642\u0635\u0631' },
  'hotel apartment': { en: 'Hotel Apartment', fr: 'Appartement hotelier', ar: '\u0634\u0642\u0629 \u0641\u0646\u062f\u0642\u064a\u0629' },
} as const;

const localizePropertyType = (value: string, locale: 'en' | 'fr' | 'ar') => {
  const normalized = value.trim().toLowerCase();
  const mapped = propertyTypeLabels[normalized as keyof typeof propertyTypeLabels];
  return mapped ? mapped[locale] : value;
};

const panelCopy = {
  en: {
    resultCount: (visible: number, total: number) => `${visible} matching properties of ${total}`,
    selectedFilters: 'Active filters',
    jumpToMap: 'View on Map',
    noMapData: 'No map coordinates for current results',
    clearOne: 'Clear',
    mapReady: (count: number) => `${count} map-ready`,
  },
  fr: {
    resultCount: (visible: number, total: number) => `${visible} biens correspondants sur ${total}`,
    selectedFilters: 'Filtres actifs',
    jumpToMap: 'Voir sur la carte',
    noMapData: 'Aucune coordonnee disponible pour ces resultats',
    clearOne: 'Retirer',
    mapReady: (count: number) => `${count} avec carte`,
  },
  ar: {
    resultCount: (visible: number, total: number) => `${visible} \u0639\u0642\u0627\u0631 \u0645\u0637\u0627\u0628\u0642 \u0645\u0646 \u0623\u0635\u0644 ${total}`,
    selectedFilters: '\u0627\u0644\u0641\u0644\u0627\u062a\u0631 \u0627\u0644\u0646\u0634\u0637\u0629',
    jumpToMap: '\u0639\u0631\u0636 \u0639\u0644\u0649 \u0627\u0644\u062e\u0631\u064a\u0637\u0629',
    noMapData: '\u0644\u0627 \u062a\u0648\u062c\u062f \u0625\u062d\u062f\u0627\u062b\u064a\u0627\u062a \u0644\u0644\u0646\u062a\u0627\u0626\u062c \u0627\u0644\u062d\u0627\u0644\u064a\u0629',
    clearOne: '\u0625\u0632\u0627\u0644\u0629',
    mapReady: (count: number) => `${count} \u0639\u0642\u0627\u0631 \u0639\u0644\u0649 \u0627\u0644\u062e\u0631\u064a\u0637\u0629`,
  },
} as const;

const hasSaleIntent = (value: string) => {
  const token = value.toLowerCase();
  return (
    token.includes('sale') ||
    token.includes('sell') ||
    token.includes('buy') ||
    token.includes('achat') ||
    token.includes('vente') ||
    token.includes('\u0628\u064a\u0639') ||
    token.includes('\u0644\u0644\u0628\u064a\u0639') ||
    token.includes('\u0634\u0631\u0627\u0621')
  );
};

const normalize = (value: string) => value.trim().toLowerCase();

const hasAnyToken = (value: string, tokens: string[]) => {
  const token = normalize(value);
  return tokens.some((entry) => token.includes(entry));
};

const isTypeKey = (key: string) => hasAnyToken(key, ['type', 'category']);
const isBedroomsKey = (key: string) => hasAnyToken(key, ['bed']);
const isAreaKey = (key: string) => hasAnyToken(key, ['area', 'location', 'district', 'city', 'region']);
const isPriceKey = (key: string) => hasAnyToken(key, ['price', 'budget']);

const uniqueStrings = (values: string[]) => {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const rawValue of values) {
    const value = rawValue.trim();

    if (!value) {
      continue;
    }

    const token = normalize(value);

    if (seen.has(token)) {
      continue;
    }

    seen.add(token);
    result.push(value);
  }

  return result;
};

const parseLooseNumber = (value: string) => {
  const compact = value.trim().replace(/\s+/g, '');

  if (!compact) return null;

  let normalized = compact;
  const hasComma = normalized.includes(',');
  const hasDot = normalized.includes('.');

  if (hasComma && hasDot) {
    if (normalized.lastIndexOf('.') > normalized.lastIndexOf(',')) {
      normalized = normalized.replace(/,/g, '');
    } else {
      normalized = normalized.replace(/\./g, '').replace(',', '.');
    }
  } else if (hasComma) {
    const commaCount = (normalized.match(/,/g) ?? []).length;
    if (commaCount > 1) {
      normalized = normalized.replace(/,/g, '');
    } else {
      const decimalPart = normalized.split(',')[1] ?? '';
      normalized = decimalPart.length === 3 ? normalized.replace(',', '') : normalized.replace(',', '.');
    }
  } else if (hasDot) {
    const dotCount = (normalized.match(/\./g) ?? []).length;
    if (dotCount > 1) {
      normalized = normalized.replace(/\./g, '');
    }
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

const resolvePriceAed = (property: PropertyContent) => {
  if (typeof property.priceAed === 'number' && Number.isFinite(property.priceAed) && property.priceAed > 0) {
    return property.priceAed;
  }

  const numberMatch = property.price.match(/[0-9][0-9.,]*/);
  if (!numberMatch) return null;

  return parseLooseNumber(numberMatch[0]);
};

const roundToNiceAmount = (value: number) => {
  if (value <= 0) return 0;

  const magnitude = Math.pow(10, Math.max(0, Math.floor(Math.log10(value)) - 1));
  return Math.round(value / magnitude) * magnitude;
};

const formatAmount = (value: number) => {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value);
};

const derivePriceOptions = (properties: PropertyContent[], currency: CurrencyCode) => {
  const convertedPrices = properties
    .map((property) => resolvePriceAed(property))
    .filter((value): value is number => typeof value === 'number' && Number.isFinite(value) && value > 0)
    .map((amountAed) => convertFromAed(amountAed, currency))
    .sort((a, b) => a - b);

  if (convertedPrices.length === 0) {
    return [];
  }

  const min = roundToNiceAmount(convertedPrices[0]);
  const max = roundToNiceAmount(convertedPrices[convertedPrices.length - 1]);

  if (max <= min) {
    return [`${formatAmount(min)}+ ${currency}`];
  }

  const q1 = roundToNiceAmount(convertedPrices[Math.floor((convertedPrices.length - 1) * 0.33)]);
  const q2 = roundToNiceAmount(convertedPrices[Math.floor((convertedPrices.length - 1) * 0.66)]);

  const boundaries = [min, q1, q2, max]
    .map((value) => Math.max(0, Math.round(value)))
    .sort((a, b) => a - b)
    .filter((value, index, array) => index === 0 || value !== array[index - 1]);

  if (boundaries.length === 1) {
    return [`${formatAmount(boundaries[0])}+ ${currency}`];
  }

  if (boundaries.length === 2) {
    return [`${formatAmount(boundaries[0])} - ${formatAmount(boundaries[1])} ${currency}`];
  }

  const options: string[] = [];

  for (let index = 0; index < boundaries.length - 2; index += 1) {
    options.push(`${formatAmount(boundaries[index])} - ${formatAmount(boundaries[index + 1])} ${currency}`);
  }

  options.push(`${formatAmount(boundaries[boundaries.length - 2])}+ ${currency}`);

  return options;
};

interface SearchPanelProps {
  content: HomePageContent;
  properties: PropertyContent[];
  filters: PropertyFilterCriteria;
  onFiltersChange: (next: PropertyFilterCriteria) => void;
}

const SearchPanel = ({ content, properties, filters, onFiltersChange }: SearchPanelProps) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const { currency } = useCurrency();
  const { locale } = useLocale();
  const copy = uiCopy[locale];

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        panelRef.current,
        {
          opacity: 0,
          y: 60,
          rotateX: -15,
          transformPerspective: 1000,
        },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: panelRef.current,
            start: 'top 90%',
            toggleActions: 'play none none none',
          },
        }
      );
    }, panelRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (panelRef.current && !panelRef.current.contains(target)) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const tabs = useMemo(() => {
    const baseTabs = content.searchTabs.length > 0 ? content.searchTabs : [{ id: 'sales', label: copy.saleTab }];

    const saleTabs = baseTabs.filter((tab) => hasSaleIntent(tab.id) || hasSaleIntent(tab.label));
    return saleTabs.length > 0 ? saleTabs : [{ id: 'sales', label: copy.saleTab }];
  }, [content.searchTabs, copy.saleTab]);

  const searchFilters = useMemo(() => {
    const filterTemplates = content.searchFilters;
    const hasPropertyData = properties.length > 0;

    const resolveTemplate = (matcher: (key: string) => boolean, fallback: SearchFilter): SearchFilter => {
      return filterTemplates.find((item) => matcher(item.key)) ?? fallback;
    };

    const typeTemplate = resolveTemplate(isTypeKey, {
      key: 'type',
      label: copy.searchPropertyType,
      icon: 'home',
      options: [],
    });

    const bedroomsTemplate = resolveTemplate(isBedroomsKey, {
      key: 'bedrooms',
      label: copy.searchBedrooms,
      icon: 'bed',
      options: [],
    });

    const areaTemplate = resolveTemplate(isAreaKey, {
      key: 'area',
      label: copy.searchArea,
      icon: 'map-pin',
      options: [],
    });

    const priceTemplate = resolveTemplate(isPriceKey, {
      key: 'price',
      label: copy.searchPrice,
      icon: 'coins',
      options: [],
    });

    const typeOptions = uniqueStrings(
      properties.map((property) => localizePropertyType(getReellyStylePropertyType(property), locale))
    ).sort((a, b) => a.localeCompare(b, locale));

    const bedroomOptions = uniqueStrings(
      Array.from(
        new Set(
          properties
            .map((property) => getReellyStyleBedrooms(property))
                        .filter((value): value is number => typeof value === 'number' && Number.isFinite(value) && value >= 0)
                        .map((value) => {
              if (value === 0) return copy.studio;
              if (value >= 5) {
                if (locale === 'fr') return '5+ Chambres';
                if (locale === 'ar') return '5+ \u063a\u0631\u0641 \u0646\u0648\u0645';
                return '5+ Bedrooms';
              }

              if (locale === 'fr') return `${value} Chambre${value > 1 ? 's' : ''}`;
              if (locale === 'ar') return `${value} \u063a\u0631\u0641\u0629 \u0646\u0648\u0645`;
              return `${value} Bedroom${value > 1 ? 's' : ''}`;
            })
        )
      )
    ).sort((a, b) => {
      const rank = (label: string) => {
        const normalized = label.toLowerCase();
        if (normalized.includes('studio')) return 0;
        const match = normalized.match(/\d+/);
        if (!match) return 999;
        const value = Number(match[0]);
        if (!Number.isFinite(value)) return 999;
        if (normalized.includes('+')) return value + 100;
        return value;
      };

      return rank(a) - rank(b);
    });

    const areaOptions = uniqueStrings(properties.map((property) => property.location)).sort((a, b) =>
      a.localeCompare(b, locale)
    );

    const priceOptions = derivePriceOptions(properties, currency);

    const fromDataOrFallback = (template: SearchFilter, options: string[]): SearchFilter => {
      return {
        ...template,
        options: hasPropertyData ? options : template.options,
      };
    };

    return [
      fromDataOrFallback(typeTemplate, typeOptions),
      fromDataOrFallback(bedroomsTemplate, bedroomOptions),
      fromDataOrFallback(areaTemplate, areaOptions),
      fromDataOrFallback(priceTemplate, priceOptions),
    ].filter((filter) => filter.options.length > 0 || !hasPropertyData);
  }, [
    content.searchFilters,
    currency,
    properties,
    copy.searchArea,
    copy.searchBedrooms,
    copy.searchPrice,
    copy.searchPropertyType,
    copy.studio,
    locale,
  ]);

  const defaultTab = useMemo(() => {
    const salesTab = tabs.find((tab) => hasSaleIntent(tab.id) || hasSaleIntent(tab.label));
    return salesTab?.id ?? tabs[0]?.id ?? 'sales';
  }, [tabs]);

  useEffect(() => {
    if (tabs.length === 0) return;

    const hasCurrentTab = tabs.some((tab) => tab.id === filters.activeTab);
    if (!hasCurrentTab) {
      onFiltersChange({
        activeTab: defaultTab,
        selectedOptions: filters.selectedOptions,
      });
    }
  }, [defaultTab, filters.activeTab, filters.selectedOptions, onFiltersChange, tabs]);

  useEffect(() => {
    if (searchFilters.length === 0) return;

    const optionMap = new Map(searchFilters.map((filter) => [filter.key, new Set(filter.options)]));
    const nextSelectedOptions: Record<string, string> = {};

    let hasChanges = false;

    for (const [key, option] of Object.entries(filters.selectedOptions)) {
      const validOptions = optionMap.get(key);

      if (validOptions && validOptions.has(option)) {
        nextSelectedOptions[key] = option;
        continue;
      }

      hasChanges = true;
    }

    if (hasChanges) {
      onFiltersChange({
        activeTab: filters.activeTab,
        selectedOptions: nextSelectedOptions,
      });
    }
  }, [filters.activeTab, filters.selectedOptions, onFiltersChange, searchFilters]);

  const hasSelections = Object.keys(filters.selectedOptions).length > 0;

  const filteredProperties = useMemo(() => {
    return filterProperties(properties, filters);
  }, [properties, filters]);

  const mappableCount = useMemo(() => {
    return filteredProperties.filter(
      (property) =>
        typeof property.latitude === 'number' &&
        Number.isFinite(property.latitude) &&
        typeof property.longitude === 'number' &&
        Number.isFinite(property.longitude)
    ).length;
  }, [filteredProperties]);

  const selectedFilterEntries = useMemo(() => {
    const labelsByKey = new Map(searchFilters.map((filter) => [filter.key, filter.label]));

    return Object.entries(filters.selectedOptions).map(([key, value]) => ({
      key,
      value,
      label: labelsByKey.get(key) ?? key,
    }));
  }, [filters.selectedOptions, searchFilters]);

  const setActiveTab = (tabId: string) => {
    onFiltersChange({
      activeTab: tabId,
      selectedOptions: filters.selectedOptions,
    });
  };

  const setFilterOption = (key: string, option: string) => {
    const nextSelected = { ...filters.selectedOptions };

    if (nextSelected[key] === option) {
      delete nextSelected[key];
    } else {
      nextSelected[key] = option;
    }

    onFiltersChange({
      activeTab: filters.activeTab,
      selectedOptions: nextSelected,
    });

    setOpenDropdown(null);
  };

  const resetFilters = () => {
    onFiltersChange({
      activeTab: defaultTab,
      selectedOptions: {},
    });
    setOpenDropdown(null);
  };

  const scrollToListing = () => {
    document.getElementById('acheter')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const scrollToMap = () => {
    document.getElementById('listing-map')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section className="relative z-20 -mt-20 section-padding pb-16">
      <div
        ref={panelRef}
        className="glass-card rounded-2xl p-6 md:p-10 shadow-[0_25px_80px_rgba(0,0,0,0.5)]"
        style={{ transformStyle: 'preserve-3d' }}
      >
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-[#2d2d2d] rounded-full p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-6 py-2 text-sm font-medium rounded-full transition-all duration-300 ${
                  filters.activeTab === tab.id ? 'text-[#0a0a0a]' : 'text-white/70 hover:text-white'
                }`}
              >
                {filters.activeTab === tab.id && <span className="absolute inset-0 bg-[#d4a853] rounded-full transition-all duration-300" />}
                <span className="relative z-10">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {searchFilters.map((filter) => {
            const Icon = iconMap[filter.icon as keyof typeof iconMap] ?? Home;
            const isOpen = openDropdown === filter.key;
            const selectedOption = filters.selectedOptions[filter.key];

            return (
              <div key={filter.key} className="relative">
                <button
                  onClick={() => setOpenDropdown(isOpen ? null : filter.key)}
                  className={`w-full flex items-center justify-between px-4 py-4 bg-[#1a1a1a] border rounded-lg transition-all duration-300 ${
                    isOpen ? 'border-[#d4a853] shadow-[0_0_15px_rgba(212,168,83,0.2)]' : 'border-[#333333] hover:border-[#555555]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon className="w-5 h-5 text-[#d4a853] flex-shrink-0" />
                    <span className={`text-sm truncate ${selectedOption ? 'text-[#d4a853]' : 'text-white/80'}`}>
                      {selectedOption ?? filter.label}
                    </span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-[#888888] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {isOpen && (
                  <div
                    className="absolute top-full left-0 right-0 mt-2 bg-[#1a1a1a] border border-[#333333] rounded-lg overflow-hidden z-50 shadow-xl max-h-72 overflow-y-auto"
                    style={{
                      animation: 'dropdownSlide 0.3s ease-out',
                    }}
                  >
                    {filter.options.map((option, index) => {
                      const isSelected = selectedOption === option;

                      return (
                        <button
                          key={`${filter.key}-${option}`}
                          onClick={() => setFilterOption(filter.key, option)}
                          className={`w-full px-4 py-3 text-left text-sm transition-colors duration-200 ${
                            isSelected ? 'bg-[#2d2d2d] text-[#d4a853]' : 'text-white/80 hover:bg-[#2d2d2d] hover:text-[#d4a853]'
                          }`}
                          style={{
                            animation: `dropdownItem 0.3s ease-out ${index * 0.05}s both`,
                          }}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-[#9a9a9a]">{panelCopy[locale].resultCount(filteredProperties.length, properties.length)}</p>
          <p className="text-xs text-[#7f7f7f]">
            {mappableCount > 0 ? panelCopy[locale].mapReady(mappableCount) : panelCopy[locale].noMapData}
          </p>
        </div>

        {selectedFilterEntries.length > 0 ? (
          <div className="mb-6">
            <p className="text-xs uppercase tracking-wide text-[#a8a8a8] mb-2">{panelCopy[locale].selectedFilters}</p>
            <div className="flex flex-wrap gap-2">
              {selectedFilterEntries.map((entry) => (
                <button
                  key={`${entry.key}-${entry.value}`}
                  onClick={() => setFilterOption(entry.key, entry.value)}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#444] bg-[#1a1a1a] text-[#d4a853] text-xs hover:border-[#d4a853]/60"
                >
                  <span>{entry.label}: {entry.value}</span>
                  <X className="w-3 h-3" />
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <div className="flex flex-col sm:flex-row gap-3">
          <button onClick={scrollToListing} className="flex-1 btn-gold flex items-center justify-center gap-3 group">
            <Search className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
            <span>{content.searchButtonLabel}</span>
          </button>

          <button
            onClick={scrollToMap}
            disabled={mappableCount === 0}
            className={`sm:w-auto px-5 py-3 border rounded-lg text-sm font-medium transition-all duration-300 inline-flex items-center justify-center gap-2 ${
              mappableCount > 0
                ? 'border-[#2f5d8a] text-[#8ec5ff] hover:bg-[#1d2d40]'
                : 'border-[#333333] text-white/30 cursor-not-allowed'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>{panelCopy[locale].jumpToMap}</span>
          </button>

          <button
            onClick={resetFilters}
            className={`sm:w-auto px-5 py-3 border rounded-lg text-sm font-medium transition-all duration-300 ${
              hasSelections ? 'border-[#d4a853] text-[#d4a853] hover:bg-[#d4a853]/10' : 'border-[#333333] text-white/50'
            }`}
          >
            {copy.resetFilters}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes dropdownSlide {
          from {
            opacity: 0;
            transform: translateY(-10px) rotateX(-10deg);
          }
          to {
            opacity: 1;
            transform: translateY(0) rotateX(0);
          }
        }
        @keyframes dropdownItem {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </section>
  );
};

export default SearchPanel;







