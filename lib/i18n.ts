import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

// Importar traducciones
import es from '../public/locales/es/common.json'
import en from '../public/locales/en/common.json'

const resources = {
  es: {
    common: es,
  },
  en: {
    common: en,
  },
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'es', // idioma por defecto
    fallbackLng: 'es',
    interpolation: {
      escapeValue: false,
    },
    defaultNS: 'common',
  })

export default i18n 