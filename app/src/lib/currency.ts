import type { CurrencyCode, Locale } from '@/types/content';

export const currencyOptions: Array<{ value: CurrencyCode; label: CurrencyCode }> = [
  { value: 'AED', label: 'AED' },
  { value: 'USD', label: 'USD' },
  { value: 'EUR', label: 'EUR' },
  { value: 'GBP', label: 'GBP' },
];

export const CURRENCY_RATE_FROM_AED: Record<CurrencyCode, number> = {
  AED: 1,
  USD: 0.2723,
  EUR: 0.2512,
  GBP: 0.2145,
};

const localeFormatMap: Record<Locale, string> = {
  en: 'en-US',
  fr: 'fr-FR',
  ar: 'ar-AE',
};

export const convertFromAed = (amountAed: number, currency: CurrencyCode) => {
  return amountAed * CURRENCY_RATE_FROM_AED[currency];
};

export const convertToAed = (amount: number, currency: CurrencyCode) => {
  const rate = CURRENCY_RATE_FROM_AED[currency];
  if (!rate) return amount;
  return amount / rate;
};

export const formatPriceFromAed = ({
  amountAed,
  currency,
  locale,
  fallback,
}: {
  amountAed: number | null | undefined;
  currency: CurrencyCode;
  locale: Locale;
  fallback: string;
}) => {
  if (typeof amountAed !== 'number' || Number.isNaN(amountAed) || amountAed <= 0) {
    return fallback;
  }

  const amount = convertFromAed(amountAed, currency);

  return new Intl.NumberFormat(localeFormatMap[locale], {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
};
