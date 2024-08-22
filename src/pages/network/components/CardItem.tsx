import { clsxTwMerge } from '@app/utils'

type Props = {
  children: React.ReactNode
  className?: string
}

export default function CardItem({ children, className }: Props) {
  return (
    <div className={clsxTwMerge('bg-primary-80 rounded-12 border-1 border-primary-60', className)}>
      {children}
    </div>
  )
}
