import { clsxTwMerge } from '@app/utils'

type Props = {
  children: React.ReactNode
  className?: string
  tag?: React.ElementType
}

export default function CardItem({ children, className, tag }: Props) {
  const Component = tag || 'div'
  return (
    <Component
      className={clsxTwMerge('rounded-12 border-1 border-primary-60 bg-primary-70', className)}
    >
      {children}
    </Component>
  )
}
