// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
import { assert } from 'chai';
import extractor from '../src/extractor';
import coffeeify from 'coffeeify';
import hbsfy from 'hbsfy';
import _ from 'underscore';

describe("updateLocalizations", function() {
  this.timeout(20000);
  it("creates localizations", function(done) {
    const data = {};
    return extractor.updateLocalizations([__dirname + '/requireSample'], data, {}, function() {
      assert.deepEqual(data.locales, [{ code: "en", name: "English"}]);
      assert.deepEqual(_.sortBy(data.strings, "en"), [{ _base: "en", en: "a" }, { _base: "en", en: "b" }, { _base: "en", en: "c" }, { _base: "en", en: "d" }]);
      return done();
    });
  });

  it("preserves languages", function(done) {
    const data = {
      locales: [
        { code: "en", name: "English" },
        { code: "es", name: "Espanol" }
      ],
      strings: [
        { _base: "en", en: "b", es: "b-es" }
      ]
    };
    return extractor.updateLocalizations([__dirname + '/requireSample'], data, {}, function() {
      assert.deepEqual(data.locales, [{ code: "en", name: "English"}, { code: "es", name: "Espanol" }]);
      assert.deepEqual(_.sortBy(data.strings, "en"), [
        { _base: "en", en: "a", es: "" },
        { _base: "en", en: "b", es: "b-es" },
        { _base: "en", en: "c", es: "" },
        { _base: "en", en: "d", es: "" }
      ]);
      return done();
    });
  });


  it("marks unused", function(done) {
    const data = {
      locales: [
        { code: "en", name: "English" }
      ],
      strings: [
        { _base: "en", en: "x" }
      ]
    };
    return extractor.updateLocalizations([__dirname + '/requireSample'], data, {}, function() {
      assert.deepEqual(_.sortBy(data.strings, "en"), [{ _base: "en", en: "a" }, { _base: "en", en: "b" }, { _base: "en", en: "c" }, { _base: "en", en: "d" }, { _base: "en", en: "x", _unused: true }]);
      return done();
    });
  });

  return it("removes unused", function(done) {
    const data = {
      locales: [
        { code: "en", name: "English" }
      ],
      strings: [
        { _base: "en", en: "b", _unused: true }
      ]
    };
    return extractor.updateLocalizations([__dirname + '/requireSample'], data, {}, function() {
      assert.deepEqual(_.sortBy(data.strings, "en"), [{ _base: "en", en: "a" }, { _base: "en", en: "b" }, { _base: "en", en: "c" }, { _base: "en", en: "d" }]);
      return done();
    });
  });
});
