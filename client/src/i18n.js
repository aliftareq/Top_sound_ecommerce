import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import enCommon from "./locales/en/common.json";
import bnCommon from "./locales/bn/common.json";

// load saved lang or default
const savedLang = localStorage.getItem("lang") || "bn";

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: enCommon },
    bn: { translation: bnCommon }
  },
  lng: savedLang,
  fallbackLng: "bn",
  interpolation: { escapeValue: false }
});

export default i18n;
