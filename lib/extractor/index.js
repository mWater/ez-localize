"use strict";

var fs, stringExtractor;
fs = require('fs');
stringExtractor = require('./stringExtractor'); // rootDirs: directories to extract from. Can also include simple files
// dataFile: e.g. "localizations.json"
// options: 
//  plus: extraStrings which includes extra strings that are not in the root file

exports.updateLocalizationFile = function (rootDirs, dataFile, options, callback) {
  var localizations; // Read in data file

  if (fs.existsSync(dataFile)) {
    localizations = JSON.parse(fs.readFileSync(dataFile, 'utf-8'));
  } else {
    localizations = {};
  } // Update localizations


  return exports.updateLocalizations(rootDirs, localizations, options, function () {
    fs.writeFileSync(dataFile, JSON.stringify(localizations, null, 2), 'utf-8');
    return callback();
  });
};

exports.updateLocalizations = function (rootDirs, data, options, callback) {
  if (!data.locales) {
    data.locales = [{
      code: "en",
      name: "English"
    }];
  }

  if (!data.strings) {
    data.strings = [];
  } // Get strings


  return stringExtractor.findFromRootDirs(rootDirs, function (strs) {
    var i, item, j, k, known, l, len, len1, len2, len3, len4, len5, loc, m, map, n, ref, ref1, ref2, ref3, str, string; // Add extra strings

    if (options.extraStrings) {
      strs = strs.concat(options.extraStrings);
    } // Create map of english


    map = {};
    ref = data.strings;

    for (i = 0, len = ref.length; i < len; i++) {
      loc = ref[i];
      map[loc.en] = loc;
    }

    for (j = 0, len1 = strs.length; j < len1; j++) {
      str = strs[j]; // Create item if doesn't exist

      if (!map[str]) {
        string = {
          _base: "en",
          en: str
        };
        ref1 = data.locales;

        for (k = 0, len2 = ref1.length; k < len2; k++) {
          loc = ref1[k];

          if (loc.code !== "en") {
            string[loc.code] = "";
          }
        }

        data.strings.push(string);
        map[string.en] = string;
      } else {
        // Add base if not present
        if (!map[str]._base) {
          map[str]._base = "en";
        }

        ref2 = data.locales; // Just add missing languages

        for (l = 0, len3 = ref2.length; l < len3; l++) {
          loc = ref2[l];

          if (loc.code !== "en" && map[str][loc.code] == null) {
            map[str][loc.code] = "";
          }
        }
      }
    } // Mark unused


    known = {};

    for (m = 0, len4 = strs.length; m < len4; m++) {
      str = strs[m];
      known[str] = true;
    }

    ref3 = data.strings;

    for (n = 0, len5 = ref3.length; n < len5; n++) {
      item = ref3[n];

      if (!known[item.en]) {
        item._unused = true;
      } else {
        delete item._unused;
      }
    }

    return callback();
  });
};