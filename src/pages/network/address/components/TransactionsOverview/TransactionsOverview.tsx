import { useTranslation } from 'react-i18next'

import { Tabs } from '@app/components/ui'
import type { Address } from '@app/store/network/addressSlice'
import { memo } from 'react'
import { useLatestTransactions } from '../../hooks'
import HistoricalTxs from './HistoricalTxs'
import LatestTransactions from './LatestTransactions'

type Props = {
  address: Address
  addressId: string
}

function TransactionsOverview({ address, addressId }: Props) {
  const { t } = useTranslation('network-page')
  const { transactions, loadMoreTransactions, hasMore, isLoading, error } = useLatestTransactions(
    addressId,
    address.endTick
  )

  return (
    <div className="mt-40">
      <p className="my-10 font-space text-20 font-500 leading-26">{t('transactions')}</p>
      <Tabs>
        <Tabs.List>
          <Tabs.Tab>{t('latest')}</Tabs.Tab>
          <Tabs.Tab>{t('historical')}</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panels>
          <Tabs.Panel>
            <LatestTransactions
              addressId={addressId}
              transactions={transactions}
              loadMore={loadMoreTransactions}
              hasMore={hasMore}
              isLoading={isLoading}
              error={error}
            />
          </Tabs.Panel>
          <Tabs.Panel>
            <HistoricalTxs addressId={addressId} />
          </Tabs.Panel>
        </Tabs.Panels>
      </Tabs>
    </div>
  )
}

const MemoizedTransactionsOverview = memo(TransactionsOverview)
export default MemoizedTransactionsOverview
