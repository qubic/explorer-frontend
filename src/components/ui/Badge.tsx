import { clsxTwMerge } from '@app/utils'

type Variant = 'filled' | 'outlined'
export type BadgeColor = 'primary' | 'success' | 'warning' | 'error'
type Size = 'xs' | 'sm' | 'md' | 'lg'

type Props<T extends React.ElementType = 'span'> = {
  children: React.ReactNode
  variant?: Variant
  color?: BadgeColor
  size?: Size
  className?: string
  as?: T
} & React.ComponentPropsWithoutRef<T>

const sizeClasses = {
  xs: 'px-8 py-2 text-xs',
  sm: 'px-8 py-2 text-sm',
  md: 'px-8 py-2 text-base',
  lg: 'px-10 py-2 text-lg'
} as const

const colorVariantClasses = {
  primary: {
    filled: 'bg-primary-75 text-primary-30',
    outlined: 'border border-primary-75 text-primary-30'
  },
  success: {
    filled: 'bg-success-90 text-success-40',
    outlined: 'border border-success-90 text-success-40'
  },
  warning: {
    filled: 'bg-warning-90 text-warning-40',
    outlined: 'border border-warning-90 text-warning-40'
  },
  error: {
    filled: 'bg-error-90 text-error-40',
    outlined: 'border border-error-90 text-error-40'
  }
} as const

export default function Badge<T extends React.ElementType = 'span'>({
  children,
  variant = 'filled',
  color = 'primary',
  size = 'md',
  className,
  as,
  ...restProps
}: Props<T>) {
  const Component: React.ElementType = as || 'span'

  return (
    <Component
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...restProps}
      className={clsxTwMerge(
        'inline-flex w-fit items-center rounded-full',
        sizeClasses[size],
        colorVariantClasses[color][variant],
        className
      )}
    >
      {children}
    </Component>
  )
}
