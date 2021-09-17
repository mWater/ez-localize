minimist = require('minimist')
importer = require('./src/importer')

# Process args
args = minimist(process.argv.slice(2))

if not args._.length > 0
  console.log "Usage: <XLSX file input> <JSON file input> [<JSON file output>]"
  return 

dataFile = args._[0]
xlsxFile = args._[1]
newDataFile = args._[2]

if not newDataFile?
  newDataFile = dataFile

importer(dataFile, xlsxFile, newDataFile, () ->
  console.log 'Done Importing'
)
