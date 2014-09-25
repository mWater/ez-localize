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
  xlsxMap = {}
  jsonMap = {}
  localizations = JSON.parse(fs.readFileSync(oldDataFile, 'utf-8'))
  jsonLocales = []
  for locale in localizations.locales
    jsonLocales.push locale.code
    xlsxMap[locale.code] = {}
    jsonMap[locale.code] = {}
    if xlsxLocales.indexOf(locale.code) < 0
      throw new Error('Could not find locale: ' + locale + ' in xlsx file.')

  # Make sure the number of locales are the same
  if jsonLocales.length != xlsxLocales.length
    throw new Error('not the same number of locales')

  # Indexing the xlsx key string (making sure there is no doubles)
  for row in rows[1..]
    base = row[0].value
    keyString = row[xlsxLocales.indexOf(base) + 1].value
    if xlsxMap[base][keyString]?
      throw new Error('XLSX: Twice the same word using the same base: ' + base + ' word: ' + keyString)
    xlsxMap[base][keyString] = row

  # Indexing the localizations strings (making sure there is no doubles)
  for stringData in localizations.strings
    base = stringData._base
    keyString = stringData[base]
    if jsonMap[base][keyString]?
      throw new Error('JSON: Twice the same word using the same base: ' + base + ' word: ' + keyString)
    jsonMap[base][keyString] = stringData

  # For each xlsx entry
  for row in rows[1..]
    # Look up the reference string
    base = row[0].value
    xlsxString = row[xlsxLocales.indexOf(base) + 1].value

    jsonEntry = jsonMap[base][xlsxString]
    if jsonEntry
      for locale, i in xlsxLocales
        # Add the new localized string
        jsonEntry[locale] = row[i + 1]
    else
      throw new Error('Could not find reference string: ' + xlsxString + ' using base: ' + base)

  # Write the whole thing to a JSon file
  fs.writeFile(newDataFile, JSON.stringify(localizations, null, 2), 'utf-8', callback(localizations))

dataFile = process.argv[2]
xlsxFile = process.argv[3]
newDataFile = process.argv[4]

module.exports = importLocalizationFileFromXlsx