'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Lang = 'ar' | 'fr';

interface LangContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  dir: 'rtl' | 'ltr';
}

const LangContext = createContext<LangContextType>({ lang: 'ar', setLang: () => {}, dir: 'rtl' });

export function useLang() {
  return useContext(LangContext);
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('ar');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('lang') as Lang;
    if (saved === 'ar' || saved === 'fr') {
      setLangState(saved);
    }
  }, []);

  const setLang = (newLang: Lang) => {
    setLangState(newLang);
    localStorage.setItem('lang', newLang);
  };

  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <LangContext.Provider value={{ lang, setLang, dir }}>
      <div dir={dir} className="min-h-full">
        {children}
      </div>
    </LangContext.Provider>
  );
}