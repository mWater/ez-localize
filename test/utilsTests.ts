// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
import _ from "lodash"
import { assert } from "chai"
import * as utils from "../src/utils"

describe("Localizer", function () {
  describe("extractLocalizedStrings", function () {
    it("gets all strings", function () {
      const obj = {
        a: [
          {
            b: { _base: "en", en: "hello" }
          },
          {
            c: { _base: "es", en: "hello2" }
          }
        ],
        d: "test",
        e: null
      }
      const strs = utils.extractLocalizedStrings(obj)

      return assert.deepEqual(strs, [
        { _base: "en", en: "hello" },
        { _base: "es", en: "hello2" }
      ])
    })

    return it("gets localizedStrings strings", function () {
      const obj = {
        localizedStrings: [
          {
            b: { _base: "en", en: "hello" }
          },
          {
            c: { _base: "es", en: "hello2" }
          }
        ],
        d: "test",
        e: null
      }
      const strs = utils.extractLocalizedStrings(obj)

      return assert.deepEqual(strs, [
        { _base: "en", en: "hello" },
        { _base: "es", en: "hello2" }
      ])
    })
  })

  describe("dedupLocalizedStrings", () =>
    it("removes duplicates by base + string", function () {
      const strs = [
        { _base: "en", en: "hello", es: "esp1" },
        { _base: "es", en: "hello", es: "hello" }, // Different base language
        { _base: "en", en: "hello2" },
        { _base: "en", en: "hello", es: "esp2" }
      ]

      const strs2 = utils.dedupLocalizedStrings(strs)
      assert.deepEqual(strs2, [
        { _base: "en", en: "hello", es: "esp1" },
        { _base: "es", en: "hello", es: "hello" }, // Different base language
        { _base: "en", en: "hello2" }
      ])

      // Should keep orig object
      return assert(strs2[0] === strs[0])
    }))

  describe("changeBaseLocale", () =>
    it("changes base, preserving other strings but overwriting with base", function () {
      const strs = [
        { _base: "en", en: "hello", es: "esp1" },
        { _base: "en", en: "hello", fr: "fr1", es: "esp1" },
        { _base: "es", en: "hello", fr: "fr1", es: "esp1" },
        { _base: "fr", fr: "fr2", es: "esp1" },
        { _base: "es", fr: "fr2", es: "esp1" }
      ]

      utils.changeBaseLocale(strs, "en", "fr")
      return assert.deepEqual(
        strs,
        [
          { _base: "fr", fr: "hello", es: "esp1" },
          { _base: "fr", fr: "hello", es: "esp1" },
          { _base: "fr", fr: "hello", es: "esp1" },
          { _base: "fr", fr: "fr2", es: "esp1" },
          { _base: "fr", fr: "esp1" }
        ],
        JSON.stringify(strs, null, 2)
      )
    }))

  describe("xlsx export/import", function () {
    beforeEach(function () {
      this.localizer = utils
      this.locales = [
        { code: "en", name: "English" },
        { code: "es", name: "Espanol" }
      ]
      return (this.roundtrip = function (strs: any) {
        const xlsxFile = this.localizer.exportXlsx(this.locales, strs)
        return this.localizer.importXlsx(this.locales, xlsxFile)
      })
    })

    it("roundtrips strings", function () {
      const input = [
        { _base: "en", en: "hello", es: "hola" },
        { _base: "es", en: "bye", es: "ciao" }
      ]

      const output = this.roundtrip(input)
      return assert.deepEqual(input, output)
    })

    it("preserves special characters", function () {
      const input = [
        { _base: "en", en: "<>`'\"!@#$%^&*()_+", es: "hola" },
        { _base: "es", en: "bye", es: "ciao" }
      ]

      const output = this.roundtrip(input)
      return assert.deepEqual(input, output)
    })

    it("preserves unicode characters", function () {
      const input = [
        { _base: "en", en: "éא", es: "hola" },
        { _base: "es", en: "bye ", es: "ciao" }
      ]

      const output = this.roundtrip(input)
      return assert.deepEqual(input, output)
    })

    it("preserves enter", function () {
      const input = [
        { _base: "en", en: "hello\nhello2", es: "hola" },
        { _base: "es", en: "bye", es: "ciao" }
      ]

      const output = this.roundtrip(input)
      return assert.deepEqual(input, output)
    })

    it("preserves numbers as strings", function () {
      const input = [
        { _base: "en", en: "2", es: "3" },
        { _base: "es", en: "bye", es: "ciao" }
      ]

      const output = this.roundtrip(input)
      return assert.deepEqual(input, output)
    })

    return it("returns empty strings", function () {
      const input = [{ _base: "en", en: "2" }]

      const output = this.roundtrip(input)
      return assert.deepEqual(output, [{ _base: "en", en: "2", es: "" }])
    })
  })

  return describe("updateLocalizedStrings", function () {
    beforeEach(function () {
      return (this.localizer = utils)
    })

    it("updates based on base + string", function () {
      const strs = [
        { _base: "en", en: "hello", es: "hola1" },
        { _base: "en", en: "hello", es: "hola2" },
        { _base: "es", en: "bye", es: "ciao" }
      ]

      const updates = [
        { _base: "en", en: "hello", es: "hola3" },
        { _base: "en", en: "bye", es: "ciao2" } // Should not apply since wrong base
      ]

      this.localizer.updateLocalizedStrings(strs, updates)

      return assert.deepEqual(strs, [
        { _base: "en", en: "hello", es: "hola3" },
        { _base: "en", en: "hello", es: "hola3" },
        { _base: "es", en: "bye", es: "ciao" }
      ])
    })

    it("updates using trimmed string", function () {
      const strs = [{ _base: "en", en: "hello ", es: "hola1" }]

      const updates = [{ _base: "en", en: "hello", es: "hola3" }]

      this.localizer.updateLocalizedStrings(strs, updates)

      return assert.deepEqual(strs, [{ _base: "en", en: "hello ", es: "hola3" }], JSON.stringify(strs))
    })

    it("updates using CR/LF normalized string", function () {
      const strs = [{ _base: "en", en: "hello\nthere", es: "hola1" }]

      const updates = [{ _base: "en", en: "hello\r\nthere", es: "hola3" }]

      this.localizer.updateLocalizedStrings(strs, updates)

      return assert.deepEqual(strs, [{ _base: "en", en: "hello\nthere", es: "hola3" }], JSON.stringify(strs))
    })

    it("leaves unknown strings untouched", function () {
      const strs = [{ _base: "en", en: "other", es: "otra" }]

      const updates = [
        { _base: "en", en: "hello", es: "hola3" },
        { _base: "en", en: "bye", es: "ciao2" } // Should not apply since wrong base
      ]

      this.localizer.updateLocalizedStrings(strs, updates)

      return assert.deepEqual(strs, [{ _base: "en", en: "other", es: "otra" }])
    })

    it("removes empty strings", function () {
      const strs = [{ _base: "en", en: "other", es: "otra" }]

      const updates = [
        { _base: "en", en: "other", es: "" } // Should remove es
      ]

      this.localizer.updateLocalizedStrings(strs, updates)

      return assert.deepEqual(strs, [{ _base: "en", en: "other" }], JSON.stringify(strs))
    })

    return it("leaves unknown languages untouched", function () {
      const strs = [{ _base: "en", en: "hello", es: "hola1", fr: "bonjour" }]

      const updates = [{ _base: "en", en: "hello", es: "hola3" }]

      this.localizer.updateLocalizedStrings(strs, updates)

      return assert.deepEqual(strs, [{ _base: "en", en: "hello", es: "hola3", fr: "bonjour" }])
    })
  })
})
