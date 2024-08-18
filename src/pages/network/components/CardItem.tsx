import { clsxTwMerge } from '@app/utils'

type Props = {
  children: React.ReactNode
  className?: string
}

export default function CardItem({ children, className }: Props) {
  return (
    <div className={clsxTwMerge('rounded-12 border-[1px] border-primary-60 bg-gray-80', className)}>
      {children}
    </div>
  )
}
