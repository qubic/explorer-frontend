import { clsxTwMerge } from '@app/utils'
import type { ReactNode } from 'react'

type Props = Readonly<{
  children: ReactNode
  className?: string
}>

export default function PageLayout({ children, className }: Props) {
  return <div className={clsxTwMerge('mx-auto max-w-lg px-12 py-32', className)}>{children}</div>
}
