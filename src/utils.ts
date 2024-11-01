import _ from "lodash"
import xlsx from "xlsx"
import { LocalizerData } from "."

export interface LocalizedString {
  _base: string
  [language: string]: string // Localizations
}

export interface Locale {
  /** ISO code for locale (e.g. "en") */
  code: string

  /** Local name for locale (e.g. Espanol) */
  name: string
}

/** Extracts localized strings from a plain object */
export function extractLocalizedStrings(obj: any): LocalizedString[] {
  if (obj == null) {
    return []
  }

  // Return self if string
  if (obj._base != null) {
    return [obj]
  }

  let strs: any = []

  // If array, concat each
  if (_.isArray(obj)) {
    for (let item of obj) {
      strs = strs.concat(extractLocalizedStrings(item))
    }
  } else if (_.isObject(obj)) {
    for (let key in obj) {
      const value = obj[key]
      strs = strs.concat(extractLocalizedStrings(value))
    }
  }

  return strs
}

/** Keep unique base language string combinations */
export function dedupLocalizedStrings(strs: LocalizedString[]): LocalizedString[] {
  const out = []

  const keys: Record<string, boolean> = {}
  for (let str of strs) {
    const key = str._base + ":" + str[str._base]
    if (keys[key]) {
      continue
    }
    keys[key] = true
    out.push(str)
  }
  return out
}

/** Change the base locale for a set of localizations.
 * Works by making whatever the user sees as the toLocale base
 */
export function changeBaseLocale(strs: LocalizedString[], fromLocale: string, toLocale: string): void {
  for (let str of strs) {
    // Get displayed
    var displayed
    if (str[fromLocale]) {
      displayed = str[fromLocale]
      delete str[fromLocale]
    } else if (str[str._base]) {
      displayed = str[str._base]
      delete str[str._base]
    }

    if (displayed) {
      str[toLocale] = displayed
      str._base = toLocale
    }
  }
}

/** Update a set of strings based on newly localized ones. Mutates the original strings */
export function updateLocalizedStrings(strs: LocalizedString[], updates: LocalizedString[]): void {
  // Regularize CR/LF and trim
  const regularize = (str: any) => {
    if (!str) {
      return str
    }
    return str.replace(/\r/g, "").trim()
  }

  // Map updates by key
  const updateMap: Record<string, LocalizedString> = {}
  for (let update of updates) {
    updateMap[update._base + ":" + regularize(update[update._base])] = update
  }

  // Apply to each str
  for (let str of strs) {
    const match = updateMap[str._base + ":" + regularize(str[str._base])]
    if (match != null) {
      for (let key in match) {
        const value = match[key]
        // Ignore _base and _unused (_unused is legacy)
        if (key !== "_base" && key !== str._base && key !== "_unused") {
          // Also ignore unused
          // Remove blank values
          if (value) {
            str[key] = regularize(value)
          } else {
            delete str[key]
          }
        }
      }
    }
  }
}

/** Exports localized strings for specified locales to XLSX file. Returns base64 */
export function exportXlsx(locales: Locale[], strs: LocalizedString[]): string {
  let locale
  const wb: any = { SheetNames: [], Sheets: {} }

  const range = { s: { c: 10000000, r: 10000000 }, e: { c: 0, r: 0 } }
  const ws: any = {}

  function addCell(row: any, column: any, value: any) {
    // Update ranges
    if (range.s.r > row) {
      range.s.r = row
    }
    if (range.s.c > column) {
      range.s.c = column
    }
    if (range.e.r < row) {
      range.e.r = row
    }
    if (range.e.c < column) {
      range.e.c = column
    }

    // Create cell
    const cell = { v: value, t: "s" }
    const cell_ref = xlsx.utils.encode_cell({ c: column, r: row })
    return (ws[cell_ref] = cell)
  }

  let localeCount = 0
  addCell(0, localeCount++, "Original Language")

  if (!_.findWhere(locales, { code: "en" })) {
    locales = locales.concat([{ code: "en", name: "English" }])
  }

  // Add locale columns
  for (locale of locales) {
    addCell(0, localeCount++, locale.name)
  }

  // Add rows
  let rows = 0
  for (let str of strs) {
    const base = _.findWhere(locales, { code: str._base })

    // Skip if unknown
    if (!base) {
      continue
    }

    let columns = 0
    rows++

    addCell(rows, columns++, base.name)
    for (locale of locales) {
      addCell(rows, columns++, str[locale.code] || "")
    }
  }

  // Encode range
  if (range.s.c < 10000000) {
    ws["!ref"] = xlsx.utils.encode_range(range)
  }

  // Add worksheet to workbook */
  wb.SheetNames.push("Translation")
  wb.Sheets["Translation"] = ws

  const wbout = xlsx.write(wb, { bookType: "xlsx", bookSST: true, type: "base64" })
  return wbout
}

/** Import from base64 excel */
export function importXlsx(locales: Locale[], xlsxFile: string): LocalizedString[] {
  const wb = xlsx.read(xlsxFile, { type: "base64" })

  const ws = wb.Sheets[wb.SheetNames[0]]!

  // If English is not a locale, append it, as built-in form elements
  // are specified in English
  if (!_.findWhere(locales, { code: "en" })) {
    locales = locales.concat([{ code: "en", name: "English" }])
  }

  const strs = []

  // Get the range of cells
  const lastCell = ws["!ref"]!.split(":")[1]

  const totalColumns = xlsx.utils.decode_cell(lastCell).c + 1
  const totalRows = xlsx.utils.decode_cell(lastCell).r + 1

  // For each rows
  for (let i = 1, end = totalRows, asc = 1 <= end; asc ? i < end : i > end; asc ? i++ : i--) {
    // Get base locale
    const base = _.findWhere(locales, { name: ws[xlsx.utils.encode_cell({ c: 0, r: i })]?.v })
    // Skip if unknown
    if (!base) {
      continue
    }

    const str: LocalizedString = { _base: base.code }

    for (let col = 1, end1 = totalColumns, asc1 = 1 <= end1; asc1 ? col < end1 : col > end1; asc1 ? col++ : col--) {
      const cell = ws[xlsx.utils.encode_cell({ c: col, r: i })]

      if (!cell) {
        continue
      }

      let val = cell.v

      // If value and not NaN, store in string
      if (val != null && val !== "" && val === val) {
        // Convert to string
        val = String(val)
      } else {
        // Any invalid value is considered empty
        val = ""
      }

      // Get locale of cell
      const locale = _.findWhere(locales, { name: ws[xlsx.utils.encode_cell({ c: col, r: 0 })]?.v })
      if (locale) {
        str[locale.code] = val
      }
    }

    // Ignore if base language blank
    if (str[str._base]) {
      strs.push(str)
    }
  }

  return strs
}

/** Remove unused strings from a LocalizerData object */
export function removeUnusedStrings(data: LocalizerData): LocalizerData {
  const unused: Record<string, boolean> = {}
  for (const str of data.unused || []) {
    unused[str] = true
  }

  return {
    ...data,
    strings: data.strings.filter(str => !unused[str[str._base]]),
    unused: []
  }
}

/** Merge multiple LocalizerData objects. Merges locales and strings, then determines unused strings by 
 * union of all unused strings from inputs then removing any strings that are actually used.
 * Prefers translations from later inputs over earlier ones. */
export function mergeLocalizerData(inputs: LocalizerData[]): LocalizerData {
  const merged: LocalizerData = { locales: [], strings: [], unused: [] }

  // Merge locales
  merged.locales = _.uniq([...inputs.map(i => i.locales).flat()], "code")

  // Create a map of merged strings by <base locale>:<base string>
  const mergedStringsMap: Record<string, LocalizedString> = {}

  // Merge strings
  for (const input of inputs) {
    for (const str of input.strings) {
      const key = str._base + ":" + str[str._base]
      if (mergedStringsMap[key]) {
        mergedStringsMap[key] = mergeLocalizedString(mergedStringsMap[key], str)
      } else {
        mergedStringsMap[key] = str
      }
    }
  }

  merged.strings = Object.values(mergedStringsMap)
  
  // Determine unused strings by union of all unused strings from inputs
  // then removing any strings that are actually used
  const knownStrings = new Set(merged.strings.map(s => s[s._base]))
  merged.unused = _.uniq([...inputs.map(i => i.unused || []).flat()])
  merged.unused = merged.unused.filter(str => !knownStrings.has(str))

  return merged
}

/** Merge two localized strings. Assumes they have the same base locale. Prefers values from b over a */
function mergeLocalizedString(a: LocalizedString, b: LocalizedString): LocalizedString {
  if (a._base !== b._base) {
    throw new Error("Cannot merge strings with different base locales")
  }

  // Merge, ignoring _base and _unused and blank values
  const merged: LocalizedString = { ...a }
  for (const key in b) {
    if (key !== "_base" && key !== "_unused" && b[key]) {
      merged[key] = b[key]
    }
  }
  
  return merged
}
