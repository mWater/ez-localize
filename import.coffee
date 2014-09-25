importer = require('./src/importer')

dataFile = process.argv[2]
xlsxFile = process.argv[3]
newDataFile = process.argv[4]

if not newDataFile?
  newDataFile = dataFile

importer(dataFile, xlsxFile, newDataFile, () ->
  console.log 'Done Importing'
)
