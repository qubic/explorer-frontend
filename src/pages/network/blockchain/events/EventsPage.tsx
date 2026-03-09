import { useTranslation } from 'react-i18next'

import { withHelmet } from '@app/components/hocs'
import { Breadcrumbs } from '@app/components/ui'
import { PageLayout } from '@app/components/ui/layouts'
import { HomeLink } from '../../components'
import BetaBanner from '../../components/BetaBanner'
import { EventsFilterBar } from '../../components/filters'
import TransactionEvents from '../../components/TxItem/TransactionEvents'
import { useEventFilters } from '../../hooks'
import useEventsPage from './useEventsPage'

function EventsPage() {
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
    isLoading
  } = useEventsPage()

  const filters = useEventFilters({
    tickStart,
    tickEnd,
    eventType,
    dateRange,
    sourceFilter,
    destinationFilter
  })

  return (
    <PageLayout>
      <div className="flex flex-col gap-20">
        <Breadcrumbs aria-label="breadcrumb">
          <HomeLink />
          <p className="text-xs text-gray-50">{t('blockchain')}</p>
          <p className="text-xs text-primary-30">{t('events')}</p>
        </Breadcrumbs>

        <p className="font-space text-24 font-500">{t('events')}</p>

        <BetaBanner />

        <EventsFilterBar
          filters={filters}
          eventType={eventType}
          tickStart={tickStart}
          tickEnd={tickEnd}
          dateRange={dateRange}
          sourceFilter={sourceFilter}
          destinationFilter={destinationFilter}
          idPrefix="events"
        />

        <TransactionEvents
          events={events}
          total={total}
          isLoading={isLoading}
          paginated
          showTxId
          showTickAndTimestamp
          showBetaBanner={false}
        />
      </div>
    </PageLayout>
  )
}

const EventsPageWithHelmet = withHelmet(EventsPage, {
  title: 'Events | Qubic Explorer',
  meta: [{ name: 'description', content: 'Browse blockchain events on the Qubic Network' }]
})

export default EventsPageWithHelmet
