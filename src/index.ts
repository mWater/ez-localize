import Localizer from './Localizer'
import { LocalizedString, Locale } from './utils'

export { LocalizedString, Locale }

export interface LocalizerData {
  locales: Locale[]
  strings: LocalizedString[]
}

export { default as Localizer } from './Localizer'

/** Function to localize a string */
export type LocalizeString = (str: string, ...args: any[]) => string

// Create default localizer
var defaultLocalizer = new Localizer({ locales: [{ code: "en", name: "English" }], strings: [] })

/** Create a default T that does nothing */
export const defaultT: LocalizeString = defaultLocalizer.T

// Support for non-ES6
export default { Localizer, defaultT } 