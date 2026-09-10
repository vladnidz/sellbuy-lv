export const SUPPORTED_LOCALES = ['lv', 'ru', 'en', 'et', 'lt', 'pl', 'de'] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'lv';

export const LOCALE_LABELS: Record<Locale, string> = {
  lv: 'Latviešu',
  ru: 'Русский',
  en: 'English',
  et: 'Eesti',
  lt: 'Lietuvių',
  pl: 'Polski',
  de: 'Deutsch',
};

export const LOCALE_FLAGS: Record<Locale, string> = {
  lv: '🇱🇻',
  ru: '🇷🇺',
  en: '🇬🇧',
  et: '🇪🇪',
  lt: '🇱🇹',
  pl: '🇵🇱',
  de: '🇩🇪',
};
