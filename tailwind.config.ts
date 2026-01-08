import type { Config } from 'tailwindcss'

import aspectRatioPlugin from '@tailwindcss/aspect-ratio'
import formsPlugin from '@tailwindcss/forms'
import typographyPlugin from '@tailwindcss/typography'
import { colors } from './src/theme/colors'
import { screens } from './src/theme/screens'

// Use require for tailwind-scrollbar due to ESM/CJS interop issues with prettier-plugin-tailwindcss
// eslint-disable-next-line @typescript-eslint/no-var-requires
const scrollbarPlugin = require('tailwind-scrollbar')

const tailwindConfig: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'selector',
  theme: {
    screens,
    colors,
    fontFamily: {
      space: ['Space Grotesk', 'sans-serif'],
      sans: [
        'Inter var',
        'Roboto',
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        '"Helvetica Neue"',
        'Arial',
        '"Noto Sans"',
        'sans-serif',
        '"Apple Color Emoji"',
        '"Segoe UI Emoji"',
        '"Segoe UI Symbol"',
        '"Noto Color Emoji"'
      ],
      serif: ['ui-serif', 'Georgia', 'Cambria', '"Times New Roman"', 'Times', 'serif'],
      mono: [
        'ui-monospace',
        'SFMono-Regular',
        'Menlo',
        'Monaco',
        'Consolas',
        '"Liberation Mono"',
        '"Courier New"',
        'monospace'
      ]
    },
    spacing: {
      xs: '32rem',
      sm: '48rem',
      md: '64rem',
      lg: '80rem',
      xl: '96rem',
      '2xl': '65.6rem',
      '3xl': '76.8rem',
      '4xl': '89.6rem',
      '5xl': '102.4rem',
      '6xl': '115.2rem',
      '7xl': '128rem',
      px: '0.0625rem', // 1px
      0: '0rem', // 0px
      0.5: '0.03125rem', // 0.5px
      1: '0.0625rem', // 1px
      1.5: '0.09375rem', // 1.5px
      2: '0.125rem', // 2px
      2.5: '0.15625rem', // 2.5px
      3: '0.1875rem', // 3px
      3.5: '0.21875rem', // 3.5px
      4: '0.25rem', // 4px
      5: '0.3125rem', // 5px
      6: '0.375rem', // 6px
      7: '0.4375rem', // 7px
      8: '0.5rem', // 8px
      9: '0.5625rem', // 9px
      10: '0.625rem', // 10px
      11: '0.6875rem', // 11px
      12: '0.75rem', // 12px
      14: '0.875rem', // 14px
      16: '1rem', // 16px
      18: '1.125rem', // 18px
      20: '1.25rem', // 20px
      24: '1.5rem', // 24px
      28: '1.75rem', // 28px
      32: '2rem', // 32px
      36: '2.25rem', // 36px
      40: '2.5rem', // 40px
      44: '2.75rem', // 44px
      48: '3rem', // 48px
      52: '3.25rem', // 52px
      56: '3.5rem', // 56px
      60: '3.75rem', // 60px
      64: '4rem', // 64px
      68: '4.25rem', // 68px
      72: '4.5rem', // 72px
      76: '4.75rem', // 76px
      80: '5rem', // 80px
      82: '5.125rem', // 82px
      84: '5.25rem', // 84px
      88: '5.5rem', // 88px
      92: '5.75rem', // 92px
      96: '6rem', // 96px
      112: '7rem', // 112px
      120: '7.5rem', // 120px
      128: '8rem', // 128px
      136: '8.5rem', // 136px
      144: '9rem', // 144px
      160: '10rem', // 160px
      192: '12rem', // 192px
      200: '12.5rem', // 200px
      208: '13rem', // 208px
      216: '13.5rem', // 216px
      224: '14rem', // 224px
      256: '16rem', // 256px
      288: '18rem', // 288px
      320: '20rem', // 320px
      360: '22.5rem', // 360px
      384: '24rem', // 384px
      400: '25rem', // 400px
      480: '30rem', // 480px
      512: '32rem', // 512px
      640: '40rem' // 640px
    },
    borderRadius: {
      none: '0px',
      sm: '.2rem',
      DEFAULT: '.4rem',
      md: '.6rem',
      lg: '.8rem',
      xl: '1.2rem',
      '2xl': '1.6rem',
      '3xl': '2.4rem',
      full: '9999px',
      0: '0rem', // 0px
      2: '0.125rem', // 2px
      4: '0.25rem', // 4px
      6: '0.375rem', // 6px
      8: '0.5rem', // 8px
      10: '0.625rem', // 10px
      12: '0.75rem', // 12px
      14: '0.875rem', // 14px
      16: '1rem', // 16px
      20: '1.25rem', // 20px
      24: '1.5rem', // 24px
      28: '1.75rem', // 28px
      32: '2rem' // 32px
    },
    extend: {
      fontWeight: {
        100: '100',
        200: '200',
        300: '300',
        400: '400',
        500: '500',
        600: '600',
        700: '700',
        800: '800',
        900: '900'
      },
      fontSize: {
        xxs: ['0.625rem', { lineHeight: '1' }], // 10px
        10: ['0.625rem', { lineHeight: '1.25' }], // 10px
        11: ['0.6875rem', { lineHeight: '1.25' }], // 11px
        12: ['0.75rem', { lineHeight: '1.25' }], // 12px
        13: ['0.8125rem', { lineHeight: '1.25' }], // 13px
        14: ['0.875rem', { lineHeight: '1.25' }], // 14px
        15: ['0.9375rem', { lineHeight: '1.25' }], // 15px
        16: ['1rem', { lineHeight: '1.25' }], // 16px
        17: ['1.0625rem', { lineHeight: '1.25' }], // 17px
        18: ['1.125rem', { lineHeight: '1.25' }], // 18px
        19: ['1.1875rem', { lineHeight: '1.25' }], // 19px
        20: ['1.25rem', { lineHeight: '1.25' }], // 20px
        22: ['1.375rem', { lineHeight: '1.25' }], // 22px
        24: ['1.5rem', { lineHeight: '1.25' }], // 24px
        28: ['1.75rem', { lineHeight: '1.25' }], // 28px
        32: ['2rem', { lineHeight: '1.25' }], // 32px
        36: ['2.25rem', { lineHeight: '1.25' }], // 36px
        40: ['2.5rem', { lineHeight: '1.25' }], // 40px
        44: ['2.75rem', { lineHeight: '1.25' }], // 44px
        48: ['3rem', { lineHeight: '1.25' }], // 48px
        52: ['3.25rem', { lineHeight: '1.25' }], // 52px
        56: ['3.5rem', { lineHeight: '1.25' }], // 56px
        60: ['3.75rem', { lineHeight: '1.25' }], // 60px
        64: ['4rem', { lineHeight: '1.25' }], // 64px
        68: ['4.25rem', { lineHeight: '1.25' }], // 68px
        72: ['4.5rem', { lineHeight: '1.25' }], // 72px
        96: ['6rem', { lineHeight: '1.25' }], // 96px
        128: ['8rem', { lineHeight: '1.25' }] // 128px
      },
      lineHeight: {
        18: '1.8rem',
        20: '2.0rem',
        24: '2.4rem',
        26: '2.6rem',
        28: '2.8rem',
        32: '3.2rem',
        36: '3.6rem',
        40: '4rem'
      },
      minWidth: ({ theme }) => theme('spacing'),
      width: ({ theme }) => theme('spacing'),
      maxWidth: ({ theme }) => theme('spacing'),
      minHeight: ({ theme }) => theme('spacing'),
      height: ({ theme }) => theme('spacing'),
      maxHeight: ({ theme }) => theme('spacing'),
      margin: ({ theme }) => theme('spacing'),
      padding: ({ theme }) => theme('spacing'),
      gap: ({ theme }) => theme('spacing'),
      space: ({ theme }) => theme('spacing'),
      borderWidth: {
        DEFAULT: '1px',
        1: '1px',
        3: '3px'
      },
      zIndex: {
        '-1': '-1',
        99: '99',
        999: '999',
        9999: '9999'
      },
      animation: {
        progress: 'progress 1s infinite linear'
      },
      keyframes: {
        progress: {
          '0%': { transform: ' translateX(0) scaleX(0)' },
          '40%': { transform: 'translateX(0) scaleX(0.4)' },
          '100%': { transform: 'translateX(100%) scaleX(0.5)' }
        }
      },
      transformOrigin: {
        'left-right': '0% 50%'
      }
    }
  },
  plugins: [
    aspectRatioPlugin,
    formsPlugin,
    typographyPlugin,
    scrollbarPlugin({ nocompatible: true, preferredStrategy: 'pseudoelements' })
  ]
}

export default tailwindConfig
