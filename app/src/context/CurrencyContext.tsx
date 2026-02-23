import { createContext, useContext, useMemo, useState } from 'react';

import type { CurrencyCode } from '@/types/content';

interface CurrencyContextValue {
  currency: CurrencyCode;
  setCurrency: (nextCurrency: CurrencyCode) => void;
}

const CurrencyContext = createContext<CurrencyContextValue | undefined>(undefined);

const CURRENCY_STORAGE_KEY = 'robins-currency';

const isCurrencyCode = (value: string): value is CurrencyCode => {
  return value === 'AED' || value === 'USD' || value === 'EUR' || value === 'GBP';
};

const resolveInitialCurrency = (): CurrencyCode => {
  if (typeof window === 'undefined') {
    return 'AED';
  }

  const stored = window.localStorage.getItem(CURRENCY_STORAGE_KEY);

  if (stored && isCurrencyCode(stored)) {
    return stored;
  }

  return 'AED';
};

export const CurrencyProvider = ({ children }: { children: React.ReactNode }) => {
  const [currency, setCurrencyState] = useState<CurrencyCode>(resolveInitialCurrency);

  const value = useMemo<CurrencyContextValue>(() => {
    return {
      currency,
      setCurrency: (nextCurrency: CurrencyCode) => {
        setCurrencyState(nextCurrency);
        window.localStorage.setItem(CURRENCY_STORAGE_KEY, nextCurrency);
      },
    };
  }, [currency]);

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);

  if (!context) {
    throw new Error('useCurrency must be used within CurrencyProvider');
  }

  return context;
};
