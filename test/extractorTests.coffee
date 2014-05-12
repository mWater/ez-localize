assert = require('chai').assert
extractor = require '../src/extractor'
coffeeify = require 'coffeeify'
hbsfy = require 'hbsfy'
_ = require 'underscore'

describe "updateLocalizations", ->
  it "creates localizations", (done) ->
    data = {}
    options = { extensions: ['.js', '.coffee'], transform: [coffeeify, hbsfy] }
    extractor.updateLocalizations __dirname + '/requireSample/a.js', data, options, ->
      assert.deepEqual data.locales, [{ code: "en", name: "English"}]
      assert.deepEqual _.sortBy(data.strings, "en"), [{ en: "a" }, { en: "b" }, { en: "c" }, { en: "d" }]
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
      assert.deepEqual _.sortBy(data.strings, "en"), [{ en: "a", es: "" }, { en: "b", es: "b-es" }, { en: "c", es: "" }, { en: "d", es: "" }]
      done()


  it "marks unused", (done) ->
    data = {
      locales: [
        { code: "en", name: "English" }
      ]
      strings: [
        { en: "x" }
      ]
    }
    options = { extensions: ['.js', '.coffee'], transform: [coffeeify, hbsfy] }
    extractor.updateLocalizations __dirname + '/requireSample/b.js', data, options, ->
      assert.deepEqual _.sortBy(data.strings, "en"), [{ en: "b" }, { en: "x", _unused: true }]
      done()

  it "removes unused", (done) ->
    data = {
      locales: [
        { code: "en", name: "English" }
      ]
      strings: [
        { en: "b", _unused: true }
      ]
    }
    options = { extensions: ['.js', '.coffee'], transform: [coffeeify, hbsfy] }
    extractor.updateLocalizations __dirname + '/requireSample/b.js', data, options, ->
      assert.deepEqual _.sortBy(data.strings, "en"), [{ en: "b"}]
      done()
