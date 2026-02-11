import { clsxTwMerge } from '@app/utils'

import { LoadingSpinner } from '../loaders'

type Variant = 'filled' | 'outlined' | 'text' | 'link'
type Color = 'primary' | 'secondary' | 'red' | 'green'
type Size = 'xxs' | 'xs' | 'sm' | 'md' | 'lg'

export type ButtonProps<T extends React.ElementType = 'button'> = {
  children: React.ReactNode
  variant?: Variant
  size?: Size
  color?: Color
  className?: string
  as?: T
  isLoading?: boolean
  loadingText?: string
} & React.ComponentPropsWithoutRef<T>

const sizeClasses = {
  xxs: 'px-8 py-4 text-xxs gap-4',
  xs: 'px-10 py-5 text-xs gap-6',
  sm: 'px-14 py-6 text-sm',
  md: 'px-18 py-8 text-base',
  lg: 'px-24 py-10 text-lg'
} as const

const colorVariantClasses = {
  primary: {
    filled: 'text-primary-80 bg-primary-30 hover:bg-primary-40 disabled:hover:bg-primary-30',
    outlined:
      'text-primary-30 border border-primary-30 hover:bg-primary-60 disabled:hover:bg-transparent',
    text: 'text-primary-30 hover:bg-primary-60 disabled:hover:bg-transparent',
    link: 'text-primary-30 hover:text-primary-40 p-0 hover:underline disabled:hover:text-primary-30'
  },
  secondary: {
    filled: 'text-gray-100 bg-primary-60/80 hover:bg-primary-60/60 disabled:hover:bg-primary-60',
    outlined:
      'text-gray-100 border border-border hover:bg-primary-60/60 disabled:hover:bg-transparent',
    text: 'text-gray-100 hover:bg-primary-60/60 disabled:hover:bg-transparent',
    link: 'text-gray-100 p-0 hover:underline disabled:hover:text-primary-30'
  },
  red: {
    filled: 'text-primary-80 bg-red-400 hover:bg-red-A700 disabled:hover:bg-red-400',
    outlined:
      'text-red-400 border border-red-400 hover:bg-primary-60 disabled:hover:bg-transparent',
    text: 'text-red-400 hover:bg-primary-60 disabled:hover:bg-transparent',
    link: 'text-red-400 hover:text-red-500 p-0 hover:underline disabled:hover:text-red-400'
  },
  green: {
    filled: 'text-primary-80 bg-green-400 hover:bg-green-A700 disabled:hover:bg-green-400',
    outlined:
      'text-green-400 border border-green-400 hover:bg-primary-60 disabled:hover:bg-transparent',
    text: 'text-green-400 hover:bg-primary-60 disabled:hover:bg-transparent',
    link: 'text-green-400 hover:text-green-500 p-0 hover:underline disabled:hover:text-green-400'
  }
} as const

export default function Button<T extends React.ElementType = 'button'>({
  children,
  variant = 'filled',
  color = 'primary',
  size = 'md',
  className,
  as,
  isLoading = false,
  loadingText = 'Loading...',
  ...restProps
}: ButtonProps<T>) {
  const Component: React.ElementType = as || 'button'

  return (
    <Component
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...restProps}
      className={clsxTwMerge(
        'flex w-full items-center justify-center gap-8 whitespace-nowrap rounded font-space font-medium transition duration-300 disabled:cursor-not-allowed disabled:no-underline disabled:opacity-30',
        sizeClasses[size],
        colorVariantClasses[color][variant],
        className
      )}
    >
      {isLoading ? (
        <div className="flex items-center gap-8">
          <LoadingSpinner />
          <span>{loadingText}</span>
        </div>
      ) : (
        children
      )}
    </Component>
  )
}
