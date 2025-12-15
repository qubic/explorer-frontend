import { memo } from 'react'
import { useTranslation } from 'react-i18next'

import { CardItem, TickLink } from '@app/pages/network/components'
import { formatString } from '@app/utils'
import type { FeeReserveEvent } from '../mock-data'

type Props = {
  events: FeeReserveEvent[]
}

function RecentEventsTable({ events }: Props) {
  const { t } = useTranslation('network-page')

  return (
    <CardItem className="overflow-hidden">
      <div className="border-b border-primary-60 p-16">
        <p className="font-space text-16 font-500">{t('movementsHistory')}</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-primary-60 bg-primary-70/50 text-left text-xs text-gray-50">
            <tr>
              <th className="px-16 py-12 font-400">{t('type')}</th>
              <th className="px-16 py-12 text-right font-400">{t('amount')}</th>
              <th className="px-16 py-12 text-right font-400">{t('tick')}</th>
              <th className="px-16 py-12 text-right font-400">{t('time')}</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id} className="border-b border-primary-60 last:border-b-0">
                <td className="px-16 py-12">
                  <span
                    className={`text-sm font-500 ${
                      event.type === 'burn' ? 'text-success-40' : 'text-red-400'
                    }`}
                  >
                    {event.type === 'burn' ? t('burn') : t('deduction')}
                  </span>
                </td>
                <td className="px-16 py-12 text-right font-space text-sm">
                  <span className={event.type === 'burn' ? 'text-success-40' : 'text-red-400'}>
                    {event.type === 'burn' ? '+' : '-'}
                    {formatString(event.amount)}
                  </span>
                </td>
                <td className="px-16 py-12 text-right">
                  <TickLink value={event.tick} className="text-sm text-primary-30" />
                </td>
                <td className="px-16 py-12 text-right text-sm text-gray-50">
                  {new Date(event.timestamp).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </CardItem>
  )
}

const MemoizedRecentEventsTable = memo(RecentEventsTable)

export default MemoizedRecentEventsTable
