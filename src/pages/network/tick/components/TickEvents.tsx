import { useTranslation } from 'react-i18next'

import BetaBanner from '../../components/BetaBanner'
import { EventsFilterBar } from '../../components/filters'
import TransactionEvents from '../../components/TxItem/TransactionEvents'
import { useEventFilters } from '../../hooks'
import { getEventsErrorMessage } from '../../utils/filterUtils'
import { useTickEvents } from '../hooks'

type Props = Readonly<{
  tick: number
}>

export default function TickEvents({ tick }: Props) {
  const { t } = useTranslation('network-page')
  const {
    events,
    total,
    eventTypes,
    sourceFilter,
    destinationFilter,
    amountFilter,
    isLoading,
    hasError,
    lastProcessedTick,
    validForTick
  } = useTickEvents(tick)

  const errorMessage = getEventsErrorMessage(hasError, lastProcessedTick, t)

  const filters = useEventFilters({
    eventTypes,
    sourceFilter,
    destinationFilter,
    amountFilter,
    supportsTick: false,
    supportsDate: false
  })

  return (
    <div className="flex flex-col gap-16">
      <BetaBanner />

      <EventsFilterBar
        filters={filters}
        eventTypes={eventTypes}
        sourceFilter={sourceFilter}
        destinationFilter={destinationFilter}
        amountFilter={amountFilter}
        idPrefix="tick-events"
        showTickFilter={false}
        showDateFilter={false}
      />

      <TransactionEvents
        events={events}
        total={total}
        isLoading={isLoading}
        paginated
        showBetaBanner={false}
        errorMessage={errorMessage}
        validForTick={validForTick}
      />
    </div>
  )
}
