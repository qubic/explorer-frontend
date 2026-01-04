import { clsxTwMerge } from '@app/utils'

type Props = Readonly<{
  className?: string
  tag?: keyof JSX.IntrinsicElements
}>

export default function Skeleton({ className, tag }: Props) {
  const Component = tag || 'div'
  return (
    <Component className={clsxTwMerge('h-10 w-full animate-pulse rounded bg-muted', className)} />
  )
}
