import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { InfiniteScroll, Select, Skeleton } from '@app/components/ui'
import type { Option } from '@app/components/ui/Select'
import { TRANSACTION_OPTIONS, TRANSACTION_OPTIONS_MOBILE } from '@app/constants'
import { useTailwindBreakpoint } from '@app/hooks'
import { useGetTickTransactionsQuery } from '@app/store/apis/archiver-v2.api'
import type { TransactionV2 } from '@app/store/apis/archiver-v2.types'
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
  const [displayTransactions, setDisplayTransactions] = useState<TransactionV2[]>([])
  const [hasMore, setHasMore] = useState(true)

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

  const selectOptions = useMemo(
    () => (isMobile ? TRANSACTION_OPTIONS_MOBILE : TRANSACTION_OPTIONS),
    [isMobile]
  )

  useEffect(() => {
    if (transactions) {
      setDisplayTransactions(transactions.slice(0, PAGE_SIZE))
      setHasMore(transactions.length > PAGE_SIZE)
    }
  }, [transactions])

  return (
    <div className="flex flex-col gap-16">
      <div className="flex items-center justify-between gap-10">
        <p className="font-space text-xl font-500">{t('transactions')}</p>
        <Select
          label="Transactions Type"
          className="w-[150px] sm:w-[225px]"
          options={selectOptions}
          onSelect={handleOnSelect}
          defaultValue={TRANSACTION_OPTIONS.find((o) => o.value === option)}
        />
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
          />
        )}
      />
    </div>
  )
}
