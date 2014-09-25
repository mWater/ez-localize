exporter = require './src/exporter'

dataFile = process.argv[2]
xlsxFile = process.argv[3]

exporter(dataFile, xlsxFile, () ->
  console.log 'Done exporting'
)


