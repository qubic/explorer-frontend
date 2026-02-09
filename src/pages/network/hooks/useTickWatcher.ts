import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { useGetTickInfoQuery } from '@app/store/apis/rpc-live'

// To cover smart contract interactions while preventing abuse.
const MAX_TICK_RANGE = 100

function getPollingInterval(remaining: number | undefined, duration = 2): number {
  if (remaining === undefined) return 5000

  const estimatedSecondsLeft = remaining * duration

  // Far away (>30s): poll lazily
  if (estimatedSecondsLeft > 30) return 10_000
  // Getting close (>10s): moderate polling
  if (estimatedSecondsLeft > 10) return 5000
  // Almost there: aggressive polling
  return 2000
}

interface TickWatcherResult {
  isLoading: boolean
  isWaitingForTick: boolean
  isOutOfRange: boolean
  targetTick: number | undefined
  currentTick: number | undefined
  remaining: number | undefined
}

export default function useTickWatcher(opts: {
  isTxNotFound: boolean
  refetch: () => void
}): TickWatcherResult {
  const [searchParams] = useSearchParams()
  const [pollingInterval, setPollingInterval] = useState(5000)
  const hasRefetched = useRef(false)

  const targetTick = searchParams.get('tick') ? Number(searchParams.get('tick')) : undefined
  const isValidTargetTick = targetTick !== undefined && !Number.isNaN(targetTick) && targetTick > 0

  const shouldFetchTick = isValidTargetTick && opts.isTxNotFound

  const tickInfo = useGetTickInfoQuery(undefined, {
    pollingInterval: shouldFetchTick ? pollingInterval : 0,
    skip: !shouldFetchTick
  })

  const currentTick = tickInfo.data?.tick
  const tickDuration = tickInfo.data?.duration
  const remaining =
    shouldFetchTick && currentTick !== undefined ? targetTick - currentTick : undefined
  const isInRange = remaining !== undefined && remaining > 0 && remaining <= MAX_TICK_RANGE
  const isOutOfRange = remaining !== undefined && remaining > MAX_TICK_RANGE
  const tickReached = shouldFetchTick && currentTick !== undefined && currentTick >= targetTick

  const isTickInfoLoading = shouldFetchTick && currentTick === undefined
  const isWaitingForTick = shouldFetchTick && !tickReached && !isTickInfoLoading && isInRange

  // Adjust polling interval dynamically. Stop polling if out of range.
  useEffect(() => {
    if (!shouldFetchTick || isOutOfRange) {
      setPollingInterval(0)
    } else {
      setPollingInterval(getPollingInterval(remaining, tickDuration))
    }
  }, [shouldFetchTick, isOutOfRange, remaining, tickDuration])

  // When tick is reached, refetch the transaction once
  useEffect(() => {
    if (tickReached && !hasRefetched.current) {
      hasRefetched.current = true
      opts.refetch()
    }
  }, [tickReached]) // eslint-disable-line react-hooks/exhaustive-deps

  return {
    isLoading: isTickInfoLoading,
    isWaitingForTick,
    isOutOfRange: shouldFetchTick && isOutOfRange,
    targetTick: shouldFetchTick ? targetTick : undefined,
    currentTick: shouldFetchTick ? currentTick : undefined,
    remaining: isWaitingForTick && remaining !== undefined && remaining > 0 ? remaining : undefined
  }
}
