"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultT = exports.Localizer = void 0;
const Localizer_1 = __importDefault(require("./Localizer"));
var Localizer_2 = require("./Localizer");
Object.defineProperty(exports, "Localizer", { enumerable: true, get: function () { return __importDefault(Localizer_2).default; } });
// Create default localizer
var defaultLocalizer = new Localizer_1.default({ locales: [{ code: "en", name: "English" }], strings: [] });
/** Create a default T that does nothing */
exports.defaultT = defaultLocalizer.T;
// Support for non-ES6
exports.default = { Localizer: Localizer_1.default, defaultT: exports.defaultT };
