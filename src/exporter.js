let exportLocalizationFileToXlsx;
import fs from 'fs';
import { exportXlsx } from './utils';

// dataFile: e.g. "localizations.json"
// xlsxFile: path of file to export
export default exportLocalizationFileToXlsx = function(dataFile, xlsxFile) {
  // Read in data file
  const localizations = JSON.parse(fs.readFileSync(dataFile, 'utf-8'));

  const ws = exportXlsx(localizations.locales, localizations.strings);
  return fs.writeFileSync(xlsxFile, ws, 'base64');
};
