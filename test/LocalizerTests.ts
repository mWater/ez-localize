import { assert } from "chai"
import Localizer from "../src/Localizer"

describe("Localizer", function () {
  before(function () {
    this.data = {
      locales: [
        { code: "en", name: "English" },
        { code: "es", name: "Espanol" }
      ],
      strings: [
        { en: "dog", es: "perro" },
        { en: "cat", es: "gato" },
        { en: "a {0} b {1} c", es: "x {1} y {0} z" }
      ]
    }
    this.loc = new Localizer(this.data, "es")
  })

  it("localizes string", function () {
    assert.equal(this.loc.localizeString("dog"), "perro")
  })

  it("falls back to english", function () {
    assert.equal(this.loc.localizeString("fish"), "fish")
  })

  it("replaces parameters", function () {
    assert.equal(this.loc.localizeString("a {0} b {1} c", "1", 2), "x 2 y 1 z")
  })

  it("replaces parameters ES6-style", function () {
    assert.equal(this.loc.T`a ${"1"} b ${2} c`, "x 2 y 1 z")
    assert.equal(this.loc.T`a`, "a")
    assert.equal(this.loc.T``, "")
  })

  it("T replaces parameters", function () {
    assert.equal(this.loc.T("a {0} b {1} c", "1", 2), "x 2 y 1 z")
  })

  describe("react-style localization", () =>
    it("returns array with objects", function () {
      assert.deepEqual(this.loc.T("a {0} b {1} c", { x: 1 }, { y: 2 }), ["x ", { y: 2 }, " y ", { x: 1 }, " z"])
    }))
})
