fs = require 'fs'
exportXlsx = require('./utils').exportXlsx

# dataFile: e.g. "localizations.json"
# xlsxFile: path of file to export
module.exports = exportLocalizationFileToXlsx = (dataFile, xlsxFile) ->
  # Read in data file
  localizations = JSON.parse(fs.readFileSync(dataFile, 'utf-8'))

  ws = exportXlsx(localizations.locales, localizations.strings)
  fs.writeFileSync(xlsxFile, ws, 'base64')
