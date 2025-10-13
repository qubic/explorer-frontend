import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { ChevronDownIcon } from '@app/assets/icons'
import { InfiniteScroll, Select, Skeleton } from '@app/components/ui'
import { Button } from '@app/components/ui/buttons'
import type { Option } from '@app/components/ui/Select'
import { TRANSACTION_OPTIONS, TRANSACTION_OPTIONS_MOBILE } from '@app/constants'
import { useTailwindBreakpoint } from '@app/hooks'
import type { Transaction } from '@app/store/apis/archiver-v2'
import { useGetTickTransactionsQuery } from '@app/store/apis/archiver-v2'
import { TransactionOptionEnum } from '@app/types'
import { formatRTKError } from '@app/utils/rtk'
import { TxItem } from '../../components'

const PAGE_SIZE = 10

const TickTransactionsSkeleton = memo(() => (
  <div className="grid gap-12">
    {Array.from({ length: PAGE_SIZE / 2 }).map((_, index) => (
      <Skeleton key={String(`${index}`)} className="h-[78px] sm:h-52" />
    ))}
  </div>
))

type Props = Readonly<{
  tick: number
}>

export default function TickTransactions({ tick }: Props) {
  const { t } = useTranslation('network-page')
  const [option, setOption] = useState<TransactionOptionEnum>(TransactionOptionEnum.ALL)
  const [displayTransactions, setDisplayTransactions] = useState<Transaction[]>([])
  const [hasMore, setHasMore] = useState(true)
  const [expandAll, setExpandAll] = useState(false)
  const [expandedTxIds, setExpandedTxIds] = useState<Set<string>>(new Set())

  const { isMobile } = useTailwindBreakpoint()

  const {
    data: transactions,
    isFetching: isTickTransactionsLoading,
    error: tickTransactionsError
  } = useGetTickTransactionsQuery(
    {
      tick,
      transfers: option === TransactionOptionEnum.TRANSFER,
      approved: option === TransactionOptionEnum.APPROVED
    },
    { skip: !tick }
  )

  const loadMoreTransactions = useCallback(() => {
    if (transactions && displayTransactions.length < transactions?.length) {
      const nextTransactions = transactions.slice(
        displayTransactions.length,
        displayTransactions.length + PAGE_SIZE
      )
      setDisplayTransactions((prevTransactions) => [...prevTransactions, ...nextTransactions])
      setHasMore(displayTransactions.length + PAGE_SIZE < transactions?.length)
    } else {
      setHasMore(false)
    }
  }, [displayTransactions, transactions])

  const handleOnSelect = useCallback((selectedOption: Option<TransactionOptionEnum>) => {
    setOption(selectedOption.value)
  }, [])

  const handleExpandAllChange = useCallback(
    (checked: boolean) => {
      setExpandAll(checked)
      if (checked) {
        // Expand all displayed transactions
        const allTxIds = new Set(displayTransactions.map((tx) => tx.transaction.txId))
        setExpandedTxIds(allTxIds)
      } else {
        // Collapse all
        setExpandedTxIds(new Set())
      }
    },
    [displayTransactions]
  )

  const handleTxToggle = useCallback((txId: string, isOpen: boolean) => {
    setExpandedTxIds((prev) => {
      const newSet = new Set(prev)
      if (isOpen) {
        newSet.add(txId)
      } else {
        newSet.delete(txId)
      }
      return newSet
    })
    // Update expandAll state based on whether all transactions are expanded
    setExpandAll((prevExpandAll) => {
      if (!isOpen && prevExpandAll) {
        return false
      }
      return prevExpandAll
    })
  }, [])

  useEffect(() => {
    if (transactions) {
      setDisplayTransactions(transactions.slice(0, PAGE_SIZE))
      setHasMore(transactions.length > PAGE_SIZE)
    }
  }, [transactions])

  // Reset expand state when tick changes
  useEffect(() => {
    setExpandAll(false)
    setExpandedTxIds(new Set())
  }, [tick])

  // 1) pick the base options
  const baseOptions = useMemo(
    () => (isMobile ? TRANSACTION_OPTIONS_MOBILE : TRANSACTION_OPTIONS),
    [isMobile]
  )

  // Localize them using the t constant
  const selectOptions = useMemo(
    () =>
      baseOptions.map((o) => ({
        ...o,
        label: t(o.labelKey) // directly call your provided t
      })),
    [baseOptions, t] // depend on t so this re-runs when t changes
  )

  const defaultValue = useMemo(
    () => selectOptions.find((o) => o.value === option),
    [selectOptions, option]
  )

  return (
    <div className="flex flex-col gap-16">
      <div className="flex flex-col gap-10 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-space text-xl font-500">{t('transactions')}</p>

        <div className="flex items-center justify-between gap-10 sm:justify-end">
          {displayTransactions.length > 0 && (
            <Button
              variant="link"
              size="sm"
              onClick={() => handleExpandAllChange(!expandAll)}
              className="gap-6"
            >
              <ChevronDownIcon
                className={`h-16 w-16 transition-transform duration-300 ${expandAll ? 'rotate-180' : 'rotate-0'}`}
              />
              {expandAll ? t('collapseAll') : t('expandAll')}
            </Button>
          )}

          {/* Wrapper controls width so the Select can size to its content */}
          <div className="w-fit min-w-[150px] max-w-[90vw] sm:min-w-[252px]">
            <Select
              label={t('filter.label')}
              className="whitespace-nowrap" // prevent wrapping inside the trigger
              size={isMobile ? 'sm' : 'lg'}
              options={selectOptions}
              onSelect={handleOnSelect}
              defaultValue={defaultValue}
            />
          </div>
        </div>
      </div>

      <InfiniteScroll
        items={displayTransactions}
        loadMore={loadMoreTransactions}
        hasMore={hasMore}
        isLoading={isTickTransactionsLoading}
        loader={<TickTransactionsSkeleton />}
        error={tickTransactionsError && formatRTKError(tickTransactionsError)}
        replaceContentOnLoading
        replaceContentOnError
        endMessage={
          <p className="py-32 text-center text-sm text-gray-50">
            {displayTransactions.length === 0 ? t('noTransactions') : t('allTransactionsLoaded')}
          </p>
        }
        renderItem={({ transaction, moneyFlew, timestamp }) => (
          <TxItem
            key={transaction.txId}
            tx={transaction}
            nonExecutedTxIds={moneyFlew ? [] : [transaction.txId]}
            timestamp={timestamp}
            isExpanded={expandedTxIds.has(transaction.txId)}
            onToggle={handleTxToggle}
          />
        )}
      />
    </div>
  )
}
