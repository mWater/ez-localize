assert = require('chai').assert
Localizer = require '../src/Localizer'

describe "Localizer", ->
  before ->
    @data = {
      locales: [
        { code: "en", name: "English" }
        { code: "es", name: "Espanol" }
      ]
      strings: [
        { en: "dog", es: "perro" }
        { en: "cat", es: "gato" }
        { en: "a {0} b {1} c", es: "x {1} y {0} z" }
      ]
    }
    @loc = new Localizer(@data, "es")

  it "localizes string", ->
    assert.equal @loc.localizeString("dog"), "perro"

  it "falls back to english", ->
    assert.equal @loc.localizeString("fish"), "fish"

  it "replaces parameters", ->
    assert.equal @loc.localizeString("a {0} b {1} c", "1", 2), "x 2 y 1 z"

  it "T replaces parameters", ->
    assert.equal @loc.T("a {0} b {1} c", "1", 2), "x 2 y 1 z"

  describe "react-style localization", ->
    it "returns array with objects", ->
      assert.deepEqual @loc.T("a {0} b {1} c", { x: 1 }, { y: 2 }), ["x ", { y: 2 }, " y ", { x: 1 }, " z"]

