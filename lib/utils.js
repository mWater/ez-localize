"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mergeLocalizerData = exports.removeUnusedStrings = exports.importXlsx = exports.exportXlsx = exports.updateLocalizedStrings = exports.changeBaseLocale = exports.dedupLocalizedStrings = exports.extractLocalizedStrings = void 0;
const lodash_1 = __importDefault(require("lodash"));
const xlsx_1 = __importDefault(require("xlsx"));
/** Extracts localized strings from a plain object */
function extractLocalizedStrings(obj) {
    if (obj == null) {
        return [];
    }
    // Return self if string
    if (obj._base != null) {
        return [obj];
    }
    let strs = [];
    // If array, concat each
    if (lodash_1.default.isArray(obj)) {
        for (let item of obj) {
            strs = strs.concat(extractLocalizedStrings(item));
        }
    }
    else if (lodash_1.default.isObject(obj)) {
        for (let key in obj) {
            const value = obj[key];
            strs = strs.concat(extractLocalizedStrings(value));
        }
    }
    return strs;
}
exports.extractLocalizedStrings = extractLocalizedStrings;
/** Keep unique base language string combinations */
function dedupLocalizedStrings(strs) {
    const out = [];
    const keys = {};
    for (let str of strs) {
        const key = str._base + ":" + str[str._base];
        if (keys[key]) {
            continue;
        }
        keys[key] = true;
        out.push(str);
    }
    return out;
}
exports.dedupLocalizedStrings = dedupLocalizedStrings;
/** Change the base locale for a set of localizations.
 * Works by making whatever the user sees as the toLocale base
 */
function changeBaseLocale(strs, fromLocale, toLocale) {
    for (let str of strs) {
        // Get displayed
        var displayed;
        if (str[fromLocale]) {
            displayed = str[fromLocale];
            delete str[fromLocale];
        }
        else if (str[str._base]) {
            displayed = str[str._base];
            delete str[str._base];
        }
        if (displayed) {
            str[toLocale] = displayed;
            str._base = toLocale;
        }
    }
}
exports.changeBaseLocale = changeBaseLocale;
/** Update a set of strings based on newly localized ones. Mutates the original strings */
function updateLocalizedStrings(strs, updates) {
    // Regularize CR/LF and trim
    const regularize = (str) => {
        if (!str) {
            return str;
        }
        return str.replace(/\r/g, "").trim();
    };
    // Map updates by key
    const updateMap = {};
    for (let update of updates) {
        updateMap[update._base + ":" + regularize(update[update._base])] = update;
    }
    // Apply to each str
    for (let str of strs) {
        const match = updateMap[str._base + ":" + regularize(str[str._base])];
        if (match != null) {
            for (let key in match) {
                const value = match[key];
                // Ignore _base and _unused (_unused is legacy)
                if (key !== "_base" && key !== str._base && key !== "_unused") {
                    // Also ignore unused
                    // Remove blank values
                    if (value) {
                        str[key] = regularize(value);
                    }
                    else {
                        delete str[key];
                    }
                }
            }
        }
    }
}
exports.updateLocalizedStrings = updateLocalizedStrings;
/** Exports localized strings for specified locales to XLSX file. Returns base64 */
function exportXlsx(locales, strs) {
    let locale;
    const wb = { SheetNames: [], Sheets: {} };
    const range = { s: { c: 10000000, r: 10000000 }, e: { c: 0, r: 0 } };
    const ws = {};
    function addCell(row, column, value) {
        // Update ranges
        if (range.s.r > row) {
            range.s.r = row;
        }
        if (range.s.c > column) {
            range.s.c = column;
        }
        if (range.e.r < row) {
            range.e.r = row;
        }
        if (range.e.c < column) {
            range.e.c = column;
        }
        // Create cell
        const cell = { v: value, t: "s" };
        const cell_ref = xlsx_1.default.utils.encode_cell({ c: column, r: row });
        return (ws[cell_ref] = cell);
    }
    let localeCount = 0;
    addCell(0, localeCount++, "Original Language");
    if (!lodash_1.default.findWhere(locales, { code: "en" })) {
        locales = locales.concat([{ code: "en", name: "English" }]);
    }
    // Add locale columns
    for (locale of locales) {
        addCell(0, localeCount++, locale.name);
    }
    // Add rows
    let rows = 0;
    for (let str of strs) {
        const base = lodash_1.default.findWhere(locales, { code: str._base });
        // Skip if unknown
        if (!base) {
            continue;
        }
        let columns = 0;
        rows++;
        addCell(rows, columns++, base.name);
        for (locale of locales) {
            addCell(rows, columns++, str[locale.code] || "");
        }
    }
    // Encode range
    if (range.s.c < 10000000) {
        ws["!ref"] = xlsx_1.default.utils.encode_range(range);
    }
    // Add worksheet to workbook */
    wb.SheetNames.push("Translation");
    wb.Sheets["Translation"] = ws;
    const wbout = xlsx_1.default.write(wb, { bookType: "xlsx", bookSST: true, type: "base64" });
    return wbout;
}
exports.exportXlsx = exportXlsx;
/** Import from base64 excel */
function importXlsx(locales, xlsxFile) {
    var _a, _b;
    const wb = xlsx_1.default.read(xlsxFile, { type: "base64" });
    const ws = wb.Sheets[wb.SheetNames[0]];
    // If English is not a locale, append it, as built-in form elements
    // are specified in English
    if (!lodash_1.default.findWhere(locales, { code: "en" })) {
        locales = locales.concat([{ code: "en", name: "English" }]);
    }
    const strs = [];
    // Get the range of cells
    const lastCell = ws["!ref"].split(":")[1];
    const totalColumns = xlsx_1.default.utils.decode_cell(lastCell).c + 1;
    const totalRows = xlsx_1.default.utils.decode_cell(lastCell).r + 1;
    // For each rows
    for (let i = 1, end = totalRows, asc = 1 <= end; asc ? i < end : i > end; asc ? i++ : i--) {
        // Get base locale
        const base = lodash_1.default.findWhere(locales, { name: (_a = ws[xlsx_1.default.utils.encode_cell({ c: 0, r: i })]) === null || _a === void 0 ? void 0 : _a.v });
        // Skip if unknown
        if (!base) {
            continue;
        }
        const str = { _base: base.code };
        for (let col = 1, end1 = totalColumns, asc1 = 1 <= end1; asc1 ? col < end1 : col > end1; asc1 ? col++ : col--) {
            const cell = ws[xlsx_1.default.utils.encode_cell({ c: col, r: i })];
            if (!cell) {
                continue;
            }
            let val = cell.v;
            // If value and not NaN, store in string
            if (val != null && val !== "" && val === val) {
                // Convert to string
                val = String(val);
            }
            else {
                // Any invalid value is considered empty
                val = "";
            }
            // Get locale of cell
            const locale = lodash_1.default.findWhere(locales, { name: (_b = ws[xlsx_1.default.utils.encode_cell({ c: col, r: 0 })]) === null || _b === void 0 ? void 0 : _b.v });
            if (locale) {
                str[locale.code] = val;
            }
        }
        // Ignore if base language blank
        if (str[str._base]) {
            strs.push(str);
        }
    }
    return strs;
}
exports.importXlsx = importXlsx;
/** Remove unused strings from a LocalizerData object */
function removeUnusedStrings(data) {
    const unused = {};
    for (const str of data.unused || []) {
        unused[str] = true;
    }
    return Object.assign(Object.assign({}, data), { strings: data.strings.filter(str => !unused[str[str._base]]), unused: [] });
}
exports.removeUnusedStrings = removeUnusedStrings;
/** Merge multiple LocalizerData objects. Merges locales and strings, then determines unused strings by
 * union of all unused strings from inputs then removing any strings that are actually used.
 * Prefers translations from later inputs over earlier ones. */
function mergeLocalizerData(inputs) {
    const merged = { locales: [], strings: [], unused: [] };
    // Merge locales
    merged.locales = lodash_1.default.uniq([...inputs.map(i => i.locales).flat()], "code");
    // Create a map of merged strings by <base locale>:<base string>
    const mergedStringsMap = {};
    // Merge strings
    for (const input of inputs) {
        for (const str of input.strings) {
            const key = str._base + ":" + str[str._base];
            if (mergedStringsMap[key]) {
                mergedStringsMap[key] = mergeLocalizedString(mergedStringsMap[key], str);
            }
            else {
                mergedStringsMap[key] = str;
            }
        }
    }
    merged.strings = Object.values(mergedStringsMap);
    // Determine unused strings by union of all unused strings from inputs
    // then removing any strings that are actually used
    const knownStrings = new Set(merged.strings.map(s => s[s._base]));
    merged.unused = lodash_1.default.uniq([...inputs.map(i => i.unused || []).flat()]);
    merged.unused = merged.unused.filter(str => !knownStrings.has(str));
    return merged;
}
exports.mergeLocalizerData = mergeLocalizerData;
/** Merge two localized strings. Assumes they have the same base locale. Prefers values from b over a */
function mergeLocalizedString(a, b) {
    if (a._base !== b._base) {
        throw new Error("Cannot merge strings with different base locales");
    }
    // Merge, ignoring _base and _unused and blank values
    const merged = Object.assign({}, a);
    for (const key in b) {
        if (key !== "_base" && key !== "_unused" && b[key]) {
            merged[key] = b[key];
        }
    }
    return merged;
}
