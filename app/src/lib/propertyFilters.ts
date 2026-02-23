import { convertToAed } from '@/lib/currency';
import type { CurrencyCode, PropertyContent } from '@/types/content';

export interface PropertyFilterCriteria {
  activeTab: string;
  selectedOptions: Record<string, string>;
}

const RENT_KEYWORDS = ['rent', 'rental', 'rentals', 'location', 'louer', 'loyer', '\u0625\u064a\u062c\u0627\u0631', '\u0644\u0644\u0625\u064a\u062c\u0627\u0631', '\u0627\u0633\u062a\u0626\u062c\u0627\u0631'];
const SALE_KEYWORDS = ['sale', 'sales', 'sell', 'buy', 'acheter', 'vente', '\u0628\u064a\u0639', '\u0644\u0644\u0628\u064a\u0639', '\u0634\u0631\u0627\u0621'];

const TYPE_RULES = [
  { label: 'Studio', keywords: [' studio '] },
  { label: 'Penthouse', keywords: ['penthouse'] },
  { label: 'Townhouse', keywords: ['townhouse', 'town house'] },
  { label: 'Villa', keywords: ['villa', 'villas'] },
  { label: 'Duplex', keywords: ['duplex'] },
  { label: 'Mansion', keywords: ['mansion', 'mansions'] },
  { label: 'Hotel Apartment', keywords: ['hotel apartment', 'serviced apartment', 'serviced residence'] },
] as const;
const TYPE_ALIASES = [
  { canonical: 'studio', tokens: ['studio', '\u0627\u0633\u062a\u0648\u062f\u064a\u0648'] },
  { canonical: 'apartment', tokens: ['apartment', 'appartement', '\u0634\u0642\u0629'] },
  { canonical: 'penthouse', tokens: ['penthouse', '\u0628\u0646\u062a\u0647\u0627\u0648\u0633'] },
  { canonical: 'townhouse', tokens: ['townhouse', 'town house', 'maison de ville', '\u062a\u0627\u0648\u0646 \u0647\u0627\u0648\u0633'] },
  { canonical: 'villa', tokens: ['villa', 'villas', '\u0641\u064a\u0644\u0627'] },
  { canonical: 'duplex', tokens: ['duplex', '\u062f\u0648\u0628\u0644\u0643\u0633'] },
  { canonical: 'mansion', tokens: ['mansion', 'mansions', 'manoir', '\u0642\u0635\u0631'] },
  {
    canonical: 'hotel apartment',
    tokens: ['hotel apartment', 'serviced apartment', 'serviced residence', 'appartement hotelier', '\u0634\u0642\u0629 \u0641\u0646\u062f\u0642\u064a\u0629'],
  },
] as const;

const normalize = (value: string) => {
  return ` ${value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()} `;
};

const includesAnyKeyword = (value: string, keywords: string[]) => {
  const normalized = normalize(value);
  return keywords.some((keyword) => normalized.includes(keyword));
};

const includesNormalized = (source: string, target: string) => {
  const sourceNormalized = normalize(source);
  const targetNormalized = normalize(target);

  if (!targetNormalized.trim()) return true;

  return sourceNormalized.includes(targetNormalized);
};

const canonicalizeType = (value: string) => {
  const normalized = normalize(value);

  for (const alias of TYPE_ALIASES) {
    const hasMatch = alias.tokens.some((token) => normalized.includes(normalize(token)));
    if (hasMatch) {
      return alias.canonical;
    }
  }

  return null;
};

const inferModeFromValue = (value: string): 'rent' | 'sale' | null => {
  if (includesAnyKeyword(value, RENT_KEYWORDS)) return 'rent';
  if (includesAnyKeyword(value, SALE_KEYWORDS)) return 'sale';
  return null;
};

const inferPropertyMode = (property: PropertyContent): 'rent' | 'sale' | null => {
  return inferModeFromValue(property.typeLabel);
};

const parseLooseNumber = (value: string) => {
  const compact = value.trim().replace(/\s+/g, '').toUpperCase();
  if (!compact) return null;

  const match = compact.match(/([0-9][0-9.,]*)([KMB])?/);
  if (!match) return null;

  let normalized = match[1];
  const suffix = match[2] ?? '';
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
  if (!Number.isFinite(parsed) || parsed < 0) return null;

  const multiplier = suffix === 'K' ? 1_000 : suffix === 'M' ? 1_000_000 : suffix === 'B' ? 1_000_000_000 : 1;
  return parsed * multiplier;
};

const parsePropertyPriceAed = (property: PropertyContent) => {
  if (typeof property.priceAed === 'number' && Number.isFinite(property.priceAed) && property.priceAed > 0) {
    return property.priceAed;
  }

  const parsedFromText = parseLooseNumber(property.price);
  if (typeof parsedFromText === 'number' && Number.isFinite(parsedFromText) && parsedFromText > 0) {
    return parsedFromText;
  }

  return null;
};

const detectBedroomsFromText = (value: string) => {
  const normalized = normalize(value);

  if (normalized.includes(' studio ') || normalized.includes(' \u0627\u0633\u062a\u0648\u062f\u064a\u0648 ')) {
    return 0;
  }

  const match = normalized.match(/(\d+)\s*(bed|beds|br|bedroom|bedrooms)/);
  if (!match) return null;

  const parsed = Number(match[1]);
  return Number.isFinite(parsed) ? parsed : null;
};

export const getReellyStyleBedrooms = (property: PropertyContent) => {
  if (typeof property.beds === 'number' && Number.isFinite(property.beds) && property.beds >= 0) {
    return property.beds;
  }

  const fromTitle = detectBedroomsFromText(property.title);
  if (fromTitle !== null) return fromTitle;

  const fromType = detectBedroomsFromText(property.typeLabel);
  if (fromType !== null) return fromType;

  return null;
};

export const getReellyStylePropertyType = (property: PropertyContent) => {
  const haystack = `${property.title} ${property.typeLabel}`;
  const normalized = normalize(haystack);

  for (const rule of TYPE_RULES) {
    if (rule.keywords.some((keyword) => normalized.includes(keyword))) {
      return rule.label;
    }
  }

  if (getReellyStyleBedrooms(property) === 0) {
    return 'Studio';
  }

  return 'Apartment';
};

const parseBedrooms = (option: string) => {
  const normalized = normalize(option);

  if (normalized.includes('studio') || normalized.includes('\u0627\u0633\u062a\u0648\u062f\u064a\u0648')) {
    return { min: 0, max: 0 };
  }

  const firstNumber = normalized.match(/\d+/);
  if (!firstNumber) return null;

  const value = Number(firstNumber[0]);
  if (!Number.isFinite(value)) return null;

  if (normalized.includes('+')) {
    return { min: value, max: Number.POSITIVE_INFINITY };
  }

  return { min: value, max: value };
};

const parsePriceRange = (option: string) => {
  const upper = option.toUpperCase();
  const currencyMatch = upper.match(/\b(AED|USD|EUR|GBP)\b/);
  const currency = (currencyMatch?.[1] as CurrencyCode | undefined) ?? 'AED';

  const numbers = (upper.match(/[0-9][0-9.,]*(?:[KMB])?/g) ?? [])
    .map((token) => parseLooseNumber(token))
    .filter((value): value is number => typeof value === 'number' && Number.isFinite(value));

  if (numbers.length === 0) return null;

  if (upper.includes('+')) {
    return {
      minAed: convertToAed(numbers[0], currency),
      maxAed: Number.POSITIVE_INFINITY,
    };
  }

  if (numbers.length === 1) {
    return {
      minAed: convertToAed(numbers[0], currency),
      maxAed: Number.POSITIVE_INFINITY,
    };
  }

  return {
    minAed: convertToAed(Math.min(numbers[0], numbers[1]), currency),
    maxAed: convertToAed(Math.max(numbers[0], numbers[1]), currency),
  };
};

const matchesFilterOption = (property: PropertyContent, key: string, option: string) => {
  const normalizedKey = normalize(key);
  const normalizedOption = normalize(option);

  if (!normalizedOption.trim()) return true;

  if (normalizedKey.includes('bed')) {
    const range = parseBedrooms(option);
    if (!range) return true;

    const propertyBedrooms = getReellyStyleBedrooms(property);
    if (propertyBedrooms === null) return false;

    return propertyBedrooms >= range.min && propertyBedrooms <= range.max;
  }

  if (
    normalizedKey.includes('area') ||
    normalizedKey.includes('location') ||
    normalizedKey.includes('district') ||
    normalizedKey.includes('city') ||
    normalizedKey.includes('region')
  ) {
    return includesNormalized(property.location, option) || includesNormalized(property.title, option);
  }

  if (normalizedKey.includes('price') || normalizedKey.includes('budget')) {
    const amountAed = parsePropertyPriceAed(property);
    const range = parsePriceRange(option);

    if (amountAed === null || !range) return false;

    return amountAed >= range.minAed && amountAed <= range.maxAed;
  }

  if (normalizedKey.includes('status')) {
    return includesNormalized(property.statusLabel, option);
  }

    if (normalizedKey.includes('type') || normalizedKey.includes('category')) {
    const optionType = canonicalizeType(option);

    if (optionType) {
      const propertyType = canonicalizeType(getReellyStylePropertyType(property)) ?? canonicalizeType(property.typeLabel);

      if (propertyType) {
        return propertyType === optionType;
      }
    }

    return includesNormalized(getReellyStylePropertyType(property), option) || includesNormalized(property.typeLabel, option);
  }

  return (
    includesNormalized(property.title, option) ||
    includesNormalized(property.location, option) ||
    includesNormalized(property.typeLabel, option) ||
    includesNormalized(property.statusLabel, option)
  );
};

const matchesActiveTab = (property: PropertyContent, activeTab: string) => {
  const selectedMode = inferModeFromValue(activeTab);
  if (!selectedMode) return true;

  const propertyMode = inferPropertyMode(property);
  if (!propertyMode) return selectedMode === 'sale';

  return selectedMode === propertyMode;
};

export const filterProperties = (properties: PropertyContent[], criteria: PropertyFilterCriteria) => {
  return properties.filter((property) => {
    if (!matchesActiveTab(property, criteria.activeTab)) {
      return false;
    }

    return Object.entries(criteria.selectedOptions).every(([key, option]) => {
      return matchesFilterOption(property, key, option);
    });
  });
};



