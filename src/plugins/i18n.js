import { createI18n } from 'vue-i18n'
import { messages, defaultLocale } from '@/locales'

// Obtener el idioma guardado en localStorage o usar el default
const savedLocale = localStorage.getItem('locale') || defaultLocale

const i18n = createI18n({
  legacy: false, // Composition API mode
  locale: savedLocale,
  fallbackLocale: defaultLocale,
  messages,
  globalInjection: true
})

export default i18n
