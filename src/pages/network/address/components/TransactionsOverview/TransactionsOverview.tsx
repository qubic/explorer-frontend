import { memo } from 'react'
import { useTranslation } from 'react-i18next'

import { Tabs } from '@app/components/ui'
import { envConfig } from '@app/configs'
import type { GetAddressBalancesResponse } from '@app/store/apis/archiver-v1'
import { useHistoricalTransactions, useLatestTransactions } from '../../hooks'
import HistoricalTxs from './HistoricalTxs'
import LatestTransactions from './LatestTransactions'

const isTestnet = envConfig.NETWORK === 'testnet'

type Props = {
  address: GetAddressBalancesResponse['balance']
  addressId: string
}

function TransactionsOverview({ address, addressId }: Props) {
  const { t } = useTranslation('network-page')
  const { transactions, loadMoreTransactions, hasMore, isLoading, error } = useLatestTransactions(
    addressId,
    address.validForTick
  )
  const {
    historicalTransactions,
    loadMoreTransactions: loadMoreHistoricalTxs,
    hasMore: hasMoreHistoricalTxs,
    isLoading: isHistoricalTxsLoading,
    error: historicalTxsError
  } = useHistoricalTransactions(addressId, { skip: isTestnet })

  return (
    <Tabs className="rounded-lg border border-primary-60">
      <Tabs.List>
        <Tabs.Tab>{t('latest')}</Tabs.Tab>
        {!isTestnet && <Tabs.Tab>{t('historical')}</Tabs.Tab>}
      </Tabs.List>
      <Tabs.Panels className="px-16 py-20">
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
        {!isTestnet && (
          <Tabs.Panel>
            <HistoricalTxs
              addressId={addressId}
              transactions={historicalTransactions}
              loadMore={loadMoreHistoricalTxs}
              hasMore={hasMoreHistoricalTxs}
              isLoading={isHistoricalTxsLoading}
              error={historicalTxsError}
            />
          </Tabs.Panel>
        )}
      </Tabs.Panels>
    </Tabs>
  )
}

const MemoizedTransactionsOverview = memo(TransactionsOverview)
export default MemoizedTransactionsOverview
