import { Locale, LocalizedString, LocalizerData, LocalizeString } from "."

/**
 * Localizer is a function that sets up global variable "T" which is
 * used to translate strings. Also sets up Handlebars helper with same name
 * Function "T" maps to Localizer "localizeString" function
 * Helper "T" maps to Localizer "localizeString" function
 */
export default class Localizer {
  data: LocalizerData

  /** Current locale */
  locale: string

  englishMap: { [english: string]: LocalizedString }

  T: LocalizeString

  /** Locale defaults to "en" */
  constructor(data: LocalizerData, locale?: string) {
    this.data = data
    this.locale = locale || "en"

    // Index strings by English if data present
    this.englishMap = {}
    if (data != null) {
      for (let str of this.data.strings) {
        this.englishMap[str.en] = str
      }
    }

    const localizer = this

    Object.defineProperty(this.localizeString, "locale", { get() { return localizer.locale }})
    Object.defineProperty(this.localizeString, "localizer", { get() { return localizer }})
    this.T = this.localizeString as LocalizeString
  }

  /** Set the current locale */
  setLocale(locale: string): void {
    this.locale = locale
  }

  getLocales(): Locale[] {
    return this.data.locales
  }

  /** 
   * Localize a single string of the form "some text {0} more text {1} etc", replacing the 
   * parts with the arguments.
   * 
   * Can also replace where the first parameter is an array for ES6 tagged templates.
   * 
   * Can also localize to a specified locale with LocalizationRequest.
   */
  localizeString = (str: TemplateStringsArray | LocalizedString | LocalizationRequest | string | null | undefined, ...args: any[]): string | null => {
    // Null is just pass-through
    if (str == null) {
      return str ?? null
    }

    // Handle localization request
    if (typeof str === "object" && (str as LocalizationRequest).locale) {
      return this.localizeStringRequest(str as LocalizationRequest)
    }

    // Handle localized string
    if (typeof str === "object" && !Array.isArray(str) && (str as LocalizedString)._base) {
      // Get localized string
      const locStr = (str as LocalizedString)[this.locale] || (str as LocalizedString).en
      return this.localizeString(locStr, ...args)
    }

    // True if object passed in as arg (react style)
    let hasObject = args.some(arg => arg && typeof arg === "object")

    // Handle ES6-style
    if (Array.isArray(str)) {
      // Change to format of standard localizer string
      let newStr = str[0]
      for (let i = 1 ; i < str.length ; i++) {
        newStr += "{" + (i - 1) + "}"
        newStr += str[i]
      }
      str = newStr
    }

    if (!hasObject) {
      return this.localizeStringRequest({ locale: this.locale, text: str as string, args })
    } else {
      // Find string, falling back to English
      let locstr
      const item = this.englishMap[str as string]
      if (item && item[this.locale]) {
        locstr = item[this.locale]
      } else {
        locstr = str as string
      }

      // Split and do react-style replacement where string is made into array
      const parts = locstr.split(/(\{\d+\})/)

      const output = []
      for (let part of parts) {
        if (part.match(/^\{\d+\}$/)) {
          output.push(args[parseInt(part.substr(1, part.length - 2))])
        } else {
          output.push(part)
        }
      }

      console.error("DEPRECATED: Localizer.localizeString called with object argument")
      console.trace()
      return (output as unknown) as string
    }
  }

  /** 
   * Localizes a plain string without React-style interpretation. Needed for handlebars as it passes extra arguments
   */
  localizePlainString = (str: any, ...args: any[]) => {
    return this.localizeStringRequest({ locale: this.locale, text: str, args })
  }

  /**
   * Localizes a string based on a localization request.
   */
  private localizeStringRequest(request: LocalizationRequest): string | null {
    let { locale, text, args } = request

    if (text == null) {
      return null
    }

    let textStr: string

    if (typeof text === "object" && (text as LocalizedString)._base) {
      // Get localized string
      const localizedStr = (text as LocalizedString)[locale ?? this.locale] ?? (text as LocalizedString).en
      if (localizedStr == null) {
        return null
      }
      textStr = localizedStr
    } else {
      textStr = text as string
    }

    // Find string, falling back to English
    let locstr: string

    const item = this.englishMap[textStr]
    if (item && item[locale ?? this.locale]) {
      locstr = item[locale ?? this.locale]
    } else {
      locstr = textStr
    }

    // Fill in arguments
    if (args) {
      for (let i = 0; i < args.length ; i++) {
        locstr = locstr.replace("{" + i + "}", args[i])
      }
    }
    return locstr
  }


  /** Determines if a string is localized */
  isLocalized(str: string): boolean {
    return str != null && this.englishMap[str] != null && this.englishMap[str][this.locale] != null
  }

  // Makes this localizer global. handlebars is instance to register
  // helper on, null for none
  makeGlobal(handlebars: any) {
    (global as any).T = this.T;
    if (handlebars != null) {
      handlebars.registerHelper("T", this.localizePlainString)
    }
  }
}

/**
 * Localization request
 */
export interface LocalizationRequest {
  /** Locale to localize to. e.g. "en" or "fr". Default is current locale. */
  locale?: string
  /** Text to localize in format of "some text {0} more text {1} etc" */
  text: string | LocalizedString | null | undefined
  /** Arguments to substitute into the localized string */
  args?: any[]
}