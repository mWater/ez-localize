fs = require 'fs'
xlsx = require 'xlsx.js'

# dataFile: e.g. "localizations.json"
# xlsxFile: path of file to export
# baseLocale: locale used as the reference for translating ("en")
# newLocale: new locale created by the translator
exportLocalizationFileToXlsx = (dataFile, xlsxFile, baseLocale, newLocale, callback) ->
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

dataFile = process.argv[2]
xlsxFile = process.argv[3]
baseLocale = process.argv[4]
newLocale = process.argv[5]

exportLocalizationFileToXlsx(dataFile, xlsxFile, baseLocale, newLocale, () ->
  console.log 'done'
)