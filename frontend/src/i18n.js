import i18n from 'i18next';
import Backend from 'i18next-xhr-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import { reactI18nextModule } from 'react-i18next';


export const options = {

    fallbackLng: 'en',

        debug: false,

        whitelist: ['en', 'ru'],

        ns: ['translations'],
        defaultNS: 'translations',

        interpolation: {
            escapeValue: false,
        },

        react: {
            wait: true
        }
}

i18n
    .use(Backend)
    .use(LanguageDetector)
    .use(reactI18nextModule)
    .init(options);

export default i18n;

