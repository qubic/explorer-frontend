import { clsxTwMerge } from '@app/utils'

type Variant = 'filled' | 'outlined' | 'text' | 'link'
type Color = 'primary'
type Size = 'sm' | 'md' | 'lg'

type Props<T extends React.ElementType = 'button'> = {
  children: React.ReactNode
  variant?: Variant
  size?: Size
  color?: Color
  className?: string
  as?: T
} & React.ComponentPropsWithoutRef<T>

const sizeClasses = {
  sm: 'px-24 py-8 text-xs',
  md: 'px-28 py-10 text-sm',
  lg: 'px-32 py-10 text-base'
} as const

const colorVariantClasses = {
  primary: {
    filled: 'text-primary-80 bg-primary-30 hover:bg-primary-40 hover:text-primary-80',
    outlined: 'text-primary-30 border border-primary-30 hover:bg-primary-60',
    text: 'text-white hover:bg-primary-60',
    link: 'text-primary-30 hover:text-primary-40 p-0 hover:underline'
  }
} as const

export default function Button<T extends React.ElementType = 'button'>({
  children,
  variant = 'filled',
  color = 'primary',
  size = 'md',
  className,
  as,
  ...restProps
}: Props<T>) {
  const Component: React.ElementType = as || 'button'

  return (
    <Component
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...restProps}
      className={clsxTwMerge(
        'w-fit rounded-8 font-space font-medium transition duration-300',
        sizeClasses[size],
        colorVariantClasses[color][variant],
        className
      )}
    >
      {children}
    </Component>
  )
}
