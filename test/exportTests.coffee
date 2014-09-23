assert = require('chai').assert
extractor = require '../src/extractor'
fs = require 'fs'
xlsx = require 'xlsx.js'

describe "export localization file", ->
  it "creates localizations file", (done) ->
    extractor.updateLocalizationFile(__dirname + '/exportSample/exportTest.js', __dirname + '/exportSample/localizedExportTest.json', {}, done)

  it "export localization file to xlsx", (done) ->
    dataFile = __dirname + '/exportSample/localizedExportTest.json'
    exportFile = __dirname + '/exportSample/exportResult.xlsx'

    extractor.exportLocalizationFileToXlsx(dataFile, exportFile, "en", "fr", done)

describe "import xlsx file", ->
  it "imports xlsx to localization", (done) ->
    oldDataFile = __dirname + '/exportSample/localizedExportTest.json'
    newDataFile = __dirname + '/exportSample/localizedExportResult.json'
    importFile = __dirname + '/exportSample/toBeImported.xlsx'

    extractor.importLocalizationFileFromXlsx(oldDataFile, importFile, newDataFile, done)
