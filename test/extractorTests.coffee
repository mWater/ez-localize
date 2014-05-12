assert = require('chai').assert
extractor = require '../src/extractor'
coffeeify = require 'coffeeify'
hbsfy = require 'hbsfy'

describe "updateLocalizations", ->
  it "creates localizations", (done) ->
    data = {}
    options = { extensions: ['.js', '.coffee'], transform: [coffeeify, hbsfy] }
    extractor.updateLocalizations __dirname + '/requireSample/a.js', data, options, ->
      assert.deepEqual data.locales, [{ code: "en", name: "English"}]
      assert.deepEqual data.strings, [{ en: "b" }, { en: "c" }, { en: "d" }, { en: "a" }]
      done()

  it "preserves languages", (done) ->
    data = {
      locales: [
        { code: "en", name: "English" }
        { code: "es", name: "Espanol" }
      ]
      strings: [
        { en: "b", es: "b-es" }
      ]
    }
    options = { extensions: ['.js', '.coffee'], transform: [coffeeify, hbsfy] }
    extractor.updateLocalizations __dirname + '/requireSample/a.js', data, options, ->
      assert.deepEqual data.locales, [{ code: "en", name: "English"}, { code: "es", name: "Espanol" }]
      assert.deepEqual data.strings, [{ en: "b", es: "b-es" }, { en: "c", es: "" }, { en: "d", es: "" }, { en: "a", es: "" }]
      done()
