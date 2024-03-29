export interface LocalizedString {
    _base: string;
    [language: string]: string;
}
export interface Locale {
    /** ISO code for locale (e.g. "en") */
    code: string;
    /** Local name for locale (e.g. Espanol) */
    name: string;
}
/** Extracts localized strings from a plain object */
export declare function extractLocalizedStrings(obj: any): LocalizedString[];
/** Keep unique base language string combinations */
export declare function dedupLocalizedStrings(strs: LocalizedString[]): LocalizedString[];
/** Change the base locale for a set of localizations.
 * Works by making whatever the user sees as the toLocale base
 */
export declare function changeBaseLocale(strs: LocalizedString[], fromLocale: string, toLocale: string): void;
/** Update a set of strings based on newly localized ones */
export declare function updateLocalizedStrings(strs: LocalizedString[], updates: LocalizedString[]): void;
/** Exports localized strings for specified locales to XLSX file. Returns base64 */
export declare function exportXlsx(locales: Locale[], strs: LocalizedString[]): string;
/** Import from base64 excel */
export declare function importXlsx(locales: Locale[], xlsxFile: string): LocalizedString[];
