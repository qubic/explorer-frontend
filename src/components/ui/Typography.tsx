import { clsxTwMerge } from '@app/utils'

type Props = {
  children: React.ReactNode
  className?: string
}

export default function Typography({ children, className = '' }: Props) {
  const baseClassNames = 'text-sm'
  return <p className={clsxTwMerge(baseClassNames, className)}>{children}</p>
}

// import React, { ReactNode } from 'react'

// type TypographyVariant =
//   | 'h1'
//   | 'h2'
//   | 'h3'
//   | 'h4'
//   | 'h5'
//   | 'h6'
//   | 'subtitle1'
//   | 'subtitle2'
//   | 'body1'
//   | 'body2'
//   | 'caption'
//   | 'button'
//   | 'overline'

// interface TypographyProps {
//   variant?: TypographyVariant
//   component?: React.ElementType
//   className?: string
//   children: ReactNode
//   color?: string
//   align?: 'left' | 'center' | 'right' | 'justify'
//   gutterBottom?: boolean
// }

// const variantStyles: { [key in TypographyProps['variant']]: string } = {
//   h1: 'text-4xl font-bold',
//   h2: 'text-3xl font-bold',
//   h3: 'text-2xl font-bold',
//   h4: 'text-xl font-bold',
//   h5: 'text-lg font-bold',
//   h6: 'text-base font-bold',
//   subtitle1: 'text-lg font-semibold',
//   subtitle2: 'text-base font-semibold',
//   body1: 'text-base',
//   body2: 'text-sm',
//   caption: 'text-xs',
//   button: 'text-sm uppercase font-medium',
//   overline: 'text-xs uppercase'
// }

// export default function Typography({
//   variant = 'body1',
//   component,
//   children,
//   className = '',
//   color = 'text-black',
//   align = 'left',
//   gutterBottom = false
// }: TypographyProps) {
//   const Component = component || 'p'
//   const classes = `${variantStyles[variant]} ${color} text-${align} ${gutterBottom ? 'mb-4' : ''}`

//   return <Component className={clsxTwMerge(classes, className)}>{children}</Component>
// }
