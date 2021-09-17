"use strict";

var _, xlsx;

_ = require('lodash');
xlsx = require('xlsx'); // Extracts localized strings from a plain object

exports.extractLocalizedStrings = function (obj) {
  var item, j, key, len, strs, value;

  if (obj == null) {
    return [];
  } // Return self if string


  if (obj._base != null) {
    return [obj];
  }

  strs = []; // If array, concat each

  if (_.isArray(obj)) {
    for (j = 0, len = obj.length; j < len; j++) {
      item = obj[j];
      strs = strs.concat(this.extractLocalizedStrings(item));
    }
  } else if (_.isObject(obj)) {
    for (key in obj) {
      value = obj[key];
      strs = strs.concat(this.extractLocalizedStrings(value));
    }
  }

  return strs;
}; // Keep unique base language string combinations


exports.dedupLocalizedStrings = function (strs) {
  var j, key, keys, len, out, str;
  out = [];
  keys = {};

  for (j = 0, len = strs.length; j < len; j++) {
    str = strs[j];
    key = str._base + ":" + str[str._base];

    if (keys[key]) {
      continue;
    }

    keys[key] = true;
    out.push(str);
  }

  return out;
}; // Change the base locale for a set of localizations. 
// Works by making whatever the user sees as the toLocale base


exports.changeBaseLocale = function (strs, fromLocale, toLocale) {
  var displayed, j, len, str;

  for (j = 0, len = strs.length; j < len; j++) {
    str = strs[j]; // Get displayed 

    if (str[fromLocale]) {
      displayed = str[fromLocale];
      delete str[fromLocale];
    } else if (str[str._base]) {
      displayed = str[str._base];
      delete str[str._base];
    }

    if (displayed) {
      str[toLocale] = displayed;
      str._base = toLocale;
    }
  }
}; // Update a set of strings based on newly localized ones


exports.updateLocalizedStrings = function (strs, updates) {
  var j, k, key, len, len1, match, regularize, str, update, updateMap, value; // Regularize CR/LF and trim

  regularize = function regularize(str) {
    return str.replace(/\r/g, "").trim();
  }; // Map updates by key


  updateMap = {};

  for (j = 0, len = updates.length; j < len; j++) {
    update = updates[j];
    updateMap[update._base + ":" + regularize(update[update._base])] = update;
  } // Apply to each str


  for (k = 0, len1 = strs.length; k < len1; k++) {
    str = strs[k];
    match = updateMap[str._base + ":" + regularize(str[str._base])];

    if (match != null) {
      for (key in match) {
        value = match[key];

        if (key !== "_base" && key !== str._base && key !== "_unused") {
          // Also ignore unused
          // Remove blank values 
          if (value) {
            str[key] = regularize(value);
          } else {
            delete str[key];
          }
        }
      }
    }
  }
}; // Exports localized strings for specified locales to XLSX file.


exports.exportXlsx = function (locales, strs) {
  var addCell, base, columns, j, k, l, len, len1, len2, locale, localeCount, range, rows, str, wb, wbout, ws;
  wb = {
    SheetNames: [],
    Sheets: {}
  };
  range = {
    s: {
      c: 10000000,
      r: 10000000
    },
    e: {
      c: 0,
      r: 0
    }
  };
  ws = {};

  addCell = function addCell(row, column, value) {
    var cell, cell_ref; // Update ranges

    if (range.s.r > row) {
      range.s.r = row;
    }

    if (range.s.c > column) {
      range.s.c = column;
    }

    if (range.e.r < row) {
      range.e.r = row;
    }

    if (range.e.c < column) {
      range.e.c = column;
    } // Create cell


    cell = {
      v: value,
      t: 's'
    };
    cell_ref = xlsx.utils.encode_cell({
      c: column,
      r: row
    });
    return ws[cell_ref] = cell;
  };

  localeCount = 0;
  addCell(0, localeCount++, "Original Language");

  if (!_.findWhere(locales, {
    code: "en"
  })) {
    locales = locales.concat([{
      code: "en",
      name: "English"
    }]);
  } // Add locale columns


  for (j = 0, len = locales.length; j < len; j++) {
    locale = locales[j];
    addCell(0, localeCount++, locale.name);
  } // Add rows


  rows = 0;

  for (k = 0, len1 = strs.length; k < len1; k++) {
    str = strs[k];

    if (str._unused) {
      continue;
    }

    base = _.findWhere(locales, {
      code: str._base
    }); // Skip if unknown

    if (!base) {
      continue;
    }

    columns = 0;
    rows++;
    addCell(rows, columns++, base.name);

    for (l = 0, len2 = locales.length; l < len2; l++) {
      locale = locales[l];
      addCell(rows, columns++, str[locale.code] || "");
    }
  } // Encode range


  if (range.s.c < 10000000) {
    ws['!ref'] = xlsx.utils.encode_range(range);
  } // Add worksheet to workbook */


  wb.SheetNames.push("Translation");
  wb.Sheets["Translation"] = ws;
  wbout = xlsx.write(wb, {
    bookType: 'xlsx',
    bookSST: true,
    type: 'base64'
  });
  return wbout;
};

_ = require('lodash');
xlsx = require('xlsx'); // Import from base64 xlsx file, returning localized strings

exports.importXlsx = function (locales, xlsxFile) {
  var base, cell, col, i, j, k, lastCell, locale, ref, ref1, ref2, ref3, str, strs, totalColumns, totalRows, val, wb, ws;
  wb = xlsx.read(xlsxFile, {
    type: 'base64'
  });
  ws = wb.Sheets[wb.SheetNames[0]]; // If English is not a locale, append it, as built-in form elements
  // are specified in English

  if (!_.findWhere(locales, {
    code: "en"
  })) {
    locales = locales.concat([{
      code: "en",
      name: "English"
    }]);
  }

  strs = []; // Get the range of cells

  lastCell = ws["!ref"].split(":")[1];
  totalColumns = xlsx.utils.decode_cell(lastCell).c + 1;
  totalRows = xlsx.utils.decode_cell(lastCell).r + 1; // For each rows

  for (i = j = 1, ref = totalRows; 1 <= ref ? j < ref : j > ref; i = 1 <= ref ? ++j : --j) {
    // Get base locale
    base = _.findWhere(locales, {
      name: (ref1 = ws[xlsx.utils.encode_cell({
        c: 0,
        r: i
      })]) != null ? ref1.v : void 0
    }); // Skip if unknown

    if (!base) {
      continue;
    }

    str = {
      _base: base.code
    };

    for (col = k = 1, ref2 = totalColumns; 1 <= ref2 ? k < ref2 : k > ref2; col = 1 <= ref2 ? ++k : --k) {
      cell = ws[xlsx.utils.encode_cell({
        c: col,
        r: i
      })];

      if (!cell) {
        continue;
      }

      val = cell.v; // If value and not NaN, store in string

      if (val != null && val !== "" && val === val) {
        // Convert to string
        val = String(val); // Any invalid value is considered empty
      } else {
        val = "";
      } // Get locale of cell


      locale = _.findWhere(locales, {
        name: (ref3 = ws[xlsx.utils.encode_cell({
          c: col,
          r: 0
        })]) != null ? ref3.v : void 0
      });

      if (locale) {
        str[locale.code] = val;
      }
    } // Ignore if base language blank


    if (str[str._base]) {
      strs.push(str);
    }
  }

  return strs;
};