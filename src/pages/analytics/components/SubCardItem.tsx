import { clsxTwMerge } from '@app/utils'

type Props = {
  title: string
  content: React.ReactNode
  variant?: 'primary' | 'secondary'
}

export default function SubCardItem({ title, content, variant = 'primary' }: Props) {
  const isSecondaryVariant = variant === 'secondary'
  return (
    <div
      className={clsxTwMerge(
        'flex flex-col md:flex-row',
        isSecondaryVariant
          ? 'mb-12 gap-12 border-t-[1px] border-primary-60 pt-12'
          : 'gap-8 md:justify-between'
      )}
    >
      <p className={clsxTwMerge('font-space text-sm text-gray-50', isSecondaryVariant && 'w-120')}>
        {title}
      </p>
      {content}
    </div>
  )
}
