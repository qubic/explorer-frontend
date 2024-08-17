import { Infocon } from '@app/assets/icons'
import { InfiniteScroll } from '@app/components/ui'
import { DotsLoader } from '@app/components/ui/loaders'
import { useAppDispatch, useAppSelector } from '@app/hooks/redux'
import { getHistoricalTxs, selectHistoricalTxs } from '@app/store/network/addressSlice'
import { useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { TxItem } from '../components'

type Props = {
  addressId: string
}

export default function HistoricalTxs({ addressId }: Props) {
  const { t } = useTranslation('network-page')
  const dispatch = useAppDispatch()
  const { data: historicalTxs, isLoading, hasMore } = useAppSelector(selectHistoricalTxs)

  const loadMoreTxs = useCallback(() => {
    dispatch(getHistoricalTxs(addressId))
  }, [dispatch, addressId])

  useEffect(() => {
    if (historicalTxs.length === 0) {
      loadMoreTxs()
    }
  }, [historicalTxs.length, isLoading, loadMoreTxs])

  return (
    <div className="grid w-full gap-10">
      {(!isLoading || historicalTxs.length > 0) && (
        <div className="flex items-center gap-4 pb-14">
          <Infocon className="h-16 w-16 text-gray-50" />
          <p className="text-left text-14 text-gray-50">{t('historicalDataWarning')}</p>
        </div>
      )}

      <InfiniteScroll
        items={historicalTxs}
        loadMore={loadMoreTxs}
        hasMore={hasMore}
        isLoading={isLoading}
        loader={<DotsLoader showLoadingText />}
        endMessage={
          <p className="py-32 text-center text-14 text-gray-50">
            {historicalTxs.length === 0 ? t('noTransactions') : t('allTransactionsLoaded')}
          </p>
        }
        renderItem={({ tx, status }) => (
          <TxItem
            key={tx.txId}
            tx={tx}
            identify={addressId}
            variant="primary"
            isHistoricalTx
            nonExecutedTxIds={status?.moneyFlew ? [] : [status?.txId]}
          />
        )}
      />
    </div>
  )
}
