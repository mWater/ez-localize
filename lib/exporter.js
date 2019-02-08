var exportLocalizationFileToXlsx, exportXlsx, fs;

fs = require('fs');

exportXlsx = require('./utils').exportXlsx;

module.exports = exportLocalizationFileToXlsx = function(dataFile, xlsxFile) {
  var localizations, ws;
  localizations = JSON.parse(fs.readFileSync(dataFile, 'utf-8'));
  ws = exportXlsx(localizations.locales, localizations.strings);
  return fs.writeFileSync(xlsxFile, ws, 'base64');
};
