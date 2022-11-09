import Localizer from './Localizer';
import { LocalizedString, Locale } from './utils';
export { LocalizedString, Locale };
export interface LocalizerData {
    locales: Locale[];
    strings: LocalizedString[];
    /** Base strings that are unused. They are still included in strings  */
    unused?: string[];
}
export { default as Localizer } from './Localizer';
/** Function to localize a string. Usually exposed as "T" */
export declare type LocalizeString = ((str: TemplateStringsArray | string | null | undefined, ...args: any[]) => string) & ({
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
