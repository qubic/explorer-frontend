import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function clsxTwMerge(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export default { clsxTwMerge }
