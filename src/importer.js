fs = require 'fs'
_ = require 'lodash'
importXlsx = require('./utils').importXlsx
updateLocalizedStrings = require('./utils').updateLocalizedStrings

# oldDataFile: e.g. "localizations.json"
# xlsxFile: path of file to export
# newDataFile: can be the same as oldDataFile (different when testing)
module.exports = (oldDataFile, xlsxFile, newDataFile) ->
  # Read the xlsx file and get the locales
  base64File = fs.readFileSync(xlsxFile, 'base64')

  localizations = JSON.parse(fs.readFileSync(oldDataFile, 'utf-8'))

  updates = importXlsx(localizations.locales, base64File)
  updateLocalizedStrings(localizations.strings, updates)

  # Sort by used
  localizations.strings = _.sortBy(localizations.strings, (l) -> if l._unused then 1 else 0)

  # Write the whole thing to a JSon file
  fs.writeFileSync(newDataFile, JSON.stringify(localizations, null, 2), 'utf-8')
  return localizations

 