import { assert } from "chai"
import * as extractor from "../src/extractor"
import _ from "lodash"
import { LocalizerData } from "../src"

describe("updateLocalizations", function () {
  this.timeout(20000)

  it("creates localizations", function (done) {
    const data: LocalizerData = {} as any
    return extractor.updateLocalizations([__dirname + "/requireSample"], data, {}, function () {
      assert.deepEqual(data.locales, [{ code: "en", name: "English" }])
      assert.deepEqual(_.sortBy(data.strings, "en"), [
        { _base: "en", en: "a" },
        { _base: "en", en: "b" },
        { _base: "en", en: "c" },
        { _base: "en", en: "d" }
      ])
      done()
    })
  })

  it("preserves languages", function (done) {
    const data = {
      locales: [
        { code: "en", name: "English" },
        { code: "es", name: "Espanol" }
      ],
      strings: [{ _base: "en", en: "b", es: "b-es" }]
    }
    return extractor.updateLocalizations([__dirname + "/requireSample"], data, {}, function () {
      assert.deepEqual(data.locales, [
        { code: "en", name: "English" },
        { code: "es", name: "Espanol" }
      ])
      assert.deepEqual(_.sortBy(data.strings, "en"), [
        { _base: "en", en: "a", es: "" },
        { _base: "en", en: "b", es: "b-es" },
        { _base: "en", en: "c", es: "" },
        { _base: "en", en: "d", es: "" }
      ])
      done()
    })
  })

  it("marks unused", function (done) {
    const data: LocalizerData = {
      locales: [{ code: "en", name: "English" }],
      strings: [{ _base: "en", en: "x" }]
    }
    extractor.updateLocalizations([__dirname + "/requireSample"], data, {}, function () {
      assert.deepEqual(_.sortBy(data.strings, "en"), [
        { _base: "en", en: "a" },
        { _base: "en", en: "b" },
        { _base: "en", en: "c" },
        { _base: "en", en: "d" },
        { _base: "en", en: "x" }
      ])
      assert.deepEqual(data.unused, ["x"])
      done()
    })
  })

  it("removes unused", function (done) {
    const data = {
      locales: [{ code: "en", name: "English" }],
      strings: [{ _base: "en", en: "b" }],
      unused: ["b"]
    }
    extractor.updateLocalizations([__dirname + "/requireSample"], data, {}, function () {
      assert.deepEqual(_.sortBy(data.strings, "en"), [
        { _base: "en", en: "a" },
        { _base: "en", en: "b" },
        { _base: "en", en: "c" },
        { _base: "en", en: "d" }
      ])
      assert.deepEqual(data.unused, [])
      done()
    })
  })
})
