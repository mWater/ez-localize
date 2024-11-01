import _ from "lodash"
import { assert } from "chai"
import * as utils from "../src/utils"
import { LocalizedString } from "../src/utils"
import { LocalizerData } from "../src"

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

    it("gets localizedStrings strings", function () {
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
      const strs: LocalizedString[] = [
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

      return assert(strs2[0] === strs[0])
    }))

  describe("changeBaseLocale", () =>
    it("changes base, preserving other strings but overwriting with base", function () {
      const strs: LocalizedString[] = [
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

    it("returns empty strings", function () {
      const input = [{ _base: "en", en: "2" }]

      const output = this.roundtrip(input)
      return assert.deepEqual(output, [{ _base: "en", en: "2", es: "" }])
    })
  })

  describe("updateLocalizedStrings", function () {
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
      const strs: LocalizedString[] = [{ _base: "en", en: "other", es: "otra" }]

      const updates: LocalizedString[] = [
        { _base: "en", en: "other", es: "" } // Should remove es
      ]

      this.localizer.updateLocalizedStrings(strs, updates)

      return assert.deepEqual(strs, [{ _base: "en", en: "other" }], JSON.stringify(strs))
    })

    it("leaves unknown languages untouched", function () {
      const strs = [{ _base: "en", en: "hello", es: "hola1", fr: "bonjour" }]

      const updates = [{ _base: "en", en: "hello", es: "hola3" }]

      this.localizer.updateLocalizedStrings(strs, updates)

      return assert.deepEqual(strs, [{ _base: "en", en: "hello", es: "hola3", fr: "bonjour" }])
    })
  })

  describe("mergeLocalizerData", function () {
    const testLocales = [
      { code: "en", name: "English" },
      { code: "es", name: "Spanish" }
    ]

    it("merges non-conflicting strings", function () {
      const base: LocalizerData = {
        locales: testLocales,
        strings: [
          { _base: "en", en: "hello", es: "hola" }
        ]
      }
      
      const update: LocalizerData = {
        locales: testLocales,
        strings: [
          { _base: "en", en: "goodbye", es: "adios" }
        ]
      }

      const result = utils.mergeLocalizerData([base, update])
      assert.deepEqual(result.strings, [
        { _base: "en", en: "hello", es: "hola" },
        { _base: "en", en: "goodbye", es: "adios" }
      ])
    })

    it("updates translations for existing strings", function () {
      const base: LocalizerData = {
        locales: testLocales,
        strings: [
          { _base: "en", en: "hello", es: "hola" }
        ]
      }
      
      const update: LocalizerData = {
        locales: testLocales,
        strings: [
          { _base: "en", en: "hello", es: "hola2" }
        ]
      }

      const result = utils.mergeLocalizerData([base, update])
      assert.deepEqual(result.strings, [
        { _base: "en", en: "hello", es: "hola2" }
      ])
    })

    it("ignores blank strings", function () {
      const base: LocalizerData = {
        locales: testLocales,
        strings: [
          { _base: "en", en: "hello", es: "hola" }
        ]
      }
      
      const update: LocalizerData = {
        locales: testLocales,
        strings: [
          { _base: "en", en: "hello", es: "" }
        ]
      }

      const result = utils.mergeLocalizerData([base, update])
      assert.deepEqual(result.strings, [
        { _base: "en", en: "hello", es: "hola" }
      ])
    })

    it("preserves strings with different base languages", function () {
      const base: LocalizerData = {
        locales: testLocales,
        strings: [
          { _base: "en", en: "hello", es: "hola" },
          { _base: "es", en: "goodbye", es: "adios" }
        ]
      }
      
      const update: LocalizerData = {
        locales: testLocales,
        strings: [
          { _base: "en", en: "hello", es: "hola2" }
        ]
      }

      const result = utils.mergeLocalizerData([base, update])
      assert.deepEqual(result.strings, [
        { _base: "en", en: "hello", es: "hola2" },
        { _base: "es", en: "goodbye", es: "adios" }
      ])
    })

    it("handles empty updates", function () {
      const base: LocalizerData = {
        locales: testLocales,
        strings: [
          { _base: "en", en: "hello", es: "hola" }
        ]
      }
      
      const update: LocalizerData = {
        locales: testLocales,
        strings: []
      }

      const result = utils.mergeLocalizerData([base, update])
      assert.deepEqual(result.strings, [
        { _base: "en", en: "hello", es: "hola" }
      ])
    })

    it("handles empty base", function () {
      const base: LocalizerData = {
        locales: testLocales,
        strings: []
      }
      
      const update: LocalizerData = {
        locales: testLocales,
        strings: [
          { _base: "en", en: "hello", es: "hola" }
        ]
      }

      const result = utils.mergeLocalizerData([base, update])
      assert.deepEqual(result.strings, [
        { _base: "en", en: "hello", es: "hola" }
      ])
    })

    it("preserves additional languages in base", function () {
      const base: LocalizerData = {
        locales: [...testLocales, { code: "fr", name: "French" }],
        strings: [
          { _base: "en", en: "hello", es: "hola", fr: "bonjour" }
        ]
      }
      
      const update: LocalizerData = {
        locales: testLocales,
        strings: [
          { _base: "en", en: "hello", es: "hola2" }
        ]
      }

      const result = utils.mergeLocalizerData([base, update])
      assert.deepEqual(result.strings, [
        { _base: "en", en: "hello", es: "hola2", fr: "bonjour" }
      ])
    })

    it("merges locales", function() {
      const base: LocalizerData = {
        locales: [{ code: "en", name: "English" }],
        strings: [
          { _base: "en", en: "hello" }
        ]
      }

      const update: LocalizerData = {
        locales: [
          { code: "en", name: "English" },
          { code: "es", name: "Spanish" }
        ],
        strings: [
          { _base: "en", en: "hello", es: "hola" }
        ]
      }

      const result = utils.mergeLocalizerData([base, update])
      assert.deepEqual(result.locales, [
        { code: "en", name: "English" },
        { code: "es", name: "Spanish" }
      ])
    })
  })
})
