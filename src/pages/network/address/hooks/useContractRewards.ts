import { useEffect, useState } from 'react'

import { usePageAutoCorrect, useValidatedPage, useValidatedPageSize } from '@app/hooks'
import {
  type SmartContractRewardDistribution,
  useGetSmartContractRewardsQuery
} from '@app/store/apis/aggregation'

interface ContractRewardsResult {
  distributions: SmartContractRewardDistribution[]
  total: number
  // undefined until the first response lands; stays put across page changes so
  // the stat card doesn't flicker back to a skeleton on every paginate.
  totalAllTimeDistributed: string | undefined
  pageCount: number
  isLoading: boolean
  hasError: boolean
  validForTick: number | undefined
}

export default function useContractRewards(
  smartContractAddress: string,
  // While a tick detail is open, the detail view owns the `page` param for its
  // transfers pagination. Skip this hook's page auto-correct then, or it would
  // clamp `page` against the rewards-list total and snap the detail back to page 1.
  autoCorrectPage = true
): ContractRewardsResult {
  const page = useValidatedPage()
  const pageSize = useValidatedPageSize()
  const offset = (page - 1) * pageSize

  const { data, isFetching, isError } = useGetSmartContractRewardsQuery(
    {
      smartContractAddress,
      pagination: { offset, size: pageSize }
    },
    { skip: !smartContractAddress }
  )

  // Anchored locally instead of reading `data?.totalAllTimeDistributed` directly so the stat
  // card doesn't flicker back to a skeleton on every paginate (data briefly swaps to undefined
  // between page fetches). Not using `useFirstPageAnchor` because it captures only when
  // offset === 0, which would leave the stat card stuck on the skeleton when a user deep-links
  // to ?page=5 — totalAllTimeDistributed is a global aggregate, same value on every page.
  // `smartContractAddress` is in the capture effect's deps so it re-runs after the reset effect
  // when switching between two SCs whose `totalAllTimeDistributed` happens to be identical.
  const [totalAllTimeDistributed, setTotalAllTimeDistributed] = useState<string | undefined>(
    undefined
  )

  useEffect(() => {
    setTotalAllTimeDistributed(undefined)
  }, [smartContractAddress])

  useEffect(() => {
    if (data?.totalAllTimeDistributed !== undefined) {
      setTotalAllTimeDistributed(data.totalAllTimeDistributed)
    }
  }, [data?.totalAllTimeDistributed, smartContractAddress])

  const total = data?.total ?? 0

  usePageAutoCorrect(!!data && autoCorrectPage, total, pageSize)

  return {
    distributions: data?.distributions ?? [],
    total,
    totalAllTimeDistributed,
    pageCount: Math.ceil(total / pageSize),
    isLoading: isFetching,
    hasError: isError,
    validForTick: data?.validForTick
  }
}
