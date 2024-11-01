"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultT = exports.Localizer = exports.mergeLocalizerData = exports.updateLocalizedStrings = exports.removeUnusedStrings = void 0;
const Localizer_1 = __importDefault(require("./Localizer"));
const utils_1 = require("./utils");
Object.defineProperty(exports, "removeUnusedStrings", { enumerable: true, get: function () { return utils_1.removeUnusedStrings; } });
Object.defineProperty(exports, "updateLocalizedStrings", { enumerable: true, get: function () { return utils_1.updateLocalizedStrings; } });
Object.defineProperty(exports, "mergeLocalizerData", { enumerable: true, get: function () { return utils_1.mergeLocalizerData; } });
var Localizer_2 = require("./Localizer");
Object.defineProperty(exports, "Localizer", { enumerable: true, get: function () { return __importDefault(Localizer_2).default; } });
// Create default localizer
var defaultLocalizer = new Localizer_1.default({ locales: [{ code: "en", name: "English" }], strings: [] });
/** Create a default T that does nothing */
exports.defaultT = defaultLocalizer.T;
// Support for non-ES6
exports.default = { Localizer: Localizer_1.default, defaultT: exports.defaultT };
