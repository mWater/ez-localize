_ = require 'lodash'
assert = require("chai").assert

utils = require '../src/utils'

describe "Localizer", ->
  describe "extractLocalizedStrings", ->
    it "gets all strings", ->
      obj = {
        a: [
          { 
            b: { _base: "en", en: "hello" }
          },
          { 
            c: { _base: "es", en: "hello2" }
          }
        ]
        d: "test"
        e: null
      }
      strs = utils.extractLocalizedStrings(obj)

      assert.deepEqual strs, [{ _base: "en", en: "hello" }, { _base: "es", en: "hello2" }]

    it "gets localizedStrings strings", ->
      obj = {
        localizedStrings: [
          { 
            b: { _base: "en", en: "hello" }
          },
          { 
            c: { _base: "es", en: "hello2" }
          }
        ]
        d: "test"
        e: null
      }
      strs = utils.extractLocalizedStrings(obj)

      assert.deepEqual strs, [{ _base: "en", en: "hello" }, { _base: "es", en: "hello2" }]

  describe "dedupLocalizedStrings", ->
    it "removes duplicates by base + string", ->
      strs = [
        { _base: "en", en: "hello", es: "esp1" }
        { _base: "es", en: "hello", es: "hello" }  # Different base language
        { _base: "en", en: "hello2" }
        { _base: "en", en: "hello", es: "esp2" }
      ]

      strs2 = utils.dedupLocalizedStrings(strs)
      assert.deepEqual strs2, [
        { _base: "en", en: "hello", es: "esp1" }
        { _base: "es", en: "hello", es: "hello" }  # Different base language
        { _base: "en", en: "hello2" }
      ]

      # Should keep orig object
      assert strs2[0] == strs[0]

  describe "changeBaseLocale", ->
    it "changes base, preserving other strings but overwriting with base", ->
      strs = [
        { _base: "en", en: "hello", es: "esp1" }
        { _base: "en", en: "hello", fr: "fr1", es: "esp1" }
        { _base: "es", en: "hello", fr: "fr1", es: "esp1" }
        { _base: "fr", fr: "fr2", es: "esp1" }
        { _base: "es", fr: "fr2", es: "esp1" }
      ]

      utils.changeBaseLocale(strs, "en", "fr")
      assert.deepEqual strs, [
        { _base: "fr", fr: "hello", es: "esp1" }
        { _base: "fr", fr: "hello", es: "esp1" }
        { _base: "fr", fr: "hello", es: "esp1" }
        { _base: "fr", fr: "fr2", es: "esp1" }
        { _base: "fr", fr: "esp1" }
      ], JSON.stringify(strs, null, 2)

  describe "xlsx export/import", ->
    beforeEach ->
      @localizer = utils
      @locales = [{code: "en", name: "English"}, {code: "es", name: "Espanol"}]
      @roundtrip = (strs) ->
        xlsxFile = @localizer.exportXlsx(@locales, strs)
        return @localizer.importXlsx(@locales, xlsxFile)

    it "roundtrips strings", ->
      input = [
        { _base: "en", en: "hello", es: "hola" }
        { _base: "es", en: "bye", es: "ciao" }
      ]

      output = @roundtrip input
      assert.deepEqual input, output

    it "preserves special characters", ->
      input = [
        { _base: "en", en: "<>`'\"!@#$%^&*()_+", es: "hola" }
        { _base: "es", en: "bye", es: "ciao" }
      ]

      output = @roundtrip input
      assert.deepEqual input, output

    it "preserves unicode characters", ->      
      input = [
        { _base: "en", en: "éא", es: "hola" }
        { _base: "es", en: "bye ", es: "ciao" }
      ]

      output = @roundtrip input
      assert.deepEqual input, output

    it "preserves enter", ->
      input = [
        { _base: "en", en: "hello\nhello2", es: "hola" }
        { _base: "es", en: "bye", es: "ciao" }
      ]

      output = @roundtrip input
      assert.deepEqual input, output

    it "preserves numbers as strings", ->
      input = [
        { _base: "en", en: "2", es: "3" }
        { _base: "es", en: "bye", es: "ciao" }
      ]

      output = @roundtrip input
      assert.deepEqual input, output

    it "returns empty strings", ->
      input = [
        { _base: "en", en: "2" }
      ]

      output = @roundtrip input
      assert.deepEqual output, [ { _base: "en", en: "2", es: "" }]

  describe "updateLocalizedStrings", ->
    beforeEach ->
      @localizer = utils

    it "updates based on base + string", ->
      strs = [
        { _base: "en", en: "hello", es: "hola1" }
        { _base: "en", en: "hello", es: "hola2" }
        { _base: "es", en: "bye", es: "ciao" }
      ]

      updates = [
        { _base: "en", en: "hello", es: "hola3" }
        { _base: "en", en: "bye", es: "ciao2" }  # Should not apply since wrong base
      ]

      @localizer.updateLocalizedStrings(strs, updates)

      assert.deepEqual strs, [
        { _base: "en", en: "hello", es: "hola3" }
        { _base: "en", en: "hello", es: "hola3" }
        { _base: "es", en: "bye", es: "ciao" }
      ]

    it "updates using trimmed string", ->
      strs = [
        { _base: "en", en: "hello ", es: "hola1" }
      ]

      updates = [
        { _base: "en", en: "hello", es: "hola3" }
      ]

      @localizer.updateLocalizedStrings(strs, updates)

      assert.deepEqual strs, [
        { _base: "en", en: "hello ", es: "hola3" }
      ], JSON.stringify(strs)

    it "updates using CR/LF normalized string", ->
      strs = [
        { _base: "en", en: "hello\nthere", es: "hola1" }
      ]

      updates = [
        { _base: "en", en: "hello\r\nthere", es: "hola3" }
      ]

      @localizer.updateLocalizedStrings(strs, updates)

      assert.deepEqual strs, [
        { _base: "en", en: "hello\nthere", es: "hola3" }
      ], JSON.stringify(strs)

    it "leaves unknown strings untouched", ->
      strs = [
        { _base: "en", en: "other", es: "otra" }
      ]

      updates = [
        { _base: "en", en: "hello", es: "hola3" }
        { _base: "en", en: "bye", es: "ciao2" }  # Should not apply since wrong base
      ]

      @localizer.updateLocalizedStrings(strs, updates)

      assert.deepEqual strs, [
        { _base: "en", en: "other", es: "otra" }
      ]

    it "removes empty strings", ->
      strs = [
        { _base: "en", en: "other", es: "otra" }
      ]

      updates = [
        { _base: "en", en: "other", es: "" } # Should remove es
      ]

      @localizer.updateLocalizedStrings(strs, updates)

      assert.deepEqual strs, [ { _base: "en", en: "other" } ], JSON.stringify(strs)

    it "leaves unknown languages untouched", ->
      strs = [
        { _base: "en", en: "hello", es: "hola1", fr: "bonjour" }
      ]

      updates = [
        { _base: "en", en: "hello", es: "hola3" }
      ]

      @localizer.updateLocalizedStrings(strs, updates)

      assert.deepEqual strs, [
        { _base: "en", en: "hello", es: "hola3", fr: "bonjour" }
      ]

