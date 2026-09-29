import { useSyncExternalStore } from 'react';
import { getDirection, getLanguage, setLanguage, subscribeLanguage, t } from './index';

/** React binding for the language store: re-renders the component when the language changes. */
export function useLanguage() {
  const language = useSyncExternalStore(subscribeLanguage, getLanguage);
  return { language, dir: getDirection(language), t, setLanguage };
}
