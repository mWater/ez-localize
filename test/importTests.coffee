assert = require('chai').assert
importer = require '../src/Importer'

describe "import xlsx file", ->
  it "imports xlsx to localization", (done) ->
    oldDataFile = __dirname + '/exportSample/localizedExportTest.json'
    newDataFile = __dirname + '/exportSample/localizedExportResult.json'
    importFile = __dirname + '/exportSample/toBeImported.xlsx'

    importer(oldDataFile, importFile, newDataFile, done)
