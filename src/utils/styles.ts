import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

// Extending `twMerge` configuration to recognize custom Tailwind scales and classes to avoid false conflicts (E.g. `text-xxs` with `text-primary-30`)
const customTwMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [
        'text-xxs',
        'text-xs',
        'text-sm',
        'text-base',
        'text-lg',
        'text-xl',
        'text-2xl',
        'text-3xl',
        'text-4xl',
        'text-5xl',
        'text-6xl',
        'text-7xl',
        'text-8xl',
        'text-9xl'
      ]
    }
  }
})

export function clsxTwMerge(...inputs: ClassValue[]) {
  return customTwMerge(clsx(inputs))
}

export default { clsxTwMerge }
