import { useTranslation } from 'react-i18next'

import { Alert } from '@app/components/ui'
import BetaBanner from '../../components/BetaBanner'
import { EventsFilterBar } from '../../components/filters'
import TransactionEvents from '../../components/TxItem/TransactionEvents'
import { useEventFilters } from '../../hooks'
import { useAddressEvents } from '../hooks'

type Props = Readonly<{
  addressId: string
}>

export default function AddressEvents({ addressId }: Props) {
  const { t } = useTranslation('network-page')
  const {
    events,
    total,
    eventType,
    tickStart,
    tickEnd,
    dateRange,
    sourceFilter,
    destinationFilter,
    isLoading,
    hasError
  } = useAddressEvents(addressId)

  const filters = useEventFilters({
    tickStart,
    tickEnd,
    eventType,
    dateRange,
    sourceFilter,
    destinationFilter
  })

  return (
    <div className="flex flex-col gap-16">
      <BetaBanner />

      <EventsFilterBar
        filters={filters}
        eventType={eventType}
        tickStart={tickStart}
        tickEnd={tickEnd}
        dateRange={dateRange}
        sourceFilter={sourceFilter}
        destinationFilter={destinationFilter}
        idPrefix="addr-events"
      />

      {hasError ? (
        <Alert variant="error">{t('eventsLoadFailed')}</Alert>
      ) : (
        <TransactionEvents
          events={events}
          total={total}
          isLoading={isLoading}
          paginated
          showTxId
          showTickAndTimestamp
          showBetaBanner={false}
          highlightAddress={addressId}
        />
      )}
    </div>
  )
}
