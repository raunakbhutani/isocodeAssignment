"use client";

import { createContext, useContext, useEffect, useMemo, useSyncExternalStore } from "react";
import { translateBuyerText } from "@/lib/buyer-language";

const BuyerLanguageContext = createContext(null);
const STORAGE_KEY = "drivehub-buyer-language";

function subscribeToLanguage(onChange) {
  window.addEventListener("drivehub-language-change", onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener("drivehub-language-change", onChange);
    window.removeEventListener("storage", onChange);
  };
}

function getLanguageSnapshot() {
  return window.localStorage.getItem(STORAGE_KEY) === "hi" ? "hi" : "en";
}

function getServerLanguageSnapshot() {
  return "en";
}

export function BuyerLanguageProvider({ children }) {
  const language = useSyncExternalStore(
    subscribeToLanguage,
    getLanguageSnapshot,
    getServerLanguageSnapshot,
  );
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const value = useMemo(() => ({
    language,
    setLanguage(nextLanguage) {
      if (nextLanguage !== "en" && nextLanguage !== "hi") return;
      window.localStorage.setItem(STORAGE_KEY, nextLanguage);
      window.dispatchEvent(new Event("drivehub-language-change"));
    },
    t(text) {
      return translateBuyerText(text, language);
    },
  }), [language]);

  return <BuyerLanguageContext.Provider value={value}>{children}</BuyerLanguageContext.Provider>;
}

export function useBuyerLanguage() {
  const value = useContext(BuyerLanguageContext);
  if (!value) throw new Error("Buyer language controls must be inside BuyerLanguageProvider.");
  return value;
}

export function BuyerText({ children }) {
  const { t } = useBuyerLanguage();
  return t(children);
}
