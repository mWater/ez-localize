fs = require 'fs'
xlsx = require 'xlsx.js'

# dataFile: e.g. "localizations.json"
# xlsxFile: path of file to export
module.exports = exportLocalizationFileToXlsx = (dataFile, xlsxFile) ->
  # Read in data file
  localizations = JSON.parse(fs.readFileSync(dataFile, 'utf-8'))

  locales = []
  firstRow = []
  firstRow.push {
    value: "base"
    formatCode: "General"
  }
  for locale in localizations.locales
    locales.push locale.code
    firstRow.push {
      value: locale.code
      formatCode: "General"
    }

  rows = [firstRow]

  for string in localizations.strings
    if string._unused
      continue
      
    # Add all the base Locale values
    row = []

    # First column is the locale
    row.push {
      value: string._base
      formatCode: "General"
    }

    # Then one column for each of the localized strings
    for locale in locales
      value = string[locale]
      # Simply put "" if the translation doesn't exist yet
      if not value?
        value = ""
      row.push {
        value: value
        formatCode: "General"
      }

    rows.push row

  data = {
    worksheets: [
      {
        name: "Name"
        data: rows
      }
    ]
  }

  fs.writeFileSync(xlsxFile, xlsx(data).base64, 'base64')
  return rows

