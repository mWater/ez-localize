minimist = require('minimist')
exporter = require './src/exporter'

# Process args
args = minimist(process.argv.slice(2))

if not args._.length > 0
  console.log "Usage: <JSON file input> <XLSX file output>"
  return 

dataFile = args._[0]
xlsxFile = args._[1]

exporter(dataFile, xlsxFile)
console.log "Export complete to #{xlsxFile}"
