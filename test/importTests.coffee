assert = require('chai').assert
importer = require '../src/importer'

describe "import xlsx file", ->
  it "imports xlsx to localization", (done) ->
    oldDataFile = __dirname + '/exportSample/localizedExportTest.json'
    newDataFile = __dirname + '/exportSample/localizedExportResult.json'
    importFile = __dirname + '/exportSample/toBeImported.xlsx'

    importer(oldDataFile, importFile, newDataFile, (localizations) ->
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
              "_base": "fr",
              "en": {
                "value": "plane",
                "formatCode": "General"
              },
              "fr": {
                "value": "avion",
                "formatCode": "General"
              },
              "es": {
                "value": "avión",
                "formatCode": "General"
              }
            },
            {
              "_base": "es",
              "en": {
                "value": "throw",
                "formatCode": "General"
              },
              "es": {
                "value": "botar",
                "formatCode": "General"
              },
              "fr": {
                "value": "jeter",
                "formatCode": "General"
              }
            },
            {
              "_base": "fr",
              "fr": {
                "value": "chien",
                "formatCode": "General"
              },
              "en": {
                "value": "dog",
                "formatCode": "General"
              },
              "es": {
                "value": "perro",
                "formatCode": "General"
              }
            },
            {
              "_base": "en",
              "en": {
                "value": "dog",
                "formatCode": "General"
              },
              "es": {
                "value": "perro",
                "formatCode": "General"
              },
              "fr": {
                "value": "chien",
                "formatCode": "General"
              }
            }
          ]
        }
      done()
    )
