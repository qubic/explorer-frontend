import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// the translations
// (tip move them in a JSON file and import them)
const resources = {
  en: {
    translation: {
      'Welcome to React': 'Welcome to React and react-i18next',
    },
  },
};

const getInitialLanguage = () => {
  // Check for a stored language in localStorage
  const storedLang = localStorage.getItem('lng');
  if (storedLang) {
    return storedLang;
  }

  // Get browser language
  const browserLang = navigator.language.split('-')[0]; // Extract base language, e.g., 'en' from 'en-US'
  if (browserLang) {
    return browserLang;
  }

  // Default to English if the browser language is not supported
  return 'en';
};

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: getInitialLanguage(),

    keySeparator: false, // we do not use keys in form messages.welcome

    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });

export default i18n;
