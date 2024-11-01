import fs from "fs"
import _ from "lodash"
import { importXlsx } from "./utils"
import { updateLocalizedStrings } from "./utils"

/**
 * Export file to XLSX
 * @param oldDataFile e.g. "localizations.json"
 * @param xlsxFile path of file to export
 * @param newDataFile can be the same as oldDataFile (different when testing)
 */
 export default function importLocalizationFileFromXlsx(oldDataFile: string, xlsxFile: string, newDataFile: string): void {
  // Read the xlsx file and get the locales
  const base64File = fs.readFileSync(xlsxFile, "base64")

  const localizations = JSON.parse(fs.readFileSync(oldDataFile, "utf-8"))

  const updates = importXlsx(localizations.locales, base64File)
  updateLocalizedStrings(localizations.strings, updates)

  // Write out the updated data
  fs.writeFileSync(newDataFile, JSON.stringify(localizations, null, 2), "utf-8")
  return localizations
}
