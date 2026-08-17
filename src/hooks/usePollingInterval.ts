import { useSyncExternalStore } from 'react'

function subscribe(onChange: () => void): () => void {
  document.addEventListener('visibilitychange', onChange)
  return () => document.removeEventListener('visibilitychange', onChange)
}

function getSnapshot(): boolean {
  return document.visibilityState === 'visible'
}

/**
 * Returns the given polling interval while the tab is visible and 0 (polling
 * disabled) while it is hidden, so RTK Query stops hitting the APIs when nobody
 * is looking at the page.
 *
 * We deliberately do NOT rely on RTK Query's `skipPollingIfUnfocused` option:
 * its poll timer reads `state.config.focused` from a snapshot captured when the
 * timer was armed, so the first poll after the tab is hidden still fires
 * (present in RTK 2.2.x through at least 2.12). Changing `pollingInterval` to 0
 * goes through `updateSubscriptionOptions` instead, which clears the timer
 * immediately. Pair with `refetchOnFocus: true` so data is refreshed as soon as
 * the tab is visible again.
 *
 * @param intervalMs - Polling interval to use while the tab is visible
 */
export default function usePollingInterval(intervalMs: number): number {
  const isVisible = useSyncExternalStore(subscribe, getSnapshot, () => true)
  return isVisible ? intervalMs : 0
}
