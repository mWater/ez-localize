assert = require('chai').assert
exporter = require '../src/exporter'

describe "export xlsx file", ->
  it "export localization file to xlsx", ->
    dataFile = __dirname + '/exportSample/localizedExportTest.json'
    exportFile = __dirname + '/exportSample/exportResult.xlsx'

    rows = exporter(dataFile, exportFile)
    #test rows and columns names
    assert.equal rows[0][0].value, "base"
    assert.equal rows[0][1].value, "en"
    assert.equal rows[0][2].value, "fr"
    assert.equal rows[0][3].value, "es"
    assert.equal rows[1][0].value, "fr"
    assert.equal rows[2][0].value, "es"
    assert.equal rows[3][0].value, "fr"
    assert.equal rows[4][0].value, "en"
