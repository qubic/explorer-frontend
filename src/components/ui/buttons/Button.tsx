import { clsxTwMerge } from '@app/utils'

type Variant = 'filled' | 'outlined' | 'text'

type Color = 'primary'

type Size = 'sm' | 'md' | 'lg'

type Props = {
  children: React.ReactNode
  variant?: Variant
  size?: Size
  color?: Color
} & React.ButtonHTMLAttributes<HTMLButtonElement>

const sizeClasses = {
  sm: 'px-24 py-8 text-xs',
  md: 'px-28 py-10 text-sm',
  lg: 'px-32 py-10 text-base'
} as const

const colorVariantClasses = {
  primary: {
    filled: 'text-primary-70 bg-primary-30 hover:bg-primary-40 hover:text-primary-70',
    outlined: 'text-primary-30 border border-primary-30 hover:bg-primary-60',
    text: 'text-white hover:bg-primary-60'
  }
} as const

export default function Button({
  children,
  variant = 'filled',
  color = 'primary',
  size = 'md',
  className,
  ...restProps
}: Props) {
  return (
    <button
      type="button"
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...restProps}
      className={clsxTwMerge(
        'w-fit rounded-8 font-space font-medium transition duration-300',
        colorVariantClasses[color][variant],
        sizeClasses[size],
        className
      )}
    >
      {children}
    </button>
  )
}
