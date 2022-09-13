import Localizer from './Localizer';
import { LocalizedString, Locale } from './utils';
export { LocalizedString, Locale };
export interface LocalizerData {
    locales: Locale[];
    strings: LocalizedString[];
}
export { default as Localizer } from './Localizer';
/** Function to localize a string */
export declare type LocalizeString = (str: string, ...args: any[]) => string;
/** Create a default T that does nothing */
export declare const defaultT: LocalizeString;
declare const _default: {
    Localizer: typeof Localizer;
    defaultT: LocalizeString;
};
export default _default;
