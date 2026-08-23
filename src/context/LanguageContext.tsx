import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Lang, strings, StringKey } from "../i18n/strings";

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (k: StringKey) => string;
};

const LanguageContext = createContext<Ctx>({
  lang: "ms",
  setLang: () => {},
  t: (k) => strings.ms[k],
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Lang>("ms");

  useEffect(() => {
    AsyncStorage.getItem("app.lang").then((v) => {
      if (v === "en" || v === "ms") setLangState(v);
    });
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    AsyncStorage.setItem("app.lang", l);
  };

  const t = (k: StringKey) => strings[lang][k] ?? strings.ms[k];

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>{children}</LanguageContext.Provider>
  );
};

export const useLang = () => useContext(LanguageContext);
