"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateLocalizations = exports.updateLocalizationFile = void 0;
const fs_1 = __importDefault(require("fs"));
const stringExtractor = __importStar(require("./stringExtractor"));
/**
 * Updates a localization file on disk
 * rootDirs: directories to extract from. Can also include simple files
 * dataFile: e.g. "localizations.json"
 * options:
 *   extraStrings: include extra strings that are not in the root file
 * @param callback Called when complete
 */
function updateLocalizationFile(rootDirs, dataFile, options, callback) {
    // Read in data file
    let localizations;
    if (fs_1.default.existsSync(dataFile)) {
        localizations = JSON.parse(fs_1.default.readFileSync(dataFile, "utf-8"));
    }
    else {
        localizations = {};
    }
    // Update localizations
    updateLocalizations(rootDirs, localizations, options, function () {
        fs_1.default.writeFileSync(dataFile, JSON.stringify(localizations, null, 2), "utf-8");
        callback();
    });
}
exports.updateLocalizationFile = updateLocalizationFile;
/**
 * Updates localization data in place
 * rootDirs: directories to extract from. Can also include simple files
 * dataFile: e.g. "localizations.json"
 * options:
 *   extraStrings: include extra strings that are not in the root file
 * @param callback Called when complete
 */
function updateLocalizations(rootDirs, data, options, callback) {
    if (!data.locales) {
        data.locales = [{ code: "en", name: "English" }];
    }
    if (!data.strings) {
        data.strings = [];
    }
    // Get strings
    stringExtractor.findFromRootDirs(rootDirs, function (strs) {
        // Add extra strings
        if (options.extraStrings) {
            strs = strs.concat(options.extraStrings);
        }
        // Create map of english
        const map = {};
        for (const loc of data.strings) {
            map[loc.en] = loc;
        }
        for (const str of strs) {
            // Create item if doesn't exist
            if (!map[str]) {
                const string = { _base: "en", en: str };
                for (const loc of data.locales) {
                    if (loc.code !== "en") {
                        string[loc.code] = "";
                    }
                }
                data.strings.push(string);
                map[string.en] = string;
            }
            else {
                // Add base if not present
                if (!map[str]._base) {
                    map[str]._base = "en";
                }
                // Just add missing languages
                for (const loc of data.locales) {
                    if (loc.code !== "en" && map[str][loc.code] == null) {
                        map[str][loc.code] = "";
                    }
                }
            }
        }
        // Gather unused
        const known = {};
        for (const str of strs) {
            known[str] = true;
        }
        const unused = [];
        for (let item of data.strings) {
            if (!known[item.en]) {
                unused.push(item.en);
            }
        }
        data.unused = unused;
        callback();
    });
}
exports.updateLocalizations = updateLocalizations;
