'use client';

import { createContext, useContext, useState, useEffect, startTransition, ReactNode, useCallback } from 'react';
import { Locale, DEFAULT_LOCALE, SUPPORTED_LOCALES } from './i18n';
import { translations } from './translations';

interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

function getTranslation(locale: Locale, key: string): string {
  const parts = key.split('.');
  let current: unknown = translations[locale];
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = (current as Record<string, unknown>)[part];
    } else {
      // Fallback to default locale
      let fallback: unknown = translations[DEFAULT_LOCALE];
      for (const p of parts) {
        if (fallback && typeof fallback === 'object' && p in fallback) {
          fallback = (fallback as Record<string, unknown>)[p];
        } else {
          return key; // Return key if not found
        }
      }
      return typeof fallback === 'string' ? fallback : key;
    }
  }
  return typeof current === 'string' ? current : key;
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    const stored = localStorage.getItem('sellbuy_locale');
    if (stored && SUPPORTED_LOCALES.includes(stored as Locale)) {
      startTransition(() => setLocaleState(stored as Locale));
    }
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('sellbuy_locale', newLocale);
  }, []);

  const t = useCallback((key: string) => getTranslation(locale, key), [locale]);

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    return {
      locale: DEFAULT_LOCALE,
      setLocale: () => {},
      t: (key: string) => getTranslation(DEFAULT_LOCALE, key),
    };
  }
  return context;
}
