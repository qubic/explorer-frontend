import { useTranslation } from 'react-i18next'

import { clsxTwMerge, formatString } from '@app/utils'
import CardItem from './CardItem'

type Props = {
  dataStatus: boolean
  tickStatus: boolean
  transactions: number
}

function StatusItem({
  label,
  value,
  isSuccess
}: {
  label: string
  value: string
  isSuccess?: boolean
}) {
  return (
    <div className="flex flex-col gap-8">
      <p className="font-space text-sm text-muted-foreground">{label}</p>
      <p
        className={clsxTwMerge(
          'font-space text-base',
          isSuccess ? 'text-success-40' : 'text-error-40',
          isSuccess === undefined && 'text-primary-20'
        )}
      >
        {value}
      </p>
    </div>
  )
}

export default function TickStatus({ dataStatus, tickStatus, transactions }: Props) {
  const { t } = useTranslation('network-page')

  const tickStatusText = tickStatus
    ? `${t('nonEmpty')} / ${t('executed')}`
    : `${t('empty')} / ${t('unexecuted')}`

  return (
    dataStatus && (
      <CardItem className="px-24 py-16">
        <div className="flex flex-wrap gap-24 md:gap-52">
          <StatusItem label={t('tickStatus')} value={tickStatusText} isSuccess={tickStatus} />
          <StatusItem label={t('numberOfTransactions')} value={formatString(transactions)} />
        </div>
      </CardItem>
    )
  )
}
