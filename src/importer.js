// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
import fs from 'fs';
import _ from 'lodash';
import { importXlsx } from './utils';
import { updateLocalizedStrings } from './utils';

// oldDataFile: e.g. "localizations.json"
// xlsxFile: path of file to export
// newDataFile: can be the same as oldDataFile (different when testing)
export default function(oldDataFile, xlsxFile, newDataFile) {
  // Read the xlsx file and get the locales
  const base64File = fs.readFileSync(xlsxFile, 'base64');

  const localizations = JSON.parse(fs.readFileSync(oldDataFile, 'utf-8'));

  const updates = importXlsx(localizations.locales, base64File);
  updateLocalizedStrings(localizations.strings, updates);

  // Sort by used
  localizations.strings = _.sortBy(localizations.strings, function(l) { if (l._unused) { return 1; } else { return 0; } });

  // Write the whole thing to a JSon file
  fs.writeFileSync(newDataFile, JSON.stringify(localizations, null, 2), 'utf-8');
  return localizations;
};

 