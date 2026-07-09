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
    category,
    direction,
    tickStart,
    tickEnd,
    epochStart,
    epochEnd,
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
    epochStart,
    epochEnd,
    eventTypes,
    category,
    direction,
    dateRange,
    sourceFilter,
    destinationFilter,
    amountFilter,
    supportsEpoch: true,
    addressId
  })

  return (
    <div className="flex flex-col gap-16">
      <BetaBanner />

      <EventsFilterBar
        filters={filters}
        eventTypes={eventTypes}
        category={category}
        direction={direction}
        tickStart={tickStart}
        tickEnd={tickEnd}
        epochStart={epochStart}
        epochEnd={epochEnd}
        dateRange={dateRange}
        sourceFilter={sourceFilter}
        destinationFilter={destinationFilter}
        amountFilter={amountFilter}
        idPrefix="addr-events"
        showDirectionFilter
        showCategoryFilter
        showEpochFilter
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
