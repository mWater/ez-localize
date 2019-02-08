var fs, xlsx, _;

fs = require('fs');

xlsx = require('xlsx');

_ = require('lodash');

module.exports = function(oldDataFile, xlsxFile, newDataFile) {
  var base, base64File, firstRow, i, jsonEntry, jsonLocales, jsonMap, keyString, locale, localizations, row, rows, stringData, worksheet, xlsxData, xlsxLocales, xlsxMap, xlsxString, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _len5, _m, _n, _ref, _ref1, _ref2, _ref3, _ref4;
  base64File = fs.readFileSync(xlsxFile, 'base64');
  xlsxData = xlsx(base64File);
  worksheet = xlsxData.worksheets[0];
  rows = worksheet.data;
  xlsxLocales = [];
  firstRow = rows[0];
  _ref = firstRow.slice(1);
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    locale = _ref[_i];
    xlsxLocales.push(locale.value);
  }
  xlsxMap = {};
  jsonMap = {};
  localizations = JSON.parse(fs.readFileSync(oldDataFile, 'utf-8'));
  jsonLocales = [];
  _ref1 = localizations.locales;
  for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
    locale = _ref1[_j];
    jsonLocales.push(locale.code);
    xlsxMap[locale.code] = {};
    jsonMap[locale.code] = {};
  }
  _ref2 = rows.slice(1);
  for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
    row = _ref2[_k];
    if (!row || !row[0] || !row[0].value) {
      continue;
    }
    base = row[0].value;
    keyString = row[xlsxLocales.indexOf(base) + 1].value;
    if (xlsxMap[base][keyString] != null) {
      throw new Error('XLSX: Twice the same word using the same base: ' + base + ' word: ' + keyString);
    }
    xlsxMap[base][keyString] = row;
  }
  _ref3 = localizations.strings;
  for (_l = 0, _len3 = _ref3.length; _l < _len3; _l++) {
    stringData = _ref3[_l];
    base = stringData._base;
    keyString = stringData[base];
    if (jsonMap[base][keyString] != null) {
      throw new Error('JSON: Twice the same word using the same base: ' + base + ' word: ' + keyString);
    }
    jsonMap[base][keyString] = stringData;
  }
  _ref4 = rows.slice(1);
  for (_m = 0, _len4 = _ref4.length; _m < _len4; _m++) {
    row = _ref4[_m];
    if (!row || !row[0] || !row[0].value) {
      continue;
    }
    base = row[0].value;
    xlsxString = row[xlsxLocales.indexOf(base) + 1].value;
    jsonEntry = jsonMap[base][xlsxString];
    if (jsonEntry) {
      for (i = _n = 0, _len5 = xlsxLocales.length; _n < _len5; i = ++_n) {
        locale = xlsxLocales[i];
        if (locale !== base) {
          if (row[i + 1] && row[i + 1].value && !jsonEntry._unused) {
            jsonEntry[locale] = row[i + 1].value;
          } else {
            if (!jsonEntry._unused) {
              console.log("Missing translation for base string " + xlsxString);
            }
          }
        }
      }
    } else {
      console.log("Translation for " + xlsxString + " (" + base + ") is not required");
    }
  }
  localizations.strings = _.sortBy(localizations.strings, function(l) {
    if (l._unused) {
      return 1;
    } else {
      return 0;
    }
  });
  fs.writeFileSync(newDataFile, JSON.stringify(localizations, null, 2), 'utf-8');
  return localizations;
};
