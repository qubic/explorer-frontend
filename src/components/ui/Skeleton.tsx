import { clsxTwMerge } from '@app/utils'

type Props = {
  readonly className?: string
}

export default function Skeleton({ className }: Props) {
  return (
    <div className={clsxTwMerge('h-10 w-full animate-pulse rounded-12 bg-gray-60/30', className)} />
  )
}
