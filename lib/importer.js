"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
const fs_1 = __importDefault(require("fs"));
const lodash_1 = __importDefault(require("lodash"));
const utils_1 = require("./utils");
const utils_2 = require("./utils");
// oldDataFile: e.g. "localizations.json"
// xlsxFile: path of file to export
// newDataFile: can be the same as oldDataFile (different when testing)
function default_1(oldDataFile, xlsxFile, newDataFile) {
    // Read the xlsx file and get the locales
    const base64File = fs_1.default.readFileSync(xlsxFile, "base64");
    const localizations = JSON.parse(fs_1.default.readFileSync(oldDataFile, "utf-8"));
    const updates = (0, utils_1.importXlsx)(localizations.locales, base64File);
    (0, utils_2.updateLocalizedStrings)(localizations.strings, updates);
    // Sort by used
    localizations.strings = lodash_1.default.sortBy(localizations.strings, function (l) {
        if (l._unused) {
            return 1;
        }
        else {
            return 0;
        }
    });
    // Write the whole thing to a JSon file
    fs_1.default.writeFileSync(newDataFile, JSON.stringify(localizations, null, 2), "utf-8");
    return localizations;
}
exports.default = default_1;
