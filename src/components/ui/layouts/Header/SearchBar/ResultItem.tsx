import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { clsxTwMerge } from '@app/utils'

type ResultType = 'tick' | 'address' | 'transaction'

type Props = {
  type: ResultType
  result: string
  subInfo?: string
  link: string
  onClick?: () => void
}

const BADGE_STYLE = 'border-gray-50 bg-primary-60 text-gray-50'

function ResultItem({ type, link, result, subInfo, onClick }: Props) {
  const { t } = useTranslation('global')

  const getTypeLabel = (): string => {
    switch (type) {
      case 'tick':
        return t('tick')
      case 'address':
        return t('address')
      case 'transaction':
        return t('transaction')
      default:
        return type
    }
  }

  return (
    <Link
      className="flex flex-col gap-2 break-all rounded-12 px-12 py-6 hover:bg-primary-60"
      to={link}
      role="button"
      onClick={onClick}
    >
      <div className="flex items-center gap-8">
        <span className="font-sans text-xs">{result}</span>
        <span
          className={clsxTwMerge(
            'rounded-full border px-6 py-2 text-[10px] font-medium',
            BADGE_STYLE
          )}
        >
          {getTypeLabel()}
        </span>
      </div>
      {subInfo && (
        <span className="font-sans text-xs">
          <span className="text-gray-50">{subInfo}</span>
        </span>
      )}
    </Link>
  )
}

export default ResultItem
