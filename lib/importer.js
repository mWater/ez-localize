var fs, importXlsx, updateLocalizedStrings, _;

fs = require('fs');

_ = require('lodash');

importXlsx = require('./utils').importXlsx;

updateLocalizedStrings = require('./utils').updateLocalizedStrings;

module.exports = function(oldDataFile, xlsxFile, newDataFile) {
  var base64File, localizations, updates;
  base64File = fs.readFileSync(xlsxFile, 'base64');
  localizations = JSON.parse(fs.readFileSync(oldDataFile, 'utf-8'));
  updates = importXlsx(localizations.locales, base64File);
  updateLocalizedStrings(localizations.strings, updates);
  localizations.strings = _.sortBy(localizations.strings, function(l) {
    if (l._unused) {
      return 1;
    } else {
      return 0;
    }
  });
  return fs.writeFileSync(newDataFile, JSON.stringify(localizations, null, 2), 'utf-8');
};
