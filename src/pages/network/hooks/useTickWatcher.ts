import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { useGetLastProcessedTickQuery } from '@app/store/apis/query-service'

const MAX_TICK_RANGE = 800
const MAX_ERROR_COUNT = 5
// Rough estimate. The real duration from tickInfo can be 0 when the network
// ticks fast (sub-second) because the API returns an integer with no decimals.
const DEFAULT_TICK_DURATION = 2 // seconds per tick

function getPollingInterval(estimatedSeconds: number | undefined): number {
  if (estimatedSeconds === undefined) return 5000

  // Very far (>10min): poll very lazily
  if (estimatedSeconds > 600) return 30_000
  // Far (>2min): poll lazily
  if (estimatedSeconds > 120) return 15_000
  // Moderate (>30s): standard polling
  if (estimatedSeconds > 30) return 10_000
  // Getting close (>10s): moderate polling
  if (estimatedSeconds > 10) return 5000
  // Almost there: aggressive polling
  return 2000
}

interface TickWatcherResult {
  isLoading: boolean
  isWaitingForTick: boolean
  isTickCheckFailed: boolean
  targetTick: number | undefined
  currentTick: number | undefined
  estimatedWaitSeconds: number | undefined
}

export default function useTickWatcher(opts: {
  isTxNotFound: boolean
  refetch: () => void
}): TickWatcherResult {
  const [searchParams] = useSearchParams()
  const [pollingInterval, setPollingInterval] = useState(5000)
  const hasRefetched = useRef(false)
  const errorCount = useRef(0)
  const [hasGivenUp, setHasGivenUp] = useState(false)

  const targetTick = searchParams.get('tick') ? Number(searchParams.get('tick')) : undefined
  const isValidTargetTick = targetTick !== undefined && !Number.isNaN(targetTick) && targetTick > 0

  const shouldFetchTick = isValidTargetTick && opts.isTxNotFound

  // Reset when navigating to a different transaction/tick
  useEffect(() => {
    hasRefetched.current = false
    errorCount.current = 0
    setHasGivenUp(false)
  }, [targetTick])

  const lastProcessedTick = useGetLastProcessedTickQuery(undefined, {
    pollingInterval: shouldFetchTick ? pollingInterval : 0,
    skip: !shouldFetchTick
  })

  const currentTick = lastProcessedTick.data?.tickNumber
  const remaining =
    shouldFetchTick && currentTick !== undefined ? targetTick - currentTick : undefined
  const isInRange = remaining !== undefined && remaining > 0 && remaining <= MAX_TICK_RANGE
  const isOutOfRange = remaining !== undefined && remaining > MAX_TICK_RANGE
  const tickReached = shouldFetchTick && currentTick !== undefined && currentTick >= targetTick

  const estimatedWaitSeconds =
    remaining !== undefined && remaining > 0 ? remaining * DEFAULT_TICK_DURATION : undefined

  // Stays true while waiting for the first successful response
  const isTickInfoLoading = shouldFetchTick && currentTick === undefined && !hasGivenUp
  const isWaitingForTick =
    shouldFetchTick && !tickReached && !isTickInfoLoading && (isInRange || isOutOfRange)

  // Stop polling after consecutive errors to avoid spinning forever
  useEffect(() => {
    if (lastProcessedTick.isFetching) return

    if (lastProcessedTick.isError) {
      errorCount.current += 1
      if (errorCount.current >= MAX_ERROR_COUNT) {
        setHasGivenUp(true)
        setPollingInterval(0)
      }
    } else if (lastProcessedTick.isSuccess) {
      errorCount.current = 0
    }
  }, [lastProcessedTick.isFetching, lastProcessedTick.isError, lastProcessedTick.isSuccess])

  // Adjust polling interval dynamically. Poll lazily if out of range so the page recovers.
  // Stop polling entirely once the target tick has been reached.
  useEffect(() => {
    if (!shouldFetchTick || tickReached) {
      setPollingInterval(0)
    } else if (isOutOfRange) {
      setPollingInterval(60_000)
    } else {
      setPollingInterval(getPollingInterval(estimatedWaitSeconds))
    }
  }, [shouldFetchTick, isOutOfRange, estimatedWaitSeconds, tickReached])

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
    isTickCheckFailed: hasGivenUp,
    targetTick: shouldFetchTick ? targetTick : undefined,
    currentTick: shouldFetchTick ? currentTick : undefined,
    estimatedWaitSeconds: isWaitingForTick ? estimatedWaitSeconds : undefined
  }
}
