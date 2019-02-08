fs = require 'fs'
stringExtractor = require './stringExtractor'

# rootDirs: directories to extract from
# dataFile: e.g. "localizations.json"
# options: 
#  plus: extraStrings which includes extra strings that are not in the root file
exports.updateLocalizationFile = (rootDirs, dataFile, options, callback) ->
  # Read in data file
  if fs.existsSync(dataFile)
    localizations = JSON.parse(fs.readFileSync(dataFile, 'utf-8'))
  else 
    localizations = { }

  # Update localizations
  exports.updateLocalizations rootDirs, localizations, options, ->
    fs.writeFileSync(dataFile, JSON.stringify(localizations, null, 2), 'utf-8')
    callback()

exports.updateLocalizations = (rootDirs, data, options, callback) ->
  if not data.locales
    data.locales = [{ code: "en", name: "English"}]
  if not data.strings
    data.strings = []

  # Get strings
  stringExtractor.findFromRootDirs rootDirs, (strs) ->
    # Add extra strings
    if options.extraStrings
      strs = strs.concat(options.extraStrings)
      
    # Create map of english
    map = {}
    for loc in data.strings
      map[loc.en] = loc

    for str in strs
      # Create item if doesn't exist
      if not map[str]
        string = { _base: "en", en: str }
        for loc in data.locales
          if loc.code != "en"
            string[loc.code] = ""
        data.strings.push string
        map[string.en] = string
      else
        # Add base if not present
        if not map[str]._base
          map[str]._base = "en"          

        # Just add missing languages
        for loc in data.locales
          if loc.code != "en" and not map[str][loc.code]?
            map[str][loc.code] = ""

    # Mark unused
    known = {}
    for str in strs
      known[str] = true

    for item in data.strings
      if not known[item.en]
        item._unused = true
      else
        delete item._unused

    callback()

