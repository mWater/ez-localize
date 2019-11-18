/** Localizes strings. Must be called as T("some string") or someThing.T("some string") */
export type LocalizeString = (str: string, ...args: any[]) => string

/** A single localized string */
export interface LocalizedString {
  /** e.g. "en" */
  _base: string
  /** Localizations in each language */
  [language: string]: string
}

export interface Locale {
  /** ISO code for locale (e.g. "en") */
  code: string

  /** Local name for locale (e.g. Espanol) */
  name: string
}

export interface LocalizerData {
  locales: Locale[]
  strings: LocalizedString[]
}

/** Localizer which has a lookup of translations */
export class Localizer {
  /** Locale defaults to "en" */
  constructor(data: LocalizerData, locale?: string)

  /** Set the current locale */
  setLocale(locale: string): void

  getLocales(): Locale[]

  /** Localize a string */
  T: LocalizeString

  /** Same as T */
  localizeString: LocalizeString

  /** Determines if a string is localized */
  isLocalized(str: string): boolean
}

export const defaultLocalizer: Localizer

/** Create a default T that does nothing */
export const defaultT: LocalizeString