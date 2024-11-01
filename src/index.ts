import Localizer, { LocalizationRequest } from './Localizer'
import { LocalizedString, Locale, removeUnusedStrings, updateLocalizedStrings, mergeLocalizerData } from './utils'

export { LocalizedString, Locale, removeUnusedStrings, updateLocalizedStrings, mergeLocalizerData }

/** Data structure that contains all data for a localizer */
export interface LocalizerData {
  /** List of locales supported by this localization */
  locales: Locale[]

  /** List of strings for this localization */
  strings: LocalizedString[]

  /** Base strings that are unused. They are still included in strings, but are not exported */
  unused?: string[]
}

export { default as Localizer } from './Localizer'

/** Function to localize a string. Usually exposed as "T" */
export type LocalizeString = ((str: TemplateStringsArray | LocalizedString | LocalizationRequest | string | null | undefined, ...args: any[]) => string) & ({ locale: string, localizer: Localizer })

// Create default localizer
var defaultLocalizer = new Localizer({ locales: [{ code: "en", name: "English" }], strings: [] })

/** Create a default T that does nothing */
export const defaultT: LocalizeString = defaultLocalizer.T

// Support for non-ES6
export default { Localizer, defaultT } 

