import Localizer, { LocalizationRequest } from './Localizer';
import { LocalizedString, Locale, removeUnusedStrings, updateLocalizedStrings, mergeLocalizerData } from './utils';
export { LocalizedString, Locale, removeUnusedStrings, updateLocalizedStrings, mergeLocalizerData };
/** Data structure that contains all data for a localizer */
export interface LocalizerData {
    /** List of locales supported by this localization */
    locales: Locale[];
    /** List of strings for this localization */
    strings: LocalizedString[];
    /** Base strings that are unused. They are still included in strings, but are not exported */
    unused?: string[];
}
export { default as Localizer } from './Localizer';
/** Function to localize a string. Usually exposed as "T" */
export declare type LocalizeString = ((str: TemplateStringsArray | LocalizedString | LocalizationRequest | string | null | undefined, ...args: any[]) => string) & ({
    locale: string;
    localizer: Localizer;
});
/** Create a default T that does nothing */
export declare const defaultT: LocalizeString;
declare const _default: {
    Localizer: typeof Localizer;
    defaultT: LocalizeString;
};
export default _default;
