// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
import { assert } from "chai"
import importer from "../src/importer"

describe("import xlsx file", () =>
  it("imports xlsx to localization", function () {
    const oldDataFile = __dirname + "/exportSample/localizedExportTest.json"
    const newDataFile = __dirname + "/exportSample/localizedExportResult.json"
    const importFile = __dirname + "/exportSample/toBeImported.xlsx"

    const localizations = importer(oldDataFile, importFile, newDataFile)
    assert.equal(localizations.locales.length, 3)
    assert.equal(localizations.locales[0].code, "en")
    assert.equal(localizations.locales[1].code, "fr")
    assert.equal(localizations.locales[2].code, "es")

    return assert.deepEqual(
      localizations,
      {
        locales: [
          {
            code: "en",
            name: "English"
          },
          {
            code: "fr",
            name: "French"
          },
          {
            code: "es",
            name: "Spanish"
          }
        ],
        strings: [
          {
            _base: "fr",
            en: "plane",
            fr: "avion",
            es: "avión"
          },
          {
            _base: "es",
            en: "throw",
            es: "botar",
            fr: "jeter"
          },
          {
            _base: "fr",
            fr: "chien",
            en: "dog",
            es: "perro"
          },
          {
            _base: "en",
            en: "dog",
            es: "perro",
            fr: "chien"
          }
        ]
      },
      JSON.stringify(localizations, null, 2)
    )
  }))
