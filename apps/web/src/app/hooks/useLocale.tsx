import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { DEFAULT_LANG, type Lang, translations, t } from '../lib/i18n';

interface LocaleContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: keyof typeof translations['en']) => string;
}

const LocaleContext = createContext<LocaleContextValue>({
  lang: DEFAULT_LANG,
  setLang: () => undefined,
  t: (key) => key,
});

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>(DEFAULT_LANG);

  useEffect(() => {
    const stored = window.localStorage.getItem('swift-support-lang') as Lang | null;
    if (stored === 'he' || stored === 'en') {
      setLang(stored);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem('swift-support-lang', lang);
  }, [lang]);

  const value = useMemo(
    () => ({
      lang,
      setLang,
      t: (key: keyof typeof translations['en']) => t(lang, key),
    }),
    [lang],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  return useContext(LocaleContext);
}
