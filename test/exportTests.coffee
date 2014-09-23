assert = require('chai').assert
exporter = require '../src/Exporter'

describe "export xlsx file", ->
  it "export localization file to xlsx", (done) ->
    dataFile = __dirname + '/exportSample/localizedExportTest.json'
    exportFile = __dirname + '/exportSample/exportResult.xlsx'

    exporter(dataFile, exportFile, done)
