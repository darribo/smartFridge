import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";

import es from "./locales/es/translation.json";
import gl from "./locales/gl/translation.json";
import en from "./locales/en/translation.json";

const resources = {
  es: { translation: es },
  gl: { translation: gl },
  en: { translation: en },
};

function pickLanguage() {
  const locales = Localization.getLocales();
  const tag = locales?.[0]?.languageTag ?? "en"; //ej: "es-ES", "gl-ES", "en-US"
  const base = tag.split("-")[0].toLowerCase(); //"es" | "gl" | "en"
  return base === "es" || base === "gl" || base === "en" ? base : "es";
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: pickLanguage(),
    fallbackLng: "en",
    interpolation: { escapeValue: false },
  });

export default i18n;
