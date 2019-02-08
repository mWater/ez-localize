var fs, stringExtractor;

fs = require('fs');

stringExtractor = require('./stringExtractor');

exports.updateLocalizationFile = function(rootFile, dataFile, options, callback) {
  var localizations;
  if (fs.existsSync(dataFile)) {
    localizations = JSON.parse(fs.readFileSync(dataFile, 'utf-8'));
  } else {
    localizations = {};
  }
  return exports.updateLocalizations(rootFile, localizations, options, function() {
    fs.writeFileSync(dataFile, JSON.stringify(localizations, null, 2), 'utf-8');
    return callback();
  });
};

exports.updateLocalizations = function(rootFile, data, options, callback) {
  if (!data.locales) {
    data.locales = [
      {
        code: "en",
        name: "English"
      }
    ];
  }
  if (!data.strings) {
    data.strings = [];
  }
  return stringExtractor.findFromRootFile(rootFile, options, function(strs) {
    var item, known, loc, map, str, string, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _len5, _m, _n, _ref, _ref1, _ref2, _ref3;
    if (options.extraStrings) {
      strs = strs.concat(options.extraStrings);
    }
    map = {};
    _ref = data.strings;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      loc = _ref[_i];
      map[loc.en] = loc;
    }
    for (_j = 0, _len1 = strs.length; _j < _len1; _j++) {
      str = strs[_j];
      if (!map[str]) {
        string = {
          _base: "en",
          en: str
        };
        _ref1 = data.locales;
        for (_k = 0, _len2 = _ref1.length; _k < _len2; _k++) {
          loc = _ref1[_k];
          if (loc.code !== "en") {
            string[loc.code] = "";
          }
        }
        data.strings.push(string);
        map[string.en] = string;
      } else {
        if (!map[str]._base) {
          map[str]._base = "en";
        }
        _ref2 = data.locales;
        for (_l = 0, _len3 = _ref2.length; _l < _len3; _l++) {
          loc = _ref2[_l];
          if (loc.code !== "en" && (map[str][loc.code] == null)) {
            map[str][loc.code] = "";
          }
        }
      }
    }
    known = {};
    for (_m = 0, _len4 = strs.length; _m < _len4; _m++) {
      str = strs[_m];
      known[str] = true;
    }
    _ref3 = data.strings;
    for (_n = 0, _len5 = _ref3.length; _n < _len5; _n++) {
      item = _ref3[_n];
      if (!known[item.en]) {
        item._unused = true;
      } else {
        delete item._unused;
      }
    }
    return callback();
  });
};
