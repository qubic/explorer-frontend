import { useMemo } from 'react'

import { useGetProcessedTickIntervalsQuery } from '@app/store/apis/query-service'
import { getEpochForTick } from '@app/utils'

export function useGetEpochForTick(tickNumber: number): {
  epoch: number | undefined
  isLoading: boolean
} {
  const { data: intervals, isFetching } = useGetProcessedTickIntervalsQuery(undefined, {
    skip: !tickNumber
  })

  const epoch = useMemo(
    () => (intervals ? getEpochForTick(intervals, tickNumber) : undefined),
    [intervals, tickNumber]
  )

  return { epoch, isLoading: isFetching }
}
