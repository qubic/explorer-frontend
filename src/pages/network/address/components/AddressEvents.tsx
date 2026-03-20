import { useTranslation } from 'react-i18next'

import BetaBanner from '../../components/BetaBanner'
import { EventsFilterBar } from '../../components/filters'
import TransactionEvents from '../../components/TxItem/TransactionEvents'
import { useEventFilters } from '../../hooks'
import { getEventsErrorMessage } from '../../utils/filterUtils'
import { useAddressEvents } from '../hooks'

type Props = Readonly<{
  addressId: string
}>

export default function AddressEvents({ addressId }: Props) {
  const { t } = useTranslation('network-page')
  const {
    events,
    total,
    eventTypes,
    direction,
    tickStart,
    tickEnd,
    dateRange,
    sourceFilter,
    destinationFilter,
    amountFilter,
    isLoading,
    hasError,
    lastProcessedTick,
    validForTick
  } = useAddressEvents(addressId)

  const errorMessage = getEventsErrorMessage(hasError, lastProcessedTick, t)

  const filters = useEventFilters({
    tickStart,
    tickEnd,
    eventTypes,
    direction,
    dateRange,
    sourceFilter,
    destinationFilter,
    amountFilter,
    addressId
  })

  return (
    <div className="flex flex-col gap-16">
      <BetaBanner />

      <EventsFilterBar
        filters={filters}
        eventTypes={eventTypes}
        direction={direction}
        tickStart={tickStart}
        tickEnd={tickEnd}
        dateRange={dateRange}
        sourceFilter={sourceFilter}
        destinationFilter={destinationFilter}
        amountFilter={amountFilter}
        idPrefix="addr-events"
        showDirectionFilter
        addressId={addressId}
      />

      <TransactionEvents
        events={events}
        total={total}
        isLoading={isLoading}
        paginated
        showTxId
        showTickAndTimestamp
        showBetaBanner={false}
        highlightAddress={addressId}
        errorMessage={errorMessage}
        validForTick={validForTick}
      />
    </div>
  )
}
