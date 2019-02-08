assert = require('chai').assert
extractor = require '../src/extractor'
coffeeify = require 'coffeeify'
hbsfy = require 'hbsfy'
_ = require 'underscore'

describe "updateLocalizations", ->
  @timeout(20000)
  it "creates localizations", (done) ->
    data = {}
    extractor.updateLocalizations [__dirname + '/requireSample'], data, {}, ->
      assert.deepEqual data.locales, [{ code: "en", name: "English"}]
      assert.deepEqual _.sortBy(data.strings, "en"), [{ _base: "en", en: "a" }, { _base: "en", en: "b" }, { _base: "en", en: "c" }, { _base: "en", en: "d" }]
      done()

  it "preserves languages", (done) ->
    data = {
      locales: [
        { code: "en", name: "English" }
        { code: "es", name: "Espanol" }
      ]
      strings: [
        { _base: "en", en: "b", es: "b-es" }
      ]
    }
    extractor.updateLocalizations [__dirname + '/requireSample'], data, {}, ->
      assert.deepEqual data.locales, [{ code: "en", name: "English"}, { code: "es", name: "Espanol" }]
      assert.deepEqual _.sortBy(data.strings, "en"), [
        { _base: "en", en: "a", es: "" }
        { _base: "en", en: "b", es: "b-es" }
        { _base: "en", en: "c", es: "" }
        { _base: "en", en: "d", es: "" }
      ]
      done()


  it "marks unused", (done) ->
    data = {
      locales: [
        { code: "en", name: "English" }
      ]
      strings: [
        { _base: "en", en: "x" }
      ]
    }
    extractor.updateLocalizations [__dirname + '/requireSample'], data, {}, ->
      assert.deepEqual _.sortBy(data.strings, "en"), [{ _base: "en", en: "a" }, { _base: "en", en: "b" }, { _base: "en", en: "c" }, { _base: "en", en: "d" }, { _base: "en", en: "x", _unused: true }]
      done()

  it "removes unused", (done) ->
    data = {
      locales: [
        { code: "en", name: "English" }
      ]
      strings: [
        { _base: "en", en: "b", _unused: true }
      ]
    }
    extractor.updateLocalizations [__dirname + '/requireSample'], data, {}, ->
      assert.deepEqual _.sortBy(data.strings, "en"), [{ _base: "en", en: "a" }, { _base: "en", en: "b" }, { _base: "en", en: "c" }, { _base: "en", en: "d" }]
      done()
