import Localizer from './Localizer';
import { LocalizedString, Locale } from './utils';
export { LocalizedString, Locale };
export interface LocalizerData {
    locales: Locale[];
    strings: LocalizedString[];
}
export { default as Localizer } from './Localizer';
/** Create a default T that does nothing */
export declare const defaultT: any;
declare const _default: {
    Localizer: typeof Localizer;
    defaultT: any;
};
export default _default;
