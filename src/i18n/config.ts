export const locales = ['en', 'ru', 'uz', 'fr', 'es', 'de', 'tr', 'ar', 'zh', 'ja', 'ko', 'pt', 'hi'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

export const rtlLocales: Locale[] = ['ar'];

export const localeNames: Record<Locale, string> = {
  en: 'English',
  ru: 'Русский',
  uz: "O'zbek",
  fr: 'Français',
  es: 'Español',
  de: 'Deutsch',
  tr: 'Türkçe',
  ar: 'العربية',
  zh: '中文',
  ja: '日本語',
  ko: '한국어',
  pt: 'Português',
  hi: 'हिन्दी',
};
