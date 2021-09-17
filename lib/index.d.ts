/** Localizes strings. Must be called as T("some string") or someThing.T("some string") */
export declare type LocalizeString = (str: string, ...args: any[]) => string;
/** A single localized string */
export interface LocalizedString {
    /** e.g. "en" */
    _base: string;
    /** Localizations in each language */
    [language: string]: string;
}
export interface Locale {
    /** ISO code for locale (e.g. "en") */
    code: string;
    /** Local name for locale (e.g. Espanol) */
    name: string;
}
export interface LocalizerData {
    locales: Locale[];
    strings: LocalizedString[];
}
export { default as Localizer } from './Localizer';
/** Create a default T that does nothing */
export declare const defaultT: any;
