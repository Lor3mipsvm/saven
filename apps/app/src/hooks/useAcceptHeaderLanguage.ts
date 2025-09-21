import { SUPPORTED_LANGUAGES } from '@shared/generic-react-hooks'

/**
 * Returns the primary language the user's browser is set to
 *
 * @returns string
 */
export const useAcceptHeaderLanguage = () => {
  // Detect the browser's preferred language
  // @ts-ignore
  const browserLang = navigator.language || navigator.userLanguage
  const supportedLocales = Object.keys(SUPPORTED_LANGUAGES)
  let acceptHeaderLanguage = 'en' // fallback to 'en' if the browser's language is not supported

  if (supportedLocales.includes(browserLang)) {
    acceptHeaderLanguage = browserLang
  }

  return { acceptHeaderLanguage }
}
