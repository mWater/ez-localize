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

dataFile = process.argv[2]
xlsxFile = process.argv[3]
newDataFile = process.argv[4]

importLocalizationFileFromXlsx(dataFile, xlsxFile, newDataFile, () ->
  console.log 'done'
)