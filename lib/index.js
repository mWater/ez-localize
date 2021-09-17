"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultT = exports.Localizer = void 0;
var Localizer_1 = require("./Localizer");
Object.defineProperty(exports, "Localizer", { enumerable: true, get: function () { return __importDefault(Localizer_1).default; } });
// Create default localizer
var defaultLocalizer = new exports.Localizer();
/** Create a default T that does nothing */
exports.defaultT = defaultLocalizer.T;
