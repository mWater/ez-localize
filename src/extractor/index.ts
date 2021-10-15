import fs from "fs"
import { LocalizerData } from ".."
import * as stringExtractor from "./stringExtractor"

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
): void {
  // Read in data file
  let localizations: any
  if (fs.existsSync(dataFile)) {
    localizations = JSON.parse(fs.readFileSync(dataFile, "utf-8"))
  } else {
    localizations = {}
  }

  // Update localizations
  return exports.updateLocalizations(rootDirs, localizations, options, function () {
    fs.writeFileSync(dataFile, JSON.stringify(localizations, null, 2), "utf-8")
    return callback()
  })
}

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
): void {
  if (!data.locales) {
    data.locales = [{ code: "en", name: "English" }]
  }
  if (!data.strings) {
    data.strings = []
  }

  // Get strings
  return stringExtractor.findFromRootDirs(rootDirs, function (strs: any) {
    // Add extra strings
    let loc, str
    if (options.extraStrings) {
      strs = strs.concat(options.extraStrings)
    }

    // Create map of english
    const map = {}
    for (loc of data.strings) {
      map[loc.en] = loc
    }

    for (str of strs) {
      // Create item if doesn't exist
      if (!map[str]) {
        const string = { _base: "en", en: str }
        for (loc of data.locales) {
          if (loc.code !== "en") {
            string[loc.code] = ""
          }
        }
        data.strings.push(string)
        map[string.en] = string
      } else {
        // Add base if not present
        if (!map[str]._base) {
          map[str]._base = "en"
        }

        // Just add missing languages
        for (loc of data.locales) {
          if (loc.code !== "en" && map[str][loc.code] == null) {
            map[str][loc.code] = ""
          }
        }
      }
    }

    // Mark unused
    const known = {}
    for (str of strs) {
      known[str] = true
    }

    for (let item of data.strings) {
      if (!known[item.en]) {
        (item as any)._unused = true
      } else {
        delete item._unused
      }
    }

    return callback()
  })
}
