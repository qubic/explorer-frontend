import { useEffect, useState } from 'react'

/**
 * Captures a value from the *first* paginated response and keeps it stable
 * across subsequent pages, so it doesn't flicker as the user scrolls and
 * isn't stale after `resetKey` changes.
 *
 * Pass a stable primitive as `resetKey` (the identity that scopes the
 * paginated query — e.g. an address or contract index). Object/array
 * identities will churn the reset effect on every render.
 *
 * Only updates the anchor when `value` is defined, matching the typical
 * "wait until first-page data has actually arrived" semantic.
 */
export default function useFirstPageAnchor<T>(
  value: T | undefined,
  offset: number,
  resetKey: string | number | boolean | null
): T | undefined {
  const [anchored, setAnchored] = useState<T | undefined>(undefined)

  useEffect(() => {
    setAnchored(undefined)
  }, [resetKey])

  // `resetKey` is in the deps so this effect re-runs after the reset effect
  // when switching between two scopes whose `value` happens to be identical
  // — otherwise the anchor would be stuck on `undefined` after the reset.
  useEffect(() => {
    if (offset === 0 && value !== undefined) setAnchored(value)
  }, [value, offset, resetKey])

  return anchored
}
