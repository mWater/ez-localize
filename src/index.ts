import Localizer, { LocalizationRequest } from './Localizer'
import { LocalizedString, Locale } from './utils'

export { LocalizedString, Locale }

export interface LocalizerData {
  locales: Locale[]
  strings: LocalizedString[]

  /** Base strings that are unused. They are still included in strings, but are not exported  */
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

/** Remove unused strings from a LocalizerData object */
export function removeUnusedStrings(data: LocalizerData): LocalizerData {
  const unused: Record<string, boolean> = {}
  for (const str of data.unused || []) {
    unused[str] = true
  }

  return {
    ...data,
    strings: data.strings.filter(str => !unused[str[str._base]]),
    unused: []
  }
}
