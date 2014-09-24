fs = require 'fs'
xlsx = require 'xlsx.js'


# oldDataFile: e.g. "localizations.json"
# xlsxFile: path of file to export
# newDataFile: can be the same as oldDataFile (different when testing)
importLocalizationFileFromXlsx = (oldDataFile, xlsxFile, newDataFile, callback) ->
  # Read the xlsx file and get the locales
  base64File = fs.readFileSync(xlsxFile, 'base64');
  xlsxData = xlsx(base64File)

  # Get the rows
  worksheet = xlsxData.worksheets[0]
  rows = worksheet.data

  xlsxLocales = []
  firstRow = rows[0]
  for locale in firstRow[1..]
    xlsxLocales.push locale.value

  # Read the oldDataFile and index all the entries using the referenceLocale
  map = {}
  localizations = JSON.parse(fs.readFileSync(oldDataFile, 'utf-8'))
  jsonLocales = []
  for locale in localizations.locales
    jsonLocales.push locale.code
    map[locale.code] = {}

  # Should compare both locales to make sure they match!

  # Indexing the string with correct locales
  for string in localizations.strings
    base = string._base
    map[base][string[base]] = string

  # For each xlsx entry
  # Should index the xlsx strings instead, that way it would be possible to verify that there are no ambiguous keys
  for row in rows[1..]
    # Look up the reference string
    base = row[0].value
    xlsxString = row[xlsxLocales.indexOf(base) + 1].value

    jsonEntry = map[base][xlsxString]
    if jsonEntry
      for locale, i in xlsxLocales
        # Add the new localized string
        jsonEntry[locale] = row[i + 1]
    else
      throw new Error('Could not find reference string: ' + xlsxString + ' using base: ' + base)

  # Write the whole thing to a JSon file
  fs.writeFile(newDataFile, JSON.stringify(localizations, null, 2), 'utf-8', callback)

dataFile = process.argv[2]
xlsxFile = process.argv[3]
newDataFile = process.argv[4]

module.exports = importLocalizationFileFromXlsx