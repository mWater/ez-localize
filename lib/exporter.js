"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const utils_1 = require("./utils");
/**
 * Export file to XLSX
 * @param dataFile e.g. "localizations.json"
 * @param xlsxFile path of file to export
 */
function exportLocalizationFileToXlsx(dataFile, xlsxFile) {
    // Read in data file
    const localizations = JSON.parse(fs_1.default.readFileSync(dataFile, "utf-8"));
    // Create map of unused strings
    const unused = {};
    for (const str of localizations.unused || []) {
        unused[str] = true;
    }
    // Filter out unused strings
    const strings = localizations.strings.filter(str => !unused[str[str._base]]);
    const ws = (0, utils_1.exportXlsx)(localizations.locales, strings);
    return fs_1.default.writeFileSync(xlsxFile, ws, "base64");
}
exports.default = exportLocalizationFileToXlsx;
