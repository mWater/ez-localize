fs = require 'fs'
stringExtractor = require './stringExtractor'
xlsx = require 'xlsx.js'

# rootFile: file to walk dependencies from
# dataFile: e.g. "localizations.json"
exports.updateLocalizationFile = (rootFile, dataFile, options, callback) ->
  # Read in data file
  if fs.existsSync(dataFile)
    localizations = JSON.parse(fs.readFileSync(dataFile, 'utf-8'))
  else 
    localizations = { }

  # Update localizations
  exports.updateLocalizations rootFile, localizations, options, ->
    fs.writeFileSync(dataFile, JSON.stringify(localizations, null, 2), 'utf-8')
    callback()

# dataFile: e.g. "localizations.json"
# xlsxFile: path of file to export
# baseLocale: locale used as the reference for translating ("en")
# newLocale: new locale created by the translator
exports.exportLocalizationFileToXlsx = (dataFile, xlsxFile, baseLocale, newLocale, callback) ->
  # Read in data file
  localizations = JSON.parse(fs.readFileSync(dataFile, 'utf-8'))

  #create the xlsx data
  columns = []
  for column in [baseLocale, newLocale]
    columns.push {
      value: column
      formatCode: "General"
    }

  rows = [ columns]
  for string in localizations.strings
    # Add all the base Locale values
    rows.push [{
      value: string[baseLocale]
      formatCode: "General"
    }]

  data = {
    worksheets: [
      {
        name: "Name"
        data: rows
      }
    ]
  }

  fs.writeFile(xlsxFile, xlsx(data).base64, 'base64', callback)

# oldDataFile: e.g. "localizations.json"
# xlsxFile: path of file to export
# newDataFile: can be the same as oldDataFile (different when testing)
exports.importLocalizationFileFromXlsx = (oldDataFile, xlsxFile, newDataFile, callback) ->
  # Read the xlsx file and get the locales
  base64File = fs.readFileSync(xlsxFile, 'base64');
  xlsxData = xlsx(base64File)

  # Get the rows
  worksheet = xlsxData.worksheets[0]
  rows = worksheet.data

  firstRow = rows[0]
  referenceLocale = firstRow[0].value
  newLocale = firstRow[1].value

  # Read the oldDataFile and index all the entries using the referenceLocale
  map = {}
  localizations = JSON.parse(fs.readFileSync(oldDataFile, 'utf-8'))
  for string in localizations.strings
    map[string[referenceLocale]] = string

  # For each xlsx entry
  for row in rows[1..]
    # Look up the reference string
    string = map[row[0].value]
    if string
      # Add the new localized string
      string[newLocale] = row[1].value
    else
      throw new Error('Could not find reference string: ' + row[0].value)

  # Write the whole thing to a JSon file
  fs.writeFile(newDataFile, JSON.stringify(localizations, null, 2), 'utf-8', callback)

exports.updateLocalizations = (rootFile, data, options, callback) ->
  if not data.locales
    data.locales = [{ code: "en", name: "English"}]
  if not data.strings
    data.strings = []

  # Get strings
  stringExtractor.findFromRootFile rootFile, options, (strs) ->
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

