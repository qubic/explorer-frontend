import { clsxTwMerge } from '@app/utils'
import type { ReactNode } from 'react'

type Props = Readonly<{
  children: ReactNode
  className?: string
}>

export default function PageLayout({ children, className }: Props) {
  return (
    <div className={clsxTwMerge('px-16 py-32 md:px-24 lg:px-80 xl:px-128', className)}>
      {children}
    </div>
  )
}
