import { Locale, LocalizedString, LocalizerData } from ".";
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
    /** Locale defaults to "en" */
    constructor(data: LocalizerData, locale?: string);
    /** Set the current locale */
    setLocale(locale: string): void;
    getLocales(): Locale[];
    T(str: any, ...args: any[]): any;
    localizeString: (str: any, ...args: any[]) => any;
    localizePlainString: (str: any, ...args: any[]) => any;
    /** Determines if a string is localized */
    isLocalized(str: string): boolean;
    makeGlobal(handlebars: any): any;
}
