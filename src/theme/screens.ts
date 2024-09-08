import type { ThemeConfig } from 'tailwindcss/types/config'

// We want to access tailwind breakpoints for our custom hook without getting all tailwind config like we can do with resolveConfig
// https://tailwindcss.com/docs/configuration
export const breakpoints = {
  xxs: '320px',
  xs: '375px',
  sm: '560px',
  md: '768px',
  lg: '1280px',
  xl: '1920px',
  '827px': '827px',
  '948px': '948px',
  print: { raw: 'print' }
}

export const screens: ThemeConfig['screens'] = () => ({
  ...breakpoints
})

export default screens
