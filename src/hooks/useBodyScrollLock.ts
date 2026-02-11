import { useEffect } from 'react'

/**
 * Hook to lock/unlock body scroll when a modal or overlay is open.
 * Automatically restores scroll on unmount.
 *
 * @param isLocked - Whether to lock the body scroll
 */
export default function useBodyScrollLock(isLocked: boolean): void {
  useEffect(() => {
    if (isLocked) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isLocked])
}
