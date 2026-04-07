import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import ar from "./ar.json";
import zh from "./zh.json";
import es from "./es.json";
import en from "./en.json";
import fr from "./fr.json";
import de from "./de.json";

i18n.use(initReactI18next).init({
  resources: {
    ar: { translation: ar },
    zh: { translation: zh },
    es: { translation: es },
    en: { translation: en },
    fr: { translation: fr },
    de: { translation: de },
  },

  lng: localStorage.getItem("lang") || "en",
  fallbackLng: "en",

  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
