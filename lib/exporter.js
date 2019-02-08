var exportLocalizationFileToXlsx, fs, xlsx;

fs = require('fs');

xlsx = require('xlsx.js');

module.exports = exportLocalizationFileToXlsx = function(dataFile, xlsxFile) {
  var data, firstRow, locale, locales, localizations, row, rows, string, value, _i, _j, _k, _len, _len1, _len2, _ref, _ref1;
  localizations = JSON.parse(fs.readFileSync(dataFile, 'utf-8'));
  locales = [];
  firstRow = [];
  firstRow.push({
    value: "base",
    formatCode: "General"
  });
  _ref = localizations.locales;
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    locale = _ref[_i];
    locales.push(locale.code);
    firstRow.push({
      value: locale.code,
      formatCode: "General"
    });
  }
  rows = [firstRow];
  _ref1 = localizations.strings;
  for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
    string = _ref1[_j];
    if (string._unused) {
      continue;
    }
    row = [];
    row.push({
      value: string._base,
      formatCode: "General"
    });
    for (_k = 0, _len2 = locales.length; _k < _len2; _k++) {
      locale = locales[_k];
      value = string[locale];
      if (value == null) {
        value = "";
      }
      row.push({
        value: value,
        formatCode: "General"
      });
    }
    rows.push(row);
  }
  data = {
    worksheets: [
      {
        name: "Name",
        data: rows
      }
    ]
  };
  fs.writeFileSync(xlsxFile, xlsx(data).base64, 'base64');
  return rows;
};
