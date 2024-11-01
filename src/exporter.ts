import fs from "fs"
import { exportXlsx } from "./utils"
import { LocalizerData } from "."

/**
 * Export file to XLSX
 * @param dataFile e.g. "localizations.json"
 * @param xlsxFile path of file to export
 */
 export default function exportLocalizationFileToXlsx(dataFile: string, xlsxFile: string): void {
  // Read in data file
  const localizations: LocalizerData = JSON.parse(fs.readFileSync(dataFile, "utf-8"))

  // Create map of unused strings
  const unused: Record<string, boolean> = {}
  for (const str of localizations.unused || []) {
    unused[str] = true
  }

  // Filter out unused strings
  const strings = localizations.strings.filter(str => !unused[str[str._base]])

  const ws = exportXlsx(localizations.locales, strings)
  return fs.writeFileSync(xlsxFile, ws, "base64")
}
