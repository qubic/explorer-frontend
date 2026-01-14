import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

// Default function for extracting transaction ID
const defaultGetTransactionId = <T>(tx: T): string =>
  (tx as { transaction: { txId: string } }).transaction.txId

export interface UseTransactionExpandCollapseOptions<T> {
  /**
   * List of transactions to manage expand/collapse state for
   */
  transactions: T[]
  /**
   * Extract transaction ID from a transaction object
   * Defaults to accessing 'transaction.txId' if not provided
   */
  getTransactionId?: (transaction: T) => string
  /**
   * Optional dependency value that triggers a reset (e.g., addressId, tick number)
   * When this value changes, all expand state is reset
   */
  resetDependency?: string | number
}

export interface UseTransactionExpandCollapseReturn {
  /**
   * Boolean indicating if "Expand All" is active
   */
  expandAll: boolean
  /**
   * Set of transaction IDs that are currently expanded
   */
  expandedTxIds: Set<string>
  /**
   * Handler for the "Expand All / Collapse All" button
   */
  handleExpandAllChange: (checked: boolean) => void
  /**
   * Handler for individual transaction toggle
   */
  handleTxToggle: (txId: string, isOpen: boolean) => void
}

/**
 * Custom hook to manage expand/collapse state for transaction lists
 * Handles:
 * - Individual transaction expand/collapse
 * - Expand all / Collapse all functionality
 * - Auto-expansion of newly loaded transactions when expandAll is active
 * - Reset state when navigating to a new page (based on resetDependency)
 */
export function useTransactionExpandCollapse<T>({
  transactions,
  getTransactionId,
  resetDependency
}: UseTransactionExpandCollapseOptions<T>): UseTransactionExpandCollapseReturn {
  const [expandAll, setExpandAll] = useState(false)
  const [expandedTxIds, setExpandedTxIds] = useState<Set<string>>(new Set())
  // Track items manually collapsed by user while expandAll is active
  const [manuallyCollapsedTxIds, setManuallyCollapsedTxIds] = useState<Set<string>>(new Set())

  // Use ref to access expandAll in handleTxToggle without recreating the callback
  const expandAllRef = useRef(expandAll)
  expandAllRef.current = expandAll

  // Use stable reference for the ID extractor function
  const getIdFn = getTransactionId || defaultGetTransactionId

  // Memoize the transaction IDs to avoid recalculating on every render
  const transactionIds = useMemo(() => transactions.map(getIdFn), [transactions, getIdFn])

  // Reset expand state when resetDependency changes (e.g., new tick or address)
  useEffect(() => {
    setExpandAll(false)
    setExpandedTxIds(new Set())
    setManuallyCollapsedTxIds(new Set())
  }, [resetDependency])

  // Auto-expand newly loaded transactions when expandAll is active
  // Skip items that user has manually collapsed
  useEffect(() => {
    if (expandAll && transactionIds.length > 0) {
      setExpandedTxIds((prev) => {
        const newSet = new Set(prev)
        // Only add transaction IDs that don't already exist and weren't manually collapsed
        transactionIds.forEach((txId) => {
          if (!newSet.has(txId) && !manuallyCollapsedTxIds.has(txId)) {
            newSet.add(txId)
          }
        })
        // Only update state if there are actually new items
        if (newSet.size !== prev.size) {
          return newSet
        }
        return prev
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- manuallyCollapsedTxIds is checked inside but doesn't need to trigger re-run
  }, [transactionIds, expandAll])

  const handleExpandAllChange = useCallback(
    (checked: boolean) => {
      setExpandAll(checked)
      // Clear manually collapsed tracking on any expand/collapse all action
      setManuallyCollapsedTxIds(new Set())
      if (checked) {
        // Expand all displayed transactions
        setExpandedTxIds(new Set(transactionIds))
      } else {
        // Collapse all
        setExpandedTxIds(new Set())
      }
    },
    [transactionIds]
  )

  const handleTxToggle = useCallback((txId: string, isOpen: boolean) => {
    // Track manually collapsed items when expandAll is active (use ref for stable callback)
    if (!isOpen && expandAllRef.current) {
      setManuallyCollapsedTxIds((prev) => new Set(prev).add(txId))
    }
    // If user expands an item that was manually collapsed, remove from tracking
    if (isOpen) {
      setManuallyCollapsedTxIds((prev) => {
        if (prev.has(txId)) {
          const newSet = new Set(prev)
          newSet.delete(txId)
          return newSet
        }
        return prev
      })
    }
    setExpandedTxIds((prev) => {
      const newSet = new Set(prev)
      if (isOpen) {
        newSet.add(txId)
      } else {
        newSet.delete(txId)
      }
      return newSet
    })
  }, [])

  return {
    expandAll,
    expandedTxIds,
    handleExpandAllChange,
    handleTxToggle
  }
}
