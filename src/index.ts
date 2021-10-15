import Localizer from './Localizer'
import { LocalizedString, Locale } from './utils'

export { LocalizedString, Locale }

export interface LocalizerData {
  locales: Locale[]
  strings: LocalizedString[]
}

export { default as Localizer } from './Localizer'

// Create default localizer
var defaultLocalizer = new exports.Localizer()

/** Create a default T that does nothing */
export const defaultT = defaultLocalizer.T

// Support for non-ES6
export default { Localizer, defaultT } 