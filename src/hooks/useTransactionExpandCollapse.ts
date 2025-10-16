import { useCallback, useEffect, useState } from 'react'

export interface UseTransactionExpandCollapseOptions<T> {
  /**
   * List of transactions to manage expand/collapse state for
   */
  transactions: T[]
  /**
   * Extract transaction ID from a transaction object
   */
  getTransactionId: (transaction: T) => string
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

  // Reset expand state when resetDependency changes (e.g., new tick or address)
  useEffect(() => {
    setExpandAll(false)
    setExpandedTxIds(new Set())
  }, [resetDependency])

  // Auto-expand newly loaded transactions when expandAll is active
  useEffect(() => {
    if (expandAll && transactions.length > 0) {
      setExpandedTxIds((prev) => {
        const newSet = new Set(prev)
        // Only add transaction IDs that don't already exist
        transactions.forEach((tx) => {
          const txId = getTransactionId(tx)
          if (!newSet.has(txId)) {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactions.length, expandAll])

  const handleExpandAllChange = useCallback(
    (checked: boolean) => {
      setExpandAll(checked)
      if (checked) {
        // Expand all displayed transactions
        const allTxIds = new Set(transactions.map(getTransactionId))
        setExpandedTxIds(allTxIds)
      } else {
        // Collapse all
        setExpandedTxIds(new Set())
      }
    },
    [transactions, getTransactionId]
  )

  const handleTxToggle = useCallback((txId: string, isOpen: boolean) => {
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
