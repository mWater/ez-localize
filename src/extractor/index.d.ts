import { LocalizerData } from "../.."

/**
 * Updates a localization file on disk
 * rootDirs: directories to extract from. Can also include simple files
 * dataFile: e.g. "localizations.json"
 * options:
 *   extraStrings: include extra strings that are not in the root file
 * @param callback Called when complete
 */
export function updateLocalizationFile(
  rootDirs: string[],
  dataFile: string,
  options: { extraStrings?: string[] },
  callback: () => void
): void

/**
 * Updates localization data in place
 * rootDirs: directories to extract from. Can also include simple files
 * dataFile: e.g. "localizations.json"
 * options:
 *   extraStrings: include extra strings that are not in the root file
 * @param callback Called when complete
 */
export function updateLocalizations(
  rootDirs: string[],
  data: LocalizerData,
  options: { extraStrings?: string[] },
  callback: () => void
): void
