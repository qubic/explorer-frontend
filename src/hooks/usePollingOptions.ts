import { useSyncExternalStore } from 'react'
import type { SubscriptionOptions } from '@reduxjs/toolkit/query'

type PollingOptions = Pick<SubscriptionOptions, 'pollingInterval' | 'refetchOnFocus'>

function subscribe(onChange: () => void): () => void {
  document.addEventListener('visibilitychange', onChange)
  return () => document.removeEventListener('visibilitychange', onChange)
}

function getSnapshot(): boolean {
  return document.visibilityState === 'visible'
}

/**
 * Query options for data that should be polled only while the user is looking
 * at the page: the interval applies while the tab is visible and drops to 0
 * (polling off) while it is hidden, and the data is refetched as soon as the tab
 * becomes visible again instead of waiting for the next interval.
 *
 * We deliberately do NOT rely on RTK Query's `skipPollingIfUnfocused` option:
 * its poll timer reads `state.config.focused` from a snapshot captured when the
 * timer was armed, so the first poll after the tab is hidden still fires
 * (present in RTK 2.2.x through at least 2.12). Changing `pollingInterval` to 0
 * goes through `updateSubscriptionOptions` instead, which clears the timer
 * immediately.
 *
 * @param intervalMs - Polling interval to use while the tab is visible
 */
export default function usePollingOptions(intervalMs: number): PollingOptions {
  const isVisible = useSyncExternalStore(subscribe, getSnapshot)
  return {
    pollingInterval: isVisible ? intervalMs : 0,
    refetchOnFocus: true
  }
}
