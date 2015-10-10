fs = require 'fs'
xlsx = require 'xlsx.js'
_ = require 'lodash'

# oldDataFile: e.g. "localizations.json"
# xlsxFile: path of file to export
# newDataFile: can be the same as oldDataFile (different when testing)
module.exports = (oldDataFile, xlsxFile, newDataFile) ->
  # Read the xlsx file and get the locales
  base64File = fs.readFileSync(xlsxFile, 'base64')
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

  # Indexing the xlsx key string (making sure there is no doubles)
  for row in rows[1..]
    if not row[0] or not row[0].value
      continue
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
    if not row[0] or not row[0].value
      continue
    # Look up the reference string
    base = row[0].value
    xlsxString = row[xlsxLocales.indexOf(base) + 1].value

    jsonEntry = jsonMap[base][xlsxString]
    if jsonEntry
      for locale, i in xlsxLocales
        if locale != base
          # Add the new localized string
          if row[i + 1] and row[i + 1].value and not jsonEntry._unused
            jsonEntry[locale] = row[i + 1].value
          else
            if not jsonEntry._unused
              console.log "Missing #{xlsxString}"
    else
      throw new Error('Could not find reference string: "' + xlsxString + '" using base: ' + base)

  # Sort by used
  localizations.strings = _.sortBy(localizations.strings, (l) -> if l._unused then 1 else 0)

  # Write the whole thing to a JSon file
  fs.writeFileSync(newDataFile, JSON.stringify(localizations, null, 2), 'utf-8')
  return localizations

 