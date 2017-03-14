# Localizer is a function that sets up global variable "T" which is 
# used to translate strings. Also sets up Handlebars helper with same name
# Function "T" maps to Localizer "localizeString" function
# Helper "T" maps to Localizer "localizeString" function

module.exports = class Localizer
  constructor: (data, locale = "en") ->
    @data = data
    @locale = locale

    # Index strings by English if data present
    @englishMap = {}
    if data?
      for str in @data.strings
        @englishMap[str.en] = str

  setLocale: (code) ->
    @locale = code

  getLocales: ->
    return @data.locales

  T: (str, args...) =>
    return @localizeString.apply(this, arguments)

  localizeString: (str, args...) =>
    # Null is just pass-through
    if not str?
      return str
      
    # True if object passed in as arg (react style)
    hasObject = false

    for arg in args
      if arg and typeof(arg) == "object"
        hasObject = true

    if not hasObject
      return @localizePlainString(str, args...)
    else
      # Split and do react-style replacement where string is made into array
      parts = str.split(/(\{\d+\})/)

      output = []
      for part in parts
        if part.match(/^\{\d+\}$/)
          output.push(args[parseInt(part.substr(1, part.length - 2))])
        else
          output.push(part)
      
      return output

  # Localizes a plain string without React-style interpretation. Needed for handlebars as it passes extra arguments
  localizePlainString: (str, args...) =>
    # Find string, falling back to English
    item = @englishMap[str]
    if item and item[@locale]
      locstr = item[@locale]
    else 
      locstr = str

    # Fill in arguments
    for i in [0...args.length]
      locstr = locstr.replace("{" + i + "}", args[i])
    return locstr

  # Determines if a string is localized
  isLocalized: (str) =>
    return str and @englishMap[str] and @englishMap[str][@locale]

  # Makes this localizer global. handlebars is instance to register
  # helper on, null for none
  makeGlobal: (handlebars) ->
    global.T = @localizeString
    global.T.localizer = this
    if handlebars?
      handlebars.registerHelper 'T', @localizePlainString
