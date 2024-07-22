import clsx from 'clsx'

type Props = {
  children: React.ReactNode
  className?: string
}

export default function CardItem({ children, className }: Props) {
  return (
    <div className={clsx('bg-gray-80 border-gray-70 border-[1px] rounded-12', className)}>
      {children}
    </div>
  )
}
