export const lightPaletteText = {
  primary: 'rgb(17, 24, 39)',
  secondary: 'rgb(107, 114, 128)',
  disabled: 'rgb(149, 156, 169)',
};

export const darkPaletteText = {
  primary: 'rgb(255,255,255)',
  secondary: 'rgb(148, 163, 184)',
  disabled: 'rgb(156, 163, 175)',
};

const themesConfig = {
  defaultDark: {
    palette: {
      mode: 'dark',
      divider: 'rgba(241,245,249,.12)',
      text: darkPaletteText,
      common: {
        black: 'rgb(17, 24, 39)',
        white: 'rgb(255, 255, 255)',
      },
      primary: {
        light: '#64748b',
        main: '#334155',
        dark: '#0f172a',
        contrastText: darkPaletteText.primary,
      },
      secondary: {
        light: '#818cf8',
        main: '#4f46e5',
        dark: '#3730a3',
        contrastText: darkPaletteText.primary,
      },
      background: {
        paper: '#101820',
        default: '#101820',
      },
      error: {
        light: '#ffcdd2',
        main: '#f44336',
        dark: '#b71c1c',
      },
      status: {
        danger: 'orange',
      },
    },
  },
};

export default themesConfig;
