import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'

import { FunnelIcon } from '@app/assets/icons'
import { EVENT_TYPES, getEventTypeLabel } from '@app/store/apis/events'
import BetaBanner from '../../components/BetaBanner'
import FilterDropdown from '../../components/filters/FilterDropdown'
import { ResetFiltersButton } from '../../components/filters'
import TransactionEvents from '../../components/TxItem/TransactionEvents'
import { useTickEvents } from '../hooks'

// Subset supported by the events API
const EVENT_TYPE_OPTIONS = [
  EVENT_TYPES.QU_TRANSFER,
  EVENT_TYPES.ASSET_ISSUANCE,
  EVENT_TYPES.ASSET_OWNERSHIP_CHANGE,
  EVENT_TYPES.ASSET_POSSESSION_CHANGE,
  EVENT_TYPES.BURNING,
  EVENT_TYPES.CONTRACT_RESERVE_DEDUCTION
]

type Props = Readonly<{
  tick: number
}>

export default function TickEvents({ tick }: Props) {
  const { t } = useTranslation('network-page')
  const { events, total, eventType, isLoading } = useTickEvents(tick)
  const [, setSearchParams] = useSearchParams()
  const [showDropdown, setShowDropdown] = useState(false)

  const isActive = eventType !== undefined

  const handleSelect = useCallback(
    (type: number) => {
      setSearchParams((prev) => {
        const next = Object.fromEntries(prev.entries())
        next.eventType = String(type)
        next.page = '1'
        return next
      })
      setShowDropdown(false)
    },
    [setSearchParams]
  )

  const handleClear = useCallback(() => {
    setSearchParams((prev) => {
      const next = Object.fromEntries(prev.entries())
      delete next.eventType
      next.page = '1'
      return next
    })
  }, [setSearchParams])

  const label = isActive ? getEventTypeLabel(eventType) : t('eventType')

  return (
    <div className="flex flex-col gap-16">
      <BetaBanner />
      <div className="flex items-center gap-8">
        <FunnelIcon className="h-16 w-16 text-gray-50" />
        <FilterDropdown
          label={label}
          isActive={isActive}
          show={showDropdown}
          onToggle={() => setShowDropdown((prev) => !prev)}
          onClear={isActive ? handleClear : undefined}
        >
          <ul className="flex flex-col">
            {EVENT_TYPE_OPTIONS.map((type) => (
              <li key={type}>
                <button
                  type="button"
                  className="w-full rounded px-8 py-6 text-left font-space text-xs text-gray-50 hover:bg-primary-60 hover:text-white"
                  onClick={() => handleSelect(type)}
                >
                  {getEventTypeLabel(type)}
                </button>
              </li>
            ))}
          </ul>
        </FilterDropdown>
        {isActive && (
          <>
            <div className="grow" />
            <ResetFiltersButton onClick={handleClear} showTooltip />
          </>
        )}
      </div>
      <TransactionEvents
        events={events}
        total={total}
        isLoading={isLoading}
        paginated
        showBetaBanner={false}
      />
    </div>
  )
}
