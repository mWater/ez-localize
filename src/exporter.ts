import fs from "fs"
import { exportXlsx } from "./utils"

/**
 * Export file to XLSX
 * @param dataFile e.g. "localizations.json"
 * @param xlsxFile path of file to export
 */
 export default function exportLocalizationFileToXlsx(dataFile: string, xlsxFile: string): void {
  // Read in data file
  const localizations = JSON.parse(fs.readFileSync(dataFile, "utf-8"))

  const ws = exportXlsx(localizations.locales, localizations.strings)
  return fs.writeFileSync(xlsxFile, ws, "base64")
}
