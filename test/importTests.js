assert = require('chai').assert
importer = require '../src/importer'

describe "import xlsx file", ->
  it "imports xlsx to localization", ->
    oldDataFile = __dirname + '/exportSample/localizedExportTest.json'
    newDataFile = __dirname + '/exportSample/localizedExportResult.json'
    importFile = __dirname + '/exportSample/toBeImported.xlsx'

    localizations = importer(oldDataFile, importFile, newDataFile)
    assert.equal localizations.locales.length, 3
    assert.equal localizations.locales[0].code, "en"
    assert.equal localizations.locales[1].code, "fr"
    assert.equal localizations.locales[2].code, "es"

    assert.deepEqual localizations, {
      "locales": [
        {
          "code": "en",
          "name": "English"
        },
        {
          "code": "fr",
          "name": "French"
        },
        {
          "code": "es",
          "name": "Spanish"
        }
      ],
      "strings": [
        {
          "_base": "fr"
          "en": "plane"
          "fr": "avion"
          "es": "avión"
        },
        {
          "_base": "es"
          "en": "throw"
          "es": "botar"
          "fr": "jeter"
        },
        {
          "_base": "fr"
          "fr": "chien"
          "en": "dog"
          "es": "perro"
        },
        {
          "_base": "en"
          "en": "dog"
          "es": "perro"
          "fr": "chien"
        }
      ]
    }, JSON.stringify(localizations, null, 2)
