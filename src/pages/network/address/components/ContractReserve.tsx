import { memo, useCallback, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { ArrowUpIcon } from '@app/assets/icons'
import { Skeleton } from '@app/components/ui'
import { DotsLoader } from '@app/components/ui/loaders'
import { useGetAddressName } from '@app/hooks'
import { formatString } from '@app/utils'
import type { TransactionEvent } from '@app/store/apis/events'
import { CardItem } from '../../components'
import AddressCell from '../../components/AddressCell'
import { useContractReserveEvents } from '../hooks'

const MAX_TOTAL = 10_000
const SCROLL_TOP_THRESHOLD = 200

function formatTotal(total: number): string {
  if (total >= MAX_TOTAL) return `${formatString(MAX_TOTAL)}+`
  return formatString(total)
}

function SourceCell({ address, pageAddress }: { address: string; pageAddress: string }) {
  const addressName = useGetAddressName(address)
  return (
    <AddressCell
      address={address}
      highlightAddress={pageAddress}
      addressName={addressName?.name}
      tooltipId={`burn-source-${address.slice(0, 8)}`}
    />
  )
}

function useScrollContainer() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [showScrollTop, setShowScrollTop] = useState(false)

  const handleScroll = useCallback(() => {
    const el = scrollRef.current
    if (el) {
      setShowScrollTop(el.scrollTop > SCROLL_TOP_THRESHOLD)
    }
  }, [])

  const scrollToTop = useCallback(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  return { scrollRef, showScrollTop, handleScroll, scrollToTop }
}

type BurnTableProps = Readonly<{
  events: TransactionEvent[]
  total: number
  hasMore: boolean
  isLoading: boolean
  hasError: boolean
  loadMore: () => void
  addressId: string
}>

const BurnTable = memo(function BurnTable({
  events,
  total,
  hasMore,
  isLoading,
  hasError,
  loadMore,
  addressId
}: BurnTableProps) {
  const { t } = useTranslation('network-page')
  const observer = useRef<IntersectionObserver | null>(null)
  const { scrollRef, showScrollTop, handleScroll, scrollToTop } = useScrollContainer()

  const lastRowRef = useCallback(
    (node: HTMLTableRowElement | null) => {
      if (observer.current) observer.current.disconnect()
      if (!node) return
      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore && !isLoading) {
            loadMore()
          }
        },
        { root: scrollRef.current, rootMargin: '100px' }
      )
      observer.current.observe(node)
    },
    [hasMore, isLoading, loadMore, scrollRef]
  )

  const title = total > 0 ? `${t('burnEvents')} (${formatTotal(total)})` : t('burnEvents')

  return (
    <CardItem className="relative flex flex-col overflow-hidden">
      <div className="border-b border-primary-60 p-16">
        <p className="font-space text-16 font-500">{title}</p>
      </div>
      {isLoading && events.length === 0 && (
        <div className="p-16">
          <Skeleton className="h-200" />
        </div>
      )}
      {hasError && (
        <div className="p-16 text-center text-sm text-gray-50">{t('eventsLoadFailed')}</div>
      )}
      {!isLoading && !hasError && events.length === 0 && (
        <div className="p-16 text-center text-sm text-gray-50">{t('noEvents')}</div>
      )}
      {events.length > 0 && (
        <div ref={scrollRef} onScroll={handleScroll} className="max-h-[500px] overflow-y-auto">
          <table className="w-full">
            <thead className="sticky top-0 z-10 border-b border-primary-60 bg-primary-70 text-left text-xs text-gray-50">
              <tr>
                <th className="px-16 py-12 font-400">{t('amount')}</th>
                <th className="px-16 py-12 font-400">{t('from')}</th>
                <th className="px-16 py-12 font-400">{t('epoch')}</th>
                <th className="px-16 py-12 text-right font-400">{t('timestamp')}</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event, index) => (
                <tr
                  key={event.logId}
                  ref={index === events.length - 1 ? lastRowRef : undefined}
                  className="border-b border-primary-60 last:border-b-0"
                >
                  <td className="px-16 py-12 font-space text-sm">
                    <span className="text-success-40">
                      +{event.amount !== undefined ? formatString(event.amount) : '0'}
                    </span>
                  </td>
                  <td className="px-16 py-12">
                    {event.source ? (
                      <SourceCell address={event.source} pageAddress={addressId} />
                    ) : (
                      <span className="text-sm text-gray-50">-</span>
                    )}
                  </td>
                  <td className="px-16 py-12 font-space text-sm">{event.epoch}</td>
                  <td className="px-16 py-12 text-right text-sm text-gray-50">
                    {event.timestamp > 0 ? new Date(event.timestamp).toLocaleString() : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {isLoading && (
            <div className="flex justify-center p-12">
              <DotsLoader />
            </div>
          )}
        </div>
      )}
      {showScrollTop && (
        <button
          type="button"
          aria-label="Scroll to top"
          onClick={scrollToTop}
          className="absolute bottom-12 right-12 rounded-full border border-gray-60 bg-primary-80 p-8 text-gray-50 shadow-lg transition hover:border-gray-50 hover:text-white"
        >
          <ArrowUpIcon className="size-16" />
        </button>
      )}
    </CardItem>
  )
})

type DeductionTableProps = Readonly<{
  events: TransactionEvent[]
  total: number
  hasMore: boolean
  isLoading: boolean
  hasError: boolean
  loadMore: () => void
}>

const DeductionTable = memo(function DeductionTable({
  events,
  total,
  hasMore,
  isLoading,
  hasError,
  loadMore
}: DeductionTableProps) {
  const { t } = useTranslation('network-page')
  const observer = useRef<IntersectionObserver | null>(null)
  const { scrollRef, showScrollTop, handleScroll, scrollToTop } = useScrollContainer()

  const lastRowRef = useCallback(
    (node: HTMLTableRowElement | null) => {
      if (observer.current) observer.current.disconnect()
      if (!node) return
      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore && !isLoading) {
            loadMore()
          }
        },
        { root: scrollRef.current, rootMargin: '100px' }
      )
      observer.current.observe(node)
    },
    [hasMore, isLoading, loadMore, scrollRef]
  )

  const title = total > 0 ? `${t('deductionEvents')} (${formatTotal(total)})` : t('deductionEvents')

  return (
    <CardItem className="relative flex flex-col overflow-hidden">
      <div className="border-b border-primary-60 p-16">
        <p className="font-space text-16 font-500">{title}</p>
      </div>
      {isLoading && events.length === 0 && (
        <div className="p-16">
          <Skeleton className="h-200" />
        </div>
      )}
      {hasError && (
        <div className="p-16 text-center text-sm text-gray-50">{t('eventsLoadFailed')}</div>
      )}
      {!isLoading && !hasError && events.length === 0 && (
        <div className="p-16 text-center text-sm text-gray-50">{t('noEvents')}</div>
      )}
      {events.length > 0 && (
        <div ref={scrollRef} onScroll={handleScroll} className="max-h-[500px] overflow-y-auto">
          <table className="w-full">
            <thead className="sticky top-0 z-10 border-b border-primary-60 bg-primary-70 text-left text-xs text-gray-50">
              <tr>
                <th className="px-16 py-12 font-400">{t('deducted')}</th>
                <th className="px-16 py-12 font-400">{t('remaining')}</th>
                <th className="px-16 py-12 font-400">{t('epoch')}</th>
                <th className="px-16 py-12 text-right font-400">{t('timestamp')}</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event, index) => (
                <tr
                  key={event.logId}
                  ref={index === events.length - 1 ? lastRowRef : undefined}
                  className="border-b border-primary-60 last:border-b-0"
                >
                  <td className="px-16 py-12 font-space text-sm">
                    <span className="text-red-400">
                      -
                      {event.deductedAmount !== undefined
                        ? formatString(event.deductedAmount)
                        : '0'}
                    </span>
                  </td>
                  <td className="px-16 py-12 font-space text-sm">
                    {event.remainingAmount !== undefined
                      ? formatString(event.remainingAmount)
                      : '-'}
                  </td>
                  <td className="px-16 py-12 font-space text-sm">{event.epoch}</td>
                  <td className="px-16 py-12 text-right text-sm text-gray-50">
                    {event.timestamp > 0 ? new Date(event.timestamp).toLocaleString() : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {isLoading && (
            <div className="flex justify-center p-12">
              <DotsLoader />
            </div>
          )}
        </div>
      )}
      {showScrollTop && (
        <button
          type="button"
          aria-label="Scroll to top"
          onClick={scrollToTop}
          className="absolute bottom-12 right-12 rounded-full border border-gray-60 bg-primary-80 p-8 text-gray-50 shadow-lg transition hover:border-gray-50 hover:text-white"
        >
          <ArrowUpIcon className="size-16" />
        </button>
      )}
    </CardItem>
  )
})

type Props = Readonly<{
  contractIndex: number
  addressId: string
}>

export default function ContractReserve({ contractIndex, addressId }: Props) {
  const { burns, deductions } = useContractReserveEvents(contractIndex)

  return (
    <div className="grid gap-16 lg:grid-cols-2">
      <BurnTable
        events={burns.events}
        total={burns.total}
        hasMore={burns.hasMore}
        isLoading={burns.isLoading}
        hasError={burns.hasError}
        loadMore={burns.loadMore}
        addressId={addressId}
      />
      <DeductionTable
        events={deductions.events}
        total={deductions.total}
        hasMore={deductions.hasMore}
        isLoading={deductions.isLoading}
        hasError={deductions.hasError}
        loadMore={deductions.loadMore}
      />
    </div>
  )
}
