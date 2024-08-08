import { clsxTwMerge } from '@app/utils'
import type { FC } from 'react'
import CardItem from './CardItem'

export default function OverviewCardItem({
  icon: Icon,
  label,
  value,
  variant = 'normal'
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: FC<any>
  label: string | JSX.Element
  value: string
  variant?: 'normal' | 'small'
}) {
  return (
    <CardItem className="px-24 py-16">
      <div
        className={clsxTwMerge(
          'flex items-center gap-24',
          variant === 'small' && 'flex-col items-start sm:flex-row sm:items-center gap-16 w-full'
        )}
      >
        <Icon className="w-24 h-24" />
        <div className="flex flex-col gap-8">
          <p className="text-14 text-gray-50 font-space">{label}</p>
          <p className="text-18 xs:text-24 sm:text-22 font-space">{value}</p>
        </div>
      </div>
    </CardItem>
  )
}
