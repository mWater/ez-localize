var xlsx, _;

_ = require('lodash');

xlsx = require('xlsx');

exports.extractLocalizedStrings = function(obj) {
  var item, key, strs, value, _i, _len;
  if (obj == null) {
    return [];
  }
  if (obj._base != null) {
    return [obj];
  }
  strs = [];
  if (_.isArray(obj)) {
    for (_i = 0, _len = obj.length; _i < _len; _i++) {
      item = obj[_i];
      strs = strs.concat(this.extractLocalizedStrings(item));
    }
  } else if (_.isObject(obj)) {
    for (key in obj) {
      value = obj[key];
      strs = strs.concat(this.extractLocalizedStrings(value));
    }
  }
  return strs;
};

exports.dedupLocalizedStrings = function(strs) {
  var key, keys, out, str, _i, _len;
  out = [];
  keys = {};
  for (_i = 0, _len = strs.length; _i < _len; _i++) {
    str = strs[_i];
    key = str._base + ":" + str[str._base];
    if (keys[key]) {
      continue;
    }
    keys[key] = true;
    out.push(str);
  }
  return out;
};

exports.changeBaseLocale = function(strs, fromLocale, toLocale) {
  var displayed, str, _i, _len;
  for (_i = 0, _len = strs.length; _i < _len; _i++) {
    str = strs[_i];
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
};

exports.updateLocalizedStrings = function(strs, updates) {
  var key, match, regularize, str, update, updateMap, value, _i, _j, _len, _len1;
  regularize = function(str) {
    return str.replace(/\r/g, "").trim();
  };
  updateMap = {};
  for (_i = 0, _len = updates.length; _i < _len; _i++) {
    update = updates[_i];
    updateMap[update._base + ":" + regularize(update[update._base])] = update;
  }
  for (_j = 0, _len1 = strs.length; _j < _len1; _j++) {
    str = strs[_j];
    match = updateMap[str._base + ":" + regularize(str[str._base])];
    if (match != null) {
      for (key in match) {
        value = match[key];
        if (key !== "_base" && key !== str._base && key !== "_unused") {
          if (value) {
            str[key] = regularize(value);
          } else {
            delete str[key];
          }
        }
      }
    }
  }
};

exports.exportXlsx = function(locales, strs) {
  var addCell, base, columns, locale, localeCount, range, rows, str, wb, wbout, ws, _i, _j, _k, _len, _len1, _len2;
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
  addCell = function(row, column, value) {
    var cell, cell_ref;
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
    }
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
    locales = locales.concat([
      {
        code: "en",
        name: "English"
      }
    ]);
  }
  for (_i = 0, _len = locales.length; _i < _len; _i++) {
    locale = locales[_i];
    addCell(0, localeCount++, locale.name);
  }
  rows = 0;
  for (_j = 0, _len1 = strs.length; _j < _len1; _j++) {
    str = strs[_j];
    if (str._unused) {
      continue;
    }
    base = _.findWhere(locales, {
      code: str._base
    });
    if (!base) {
      continue;
    }
    columns = 0;
    rows++;
    addCell(rows, columns++, base.name);
    for (_k = 0, _len2 = locales.length; _k < _len2; _k++) {
      locale = locales[_k];
      addCell(rows, columns++, str[locale.code] || "");
    }
  }
  if (range.s.c < 10000000) {
    ws['!ref'] = xlsx.utils.encode_range(range);
  }
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

xlsx = require('xlsx');

exports.importXlsx = function(locales, xlsxFile) {
  var base, cell, col, i, lastCell, locale, str, strs, totalColumns, totalRows, val, wb, ws, _i, _j, _ref, _ref1;
  wb = xlsx.read(xlsxFile, {
    type: 'base64'
  });
  ws = wb.Sheets[wb.SheetNames[0]];
  if (!_.findWhere(locales, {
    code: "en"
  })) {
    locales = locales.concat([
      {
        code: "en",
        name: "English"
      }
    ]);
  }
  strs = [];
  lastCell = ws["!ref"].split(":")[1];
  totalColumns = xlsx.utils.decode_cell(lastCell).c + 1;
  totalRows = xlsx.utils.decode_cell(lastCell).r + 1;
  for (i = _i = 1; 1 <= totalRows ? _i < totalRows : _i > totalRows; i = 1 <= totalRows ? ++_i : --_i) {
    base = _.findWhere(locales, {
      name: (_ref = ws[xlsx.utils.encode_cell({
        c: 0,
        r: i
      })]) != null ? _ref.v : void 0
    });
    if (!base) {
      continue;
    }
    str = {
      _base: base.code
    };
    for (col = _j = 1; 1 <= totalColumns ? _j < totalColumns : _j > totalColumns; col = 1 <= totalColumns ? ++_j : --_j) {
      cell = ws[xlsx.utils.encode_cell({
        c: col,
        r: i
      })];
      if (!cell) {
        continue;
      }
      val = cell.v;
      if ((val != null) && val !== "" && val === val) {
        val = String(val);
      } else {
        val = "";
      }
      locale = _.findWhere(locales, {
        name: (_ref1 = ws[xlsx.utils.encode_cell({
          c: col,
          r: 0
        })]) != null ? _ref1.v : void 0
      });
      if (locale) {
        str[locale.code] = val;
      }
    }
    if (str[str._base]) {
      strs.push(str);
    }
  }
  return strs;
};
