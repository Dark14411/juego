import { useTranslation } from 'react-i18next'
import { useEffect } from 'react'

export const useTranslations = () => {
  const { t, i18n } = useTranslation()

  // Función para cambiar idioma
  const changeLanguage = (language: string) => {
    i18n.changeLanguage(language)
    // Guardar preferencia en localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('preferredLanguage', language)
    }
  }

  // Función para obtener idioma actual
  const getCurrentLanguage = () => {
    return i18n.language
  }

  // Función para obtener idiomas disponibles
  const getAvailableLanguages = () => {
    return [
      { code: 'es', name: 'Español' },
      { code: 'en', name: 'English' }
    ]
  }

  // Inicializar idioma desde localStorage al cargar
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('preferredLanguage')
      if (savedLanguage && i18n.language !== savedLanguage) {
        i18n.changeLanguage(savedLanguage)
      }
    }
  }, [i18n])

  return {
    t,
    changeLanguage,
    getCurrentLanguage,
    getAvailableLanguages,
    currentLanguage: i18n.language
  }
} 