export interface LocalizedString {
  _base: string
  [language: string]: string // Localizations
}

export interface Locale {
  /** ISO code for locale (e.g. "en") */
  code: string

  /** Local name for locale (e.g. Espanol) */
  name: string
}









