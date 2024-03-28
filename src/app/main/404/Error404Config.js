import i18next from 'i18next';
import en from './i18n/en';
import Error404Page from './Error404Page';

i18next.addResourceBundle('en', 'error404Page', en);

const Error404Config = {
  settings: {
    layout: {
      config: {
        navbar: {
          display: false,
        },
        toolbar: {
          display: false,
        },
        footer: {
          display: false,
        },
        leftSidePanel: {
          display: false,
        },
        rightSidePanel: {
          display: false,
        },
      },
    },
  },
  routes: [
    {
      path: '404',
      element: <Error404Page />,
    },
  ],
};

export default Error404Config;
