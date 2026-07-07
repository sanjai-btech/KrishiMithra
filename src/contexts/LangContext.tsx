import { createContext, useContext, useState, type ReactNode } from "react";

type Lang = "en" | "ml";

interface LangContextType {
  lang: Lang;
  toggleLang: () => void;
  t: (en: string, ml: string) => string;
}

const LangContext = createContext<LangContextType>({
  lang: "en",
  toggleLang: () => {},
  t: (en) => en,
});

export const useLang = () => useContext(LangContext);

export const LangProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLang] = useState<Lang>("en");
  const toggleLang = () => setLang((l) => (l === "en" ? "ml" : "en"));
  const t = (en: string, ml: string) => (lang === "en" ? en : ml);

  return (
    <LangContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LangContext.Provider>
  );
};
