import { memo } from 'react'
import { useTranslation } from 'react-i18next'

import { CardItem } from '@app/pages/network/components'
import { formatString } from '@app/utils'
import type { FeeReserveData } from '../mock-data'

type Props = {
  data: FeeReserveData
}

function FeeReserveStats({ data }: Props) {
  const { t } = useTranslation('network-page')

  const epochChange = data.currentBalance - data.epochStartBalance
  const epochChangePercent = ((epochChange / data.epochStartBalance) * 100).toFixed(2)

  return (
    <div className="grid gap-16 sm:grid-cols-2 lg:grid-cols-4">
      <CardItem className="p-16">
        <p className="text-xs text-gray-50">{t('currentBalance')}</p>
        <p className="mt-4 font-space text-20 font-500">
          {formatString(data.currentBalance)} <span className="text-sm text-gray-50">QUBIC</span>
        </p>
      </CardItem>

      <CardItem className="p-16">
        <p className="text-xs text-gray-50">{t('epochStartBalance')}</p>
        <p className="mt-4 font-space text-20 font-500">
          {formatString(data.epochStartBalance)} <span className="text-sm text-gray-50">QUBIC</span>
        </p>
        <p className={`mt-2 text-xs ${epochChange >= 0 ? 'text-success-40' : 'text-red-500'}`}>
          {epochChange >= 0 ? '+' : ''}
          {formatString(epochChange)} ({epochChangePercent}%)
        </p>
      </CardItem>

      <CardItem className="p-16">
        <p className="text-xs text-gray-50">{t('totalBurned')}</p>
        <p className="mt-4 font-space text-20 font-500 text-success-40">
          +{formatString(data.totalBurned)} <span className="text-sm text-gray-50">QUBIC</span>
        </p>
        <p className="mt-2 text-xs text-gray-50">{t('allTimeInflows')}</p>
      </CardItem>

      <CardItem className="p-16">
        <p className="text-xs text-gray-50">{t('totalDeducted')}</p>
        <p className="mt-4 font-space text-20 font-500 text-red-400">
          -{formatString(data.totalDeducted)} <span className="text-sm text-gray-50">QUBIC</span>
        </p>
        <p className="mt-2 text-xs text-gray-50">{t('allTimeOutflows')}</p>
      </CardItem>
    </div>
  )
}

const MemoizedFeeReserveStats = memo(FeeReserveStats)

export default MemoizedFeeReserveStats
