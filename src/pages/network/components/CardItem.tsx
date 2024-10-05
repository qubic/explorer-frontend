import { clsxTwMerge } from '@app/utils'

type Props = {
  children: React.ReactNode
  className?: string
}

export default function CardItem({ children, className }: Props) {
  return (
    <div className={clsxTwMerge('rounded-12 border-1 border-primary-60 bg-primary-70', className)}>
      {children}
    </div>
  )
}
