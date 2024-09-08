import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'

import { ChevronLeftIcon, ChevronRightIcon } from '@app/assets/icons'
import { Breadcrumbs, InfiniteScroll, Select } from '@app/components/ui'
import { DotsLoader, LinearProgress } from '@app/components/ui/loaders'
import type { Option } from '@app/components/ui/Select'
import { TRANSACTION_OPTIONS, TRANSACTION_OPTIONS_MOBILE } from '@app/constants'
import { useTailwindBreakpoint } from '@app/hooks'
import { useAppDispatch, useAppSelector } from '@app/hooks/redux'
import { Routes } from '@app/router'
import type { Transaction } from '@app/services/archiver'
import { getBlock, selectBlock } from '@app/store/network/blockSlice'
import { formatBase64, formatDate, formatString } from '@app/utils'
import { AddressLink, HomeLink, SubCardItem, TickStatus, TxItem } from './components'

const PAGE_SIZE = 10

export default function TickPage() {
  const { t } = useTranslation('network-page')
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { tick } = useParams()
  const { block, isLoading, error } = useAppSelector(selectBlock)
  const { isMobile } = useTailwindBreakpoint()

  const [option, setOption] = useState('all')
  const [displayTransactions, setDisplayTransactions] = useState<Transaction[]>([])
  const [hasMore, setHasMore] = useState(true)

  const nonExecutedTxIds = useMemo(() => {
    if (!block) return []
    const transferTx = block.transferTx || []
    const approvedTxIds = new Set((block.approvedTx || []).map((tx) => tx.txId))
    return transferTx.filter((tx) => !approvedTxIds.has(tx.txId)).map((tx) => tx.txId)
  }, [block])

  const selectedTxs = useMemo(() => {
    if (option === 'transfer') return block?.transferTx || []
    if (option === 'approved') return block?.approvedTx || []
    return block?.tx || []
  }, [option, block])

  const loadMoreTransactions = useCallback(() => {
    if (displayTransactions.length < selectedTxs.length) {
      const nextTransactions = selectedTxs.slice(
        displayTransactions.length,
        displayTransactions.length + PAGE_SIZE
      )
      setDisplayTransactions((prevTransactions) => [...prevTransactions, ...nextTransactions])
      setHasMore(displayTransactions.length + PAGE_SIZE < selectedTxs.length)
    } else {
      setHasMore(false)
    }
  }, [displayTransactions, selectedTxs])

  const handleOnSelect = useCallback((selectedOption: Option) => {
    setOption(selectedOption.value)
  }, [])

  const handleTickNavigation = useCallback(
    (direction: 'previous' | 'next') => () => {
      const newTick = Number(tick) + (direction === 'previous' ? -1 : 1)
      navigate(Routes.NETWORK.TICK(newTick))
    },
    [navigate, tick]
  )

  useEffect(() => {
    dispatch(getBlock(tick))
  }, [tick, dispatch])

  useEffect(() => {
    setDisplayTransactions(selectedTxs.slice(0, PAGE_SIZE))
    setHasMore(selectedTxs.length > PAGE_SIZE)
  }, [selectedTxs])

  if (isLoading) {
    return <LinearProgress />
  }

  return (
    <div className="mx-auto max-w-[960px] px-12 py-32">
      <Breadcrumbs>
        <HomeLink />
        <p className="font-sans text-12 text-primary-30">
          {t('tick')} {formatString(tick)}
        </p>
      </Breadcrumbs>
      <div className="mb-36 mt-24 flex items-center justify-between gap-12">
        <div className="flex flex-col gap-8">
          <div className="flex items-center justify-between gap-10">
            <button
              type="button"
              aria-label="Previous Tick"
              className="hover:bg-slate-50 flex size-fit rounded-full py-6 pl-11 pr-1 text-gray-50 hover:text-white hover:transition hover:duration-300"
              onClick={handleTickNavigation('previous')}
            >
              <ChevronLeftIcon className="size-24 rtl:rotate-180 rtl:transform" />
            </button>
            <p className="font-space text-32 font-500">{formatString(tick)}</p>
            <button
              type="button"
              aria-label="Next Tick"
              className="hover:bg-slate-50 flex size-fit items-center justify-center rounded-full py-6 pl-1 pr-11 text-gray-50 hover:text-white hover:transition hover:duration-300"
              onClick={handleTickNavigation('next')}
            >
              <ChevronRightIcon className="size-24 rtl:rotate-180 rtl:transform" />
            </button>
          </div>
          {!error && (
            <p className="font-space text-sm text-gray-50">{formatDate(block?.tick.timestamp)}</p>
          )}
        </div>
        <div className="hidden md:block">
          <TickStatus
            dataStatus={!error}
            tickStatus={Boolean(block?.tick?.transactionIds?.length)}
            transactions={selectedTxs.length}
          />
        </div>
      </div>
      {!error && (
        <div className="mb-24">
          <SubCardItem
            title={t('signature')}
            variant="secondary"
            content={
              <p className="break-all font-space text-sm text-gray-50">
                {formatBase64(block?.tick.signatureHex)}
              </p>
            }
          />
          <SubCardItem
            title={t('tickLeader')}
            variant="secondary"
            content={
              <AddressLink value={block?.epoch.identities[block?.tick.computorIndex] ?? ''} copy />
            }
          />
        </div>
      )}
      <div className="mb-24 md:hidden">
        <TickStatus
          dataStatus={!error}
          tickStatus={Boolean(block?.tick?.transactionIds?.length)}
          transactions={selectedTxs.length}
        />
      </div>
      {!error && (
        <div className="flex flex-col gap-16">
          <div className="flex items-center justify-between gap-10">
            <p className="font-space text-xl font-500">{t('transactions')}</p>
            <Select
              label="Transactions Type"
              options={isMobile ? TRANSACTION_OPTIONS_MOBILE : TRANSACTION_OPTIONS}
              onSelect={handleOnSelect}
            />
          </div>
          <InfiniteScroll
            items={displayTransactions}
            loadMore={loadMoreTransactions}
            hasMore={hasMore}
            loader={<DotsLoader showLoadingText />}
            endMessage={
              <p className="py-32 text-center text-sm text-gray-50">
                {displayTransactions.length === 0
                  ? t('noTransactions')
                  : t('allTransactionsLoaded')}
              </p>
            }
            renderItem={(tx) => (
              <TxItem key={tx.txId} tx={tx} nonExecutedTxIds={nonExecutedTxIds} />
            )}
          />
        </div>
      )}
    </div>
  )
}
