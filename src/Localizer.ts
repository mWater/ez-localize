// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
// Localizer is a function that sets up global variable "T" which is
// used to translate strings. Also sets up Handlebars helper with same name
// Function "T" maps to Localizer "localizeString" function
// Helper "T" maps to Localizer "localizeString" function

let Localizer

export default Localizer = class Localizer {
  constructor(data: any, locale = "en") {
    this.T = this.T.bind(this)
    this.data = data
    this.locale = locale

    // Index strings by English if data present
    this.englishMap = {}
    if (data != null) {
      for (let str of this.data.strings) {
        this.englishMap[str.en] = str
      }
    }
  }

  setLocale(code: any) {
    return (this.locale = code)
  }

  getLocales() {
    return this.data.locales
  }

  T(str: any, ...args: any[]) {
    return this.localizeString.apply(this, arguments)
  }

  localizeString = (str: any, ...args: any[]) => {
    // Null is just pass-through
    if (str == null) {
      return str
    }

    // True if object passed in as arg (react style)
    let hasObject = false

    for (let arg of args) {
      if (arg && typeof arg === "object") {
        hasObject = true
      }
    }

    if (!hasObject) {
      return this.localizePlainString(str, ...args)
    } else {
      // Find string, falling back to English
      let locstr
      const item = this.englishMap[str]
      if (item && item[this.locale]) {
        locstr = item[this.locale]
      } else {
        locstr = str
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

      return output
    }
  }

  // Localizes a plain string without React-style interpretation. Needed for handlebars as it passes extra arguments
  localizePlainString = (str: any, ...args: any[]) => {
    // Find string, falling back to English
    let locstr
    const item = this.englishMap[str]
    if (item && item[this.locale]) {
      locstr = item[this.locale]
    } else {
      locstr = str
    }

    // Fill in arguments
    for (let i = 0, end = args.length, asc = 0 <= end; asc ? i < end : i > end; asc ? i++ : i--) {
      locstr = locstr.replace("{" + i + "}", args[i])
    }
    return locstr
  }

  // Determines if a string is localized
  isLocalized = (str: any) => {
    return str && this.englishMap[str] && this.englishMap[str][this.locale]
  }

  // Makes this localizer global. handlebars is instance to register
  // helper on, null for none
  makeGlobal(handlebars: any) {
    global.T = this.localizeString
    global.T.localizer = this
    if (handlebars != null) {
      return handlebars.registerHelper("T", this.localizePlainString)
    }
  }
}
