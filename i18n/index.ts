import { translations, TranslationKey } from './translations';

export type { TranslationKey };

export type Language = 'ar' | 'en';

/** A value provided in every supported language (e.g. question text). */
export type Localized<T> = Record<Language, T>;

export const LANGUAGES: { code: Language; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'ar', label: 'العربية' },
];

const STORAGE_KEY = 'language';

function isLanguage(value: unknown): value is Language {
  return value === 'ar' || value === 'en';
}

/** Saved choice first; otherwise follow the browser (Arabic browsers get Arabic, everyone else English). */
function detectInitialLanguage(): Language {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (isLanguage(saved)) return saved;
  } catch {
    // storage unavailable (private mode etc.)
  }
  const browserLang = typeof navigator !== 'undefined' ? navigator.language : '';
  return browserLang.toLowerCase().startsWith('ar') ? 'ar' : 'en';
}

let currentLanguage: Language = detectInitialLanguage();
const listeners = new Set<() => void>();

// Only `lang` is set globally; each UI screen sets its own `dir` so the Phaser canvas is unaffected.
function applyToDocument() {
  if (typeof document === 'undefined') return;
  document.documentElement.lang = currentLanguage;
}
applyToDocument();

export function getLanguage(): Language {
  return currentLanguage;
}

export function getDirection(lang: Language = currentLanguage): 'rtl' | 'ltr' {
  return lang === 'ar' ? 'rtl' : 'ltr';
}

export function setLanguage(lang: Language) {
  if (lang === currentLanguage) return;
  currentLanguage = lang;
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // ignore
  }
  applyToDocument();
  listeners.forEach((listener) => listener());
}

/** Subscribe to language changes. Returns an unsubscribe function. */
export function subscribeLanguage(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Translate a key into the current language, filling {placeholders} from params. */
export function t(key: TranslationKey, params?: Record<string, string | number>): string {
  const template = translations[currentLanguage][key] ?? translations.ar[key] ?? key;
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in params ? String(params[name]) : match
  );
}

const ARABIC_INDIC_DIGITS = '٠١٢٣٤٥٦٧٨٩';

/** Renders a number with Arabic-Indic digits in Arabic and Western digits in English. */
export function formatDigits(value: number): string {
  const text = String(value);
  if (currentLanguage !== 'ar') return text;
  return text.replace(/[0-9]/g, (d) => ARABIC_INDIC_DIGITS[Number(d)]);
}
