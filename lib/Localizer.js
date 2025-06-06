"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Localizer is a function that sets up global variable "T" which is
 * used to translate strings. Also sets up Handlebars helper with same name
 * Function "T" maps to Localizer "localizeString" function
 * Helper "T" maps to Localizer "localizeString" function
 */
class Localizer {
    /** Locale defaults to "en" */
    constructor(data, locale) {
        /**
         * Localize a single string of the form "some text {0} more text {1} etc", replacing the
         * parts with the arguments.
         *
         * Can also replace where the first parameter is an array for ES6 tagged templates.
         *
         * Can also localize to a specified locale with LocalizationRequest.
         */
        this.localizeString = (str, ...args) => {
            // Null is just pass-through
            if (str == null) {
                return str !== null && str !== void 0 ? str : null;
            }
            // Handle localization request
            if (typeof str === "object" && "text" in str) {
                return this.localizeStringRequest(str);
            }
            // Handle localized string
            if (typeof str === "object" && !Array.isArray(str) && str._base) {
                // Get localized string
                const locStr = str[this.locale] || str.en;
                return this.localizeString(locStr, ...args);
            }
            // True if object passed in as arg (react style)
            let hasObject = args.some(arg => arg && typeof arg === "object");
            // Handle ES6-style
            if (Array.isArray(str)) {
                // Change to format of standard localizer string
                let newStr = str[0];
                for (let i = 1; i < str.length; i++) {
                    newStr += "{" + (i - 1) + "}";
                    newStr += str[i];
                }
                str = newStr;
            }
            if (!hasObject) {
                return this.localizeStringRequest({ locale: this.locale, text: str, args });
            }
            else {
                // Find string, falling back to English
                let locstr;
                const item = this.englishMap[str];
                if (item && item[this.locale]) {
                    locstr = item[this.locale];
                }
                else {
                    locstr = str;
                }
                // Split and do react-style replacement where string is made into array
                const parts = locstr.split(/(\{\d+\})/);
                const output = [];
                for (let part of parts) {
                    if (part.match(/^\{\d+\}$/)) {
                        output.push(args[parseInt(part.substr(1, part.length - 2))]);
                    }
                    else {
                        output.push(part);
                    }
                }
                return output;
            }
        };
        /**
         * Localizes a plain string without React-style interpretation. Needed for handlebars as it passes extra arguments
         */
        this.localizePlainString = (str, ...args) => {
            return this.localizeStringRequest({ locale: this.locale, text: str, args });
        };
        this.data = data;
        this.locale = locale || "en";
        // Index strings by English if data present
        this.englishMap = {};
        if (data != null) {
            for (let str of this.data.strings) {
                this.englishMap[str.en] = str;
            }
        }
        const localizer = this;
        Object.defineProperty(this.localizeString, "locale", { get() { return localizer.locale; } });
        Object.defineProperty(this.localizeString, "localizer", { get() { return localizer; } });
        this.T = this.localizeString;
    }
    /** Set the current locale */
    setLocale(locale) {
        this.locale = locale;
    }
    getLocales() {
        return this.data.locales;
    }
    /**
     * Localizes a string based on a localization request.
     */
    localizeStringRequest(request) {
        var _a;
        let { locale, text, args } = request;
        if (text == null) {
            return null;
        }
        let textStr;
        if (typeof text === "object" && text._base) {
            // Get localized string
            const localizedStr = (_a = text[locale !== null && locale !== void 0 ? locale : this.locale]) !== null && _a !== void 0 ? _a : text.en;
            if (localizedStr == null) {
                return null;
            }
            textStr = localizedStr;
        }
        else {
            textStr = text;
        }
        // Find string, falling back to English
        let locstr;
        const item = this.englishMap[textStr];
        if (item && item[locale !== null && locale !== void 0 ? locale : this.locale]) {
            locstr = item[locale !== null && locale !== void 0 ? locale : this.locale];
        }
        else {
            locstr = textStr;
        }
        // Fill in arguments
        if (args) {
            for (let i = 0; i < args.length; i++) {
                locstr = locstr.replace("{" + i + "}", args[i]);
            }
        }
        // Strip context if present
        locstr = locstr.split("|")[0];
        return locstr;
    }
    /** Determines if a string is localized */
    isLocalized(str) {
        return str != null && this.englishMap[str] != null && this.englishMap[str][this.locale] != null;
    }
    // Makes this localizer global. handlebars is instance to register
    // helper on, null for none
    makeGlobal(handlebars) {
        global.T = this.T;
        if (handlebars != null) {
            handlebars.registerHelper("T", this.localizePlainString);
        }
    }
}
exports.default = Localizer;
