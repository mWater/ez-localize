import { Locale, LocalizedString, LocalizerData, LocalizeString } from ".";
/**
 * Localizer is a function that sets up global variable "T" which is
 * used to translate strings. Also sets up Handlebars helper with same name
 * Function "T" maps to Localizer "localizeString" function
 * Helper "T" maps to Localizer "localizeString" function
 */
export default class Localizer {
    data: LocalizerData;
    /** Current locale */
    locale: string;
    englishMap: {
        [english: string]: LocalizedString;
    };
    T: LocalizeString;
    /** Locale defaults to "en" */
    constructor(data: LocalizerData, locale?: string);
    /** Set the current locale */
    setLocale(locale: string): void;
    getLocales(): Locale[];
    /**
     * Localize a single string of the form "some text {0} more text {1} etc", replacing the
     * parts with the arguments.
     *
     * Can also replace where the first parameter is an array for ES6 tagged templates.
     *
     * Can also localize to a specified locale with LocalizationRequest.
     */
    localizeString: (str: TemplateStringsArray | LocalizedString | LocalizationRequest | string | null | undefined, ...args: any[]) => string | null;
    /**
     * Localizes a plain string without React-style interpretation. Needed for handlebars as it passes extra arguments
     */
    localizePlainString: (str: any, ...args: any[]) => string | null;
    /**
     * Localizes a string based on a localization request.
     */
    private localizeStringRequest;
    /** Determines if a string is localized */
    isLocalized(str: string): boolean;
    makeGlobal(handlebars: any): void;
}
/**
 * Localization request
 */
export interface LocalizationRequest {
    /** Locale to localize to. e.g. "en" or "fr" */
    locale: string;
    /** Text to localize in format of "some text {0} more text {1} etc" */
    text: string;
    /** Arguments to substitute into the localized string */
    args?: any[];
}
