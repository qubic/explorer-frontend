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
          variant === 'small' && 'w-full flex-col items-start gap-16 sm:flex-row sm:items-center'
        )}
      >
        <Icon className="h-24 w-24" />
        <div className="flex flex-col gap-8">
          <p className="font-space text-14 text-gray-50">{label}</p>
          <p className="font-space text-18 xs:text-24 sm:text-22">{value}</p>
        </div>
      </div>
    </CardItem>
  )
}
