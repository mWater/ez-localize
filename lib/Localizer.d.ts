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
    localizeString: (str: string | null | undefined, ...args: any[]) => any;
    localizePlainString: (str: any, ...args: any[]) => any;
    /** Determines if a string is localized */
    isLocalized(str: string): boolean;
    makeGlobal(handlebars: any): void;
}
