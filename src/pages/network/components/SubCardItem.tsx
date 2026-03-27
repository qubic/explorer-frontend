import { clsxTwMerge } from '@app/utils'

type Props = {
  title: React.ReactNode
  content: React.ReactNode
  variant?: 'primary' | 'secondary'
  hideTopBorder?: boolean
}

export default function SubCardItem({
  title,
  content,
  variant = 'primary',
  hideTopBorder = false
}: Props) {
  const isSecondaryVariant = variant === 'secondary'
  return (
    <div
      className={clsxTwMerge(
        'flex flex-col md:flex-row',
        isSecondaryVariant
          ? 'mb-12 gap-12 border-t-[1px] border-primary-60 pt-12'
          : 'gap-8 md:justify-between',
        hideTopBorder && 'border-t-0 pt-0'
      )}
    >
      <div
        className={clsxTwMerge('font-space text-sm text-gray-50', isSecondaryVariant && 'w-120')}
      >
        {title}
      </div>
      {content}
    </div>
  )
}
