// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
let exportLocalizationFileToXlsx
import fs from "fs"
import { exportXlsx } from "./utils"

// dataFile: e.g. "localizations.json"
// xlsxFile: path of file to export
export default exportLocalizationFileToXlsx = function (dataFile: any, xlsxFile: any) {
  // Read in data file
  const localizations = JSON.parse(fs.readFileSync(dataFile, "utf-8"))

  const ws = exportXlsx(localizations.locales, localizations.strings)
  return fs.writeFileSync(xlsxFile, ws, "base64")
}