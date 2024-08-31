import type { PluginUtils, ThemeConfig } from 'tailwindcss/types/config'

export const colors: ThemeConfig['colors'] = ({ colors: defaultColors }: PluginUtils) => ({
  inherit: defaultColors.inherit,
  current: defaultColors.current,
  transparent: 'transparent',
  black: '#22292F',
  white: '#fff',
  primary: {
    20: '#CCFCFF',
    30: '#61F0FE',
    40: '#40C4DE',
    50: '#019AB8',
    60: '#202E3C',
    70: '#151E27',
    80: '#101820'
  },
  gray: {
    50: '#808B9B',
    60: '#4B5565',
    70: '#202E3C',
    80: '#151E27',
    90: '#101820',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    DEFAULT: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
    A100: '#D5D5D5',
    A200: '#AAAAAA',
    A400: '#303030',
    A700: '#616161'
  },
  error: {
    30: '#F39CC6',
    40: '#F97066',
    90: '#381D1E'
  },
  success: {
    30: '#7ED890',
    40: '#47CD89',
    90: '#11322D'
  },
  warning: {
    40: '#CDA747',
    90: '#322D11'
  },
  info: {
    40: '#61F0FE',
    90: '#122B35'
  },
  red: {
    50: '#FFEBEE',
    100: '#FFCDD2',
    200: '#EF9A9A',
    300: '#E57373',
    400: '#EF5350',
    500: '#F44336',
    DEFAULT: '#F44336',
    600: '#E53935',
    700: '#D32F2F',
    800: '#C62828',
    900: '#B71C1C',
    A100: '#FF8A80',
    A200: '#FF5252',
    A400: '#FF1744',
    A700: '#D50000'
  }
})

export default colors
