import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { MagnifyIcon, XmarkIcon } from '@app/assets/icons'
import { Alert, Modal } from '@app/components/ui'
import { ErrorBoundary } from '@app/components/ui/error-boundaries'
import { LinearProgress } from '@app/components/ui/loaders'
import { useAppDispatch, useAppSelector } from '@app/hooks/redux'
import { Routes } from '@app/router'
import { getSearch, resetSearch, SearchType, selectSearch } from '@app/store/searchSlice'
import { formatDate, formatString, isValidQubicAddress } from '@app/utils'
import EntityResultItem from './EntityResultItem'
import ResultItem from './ResultItem'
import { useEntitySearch } from './useEntitySearch'

const evaluateSearchType = (keyword: string): SearchType | null => {
  const trimmedKeyword = keyword.trim()
  if (trimmedKeyword.length === 60) {
    if (/^[A-Z\s]+$/.test(trimmedKeyword)) {
      return SearchType.ADDRESS
    }
    if (/^[a-z]+$/.test(trimmedKeyword)) {
      return SearchType.TX
    }
  }
  // Check if it's a valid tick number (digits with optional commas)
  const withoutCommas = keyword.replace(/,/g, '').trim()
  if (/^\d+$/.test(withoutCommas) && withoutCommas.length > 0) {
    return SearchType.TICK
  }
  return null
}

export default function SearchBar() {
  const { t } = useTranslation('global')
  const { t: tNetwork } = useTranslation('network-page')
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { result: searchResult, isLoading, error } = useAppSelector(selectSearch)
  const [open, setOpen] = useState(false)
  const [keyword, setKeyword] = useState('')
  const [debouncedKeyword, setDebouncedKeyword] = useState('')
  const [isAddressValid, setIsAddressValid] = useState<boolean | null>(null)
  // Track pending Enter navigation for entity searches (stores the keyword to match)
  const [pendingEntityNavigation, setPendingEntityNavigation] = useState<string | null>(null)
  const addressValidationRequestId = useRef(0)

  // Unified debounce for all search types
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(keyword)
    }, 300)
    return () => clearTimeout(timer)
  }, [keyword])

  // Memoize search type to avoid recalculating on each render
  const debouncedSearchType = useMemo(
    () => evaluateSearchType(debouncedKeyword),
    [debouncedKeyword]
  )

  const isDebounceSynced = useMemo(
    () => keyword.trim() === debouncedKeyword.trim(),
    [keyword, debouncedKeyword]
  )

  // Entity search for exchanges, smart contracts, and tokens
  const {
    exactMatch: entityExactMatch,
    partialMatches: entityPartialMatches,
    isLoading: entitySearchLoading
  } = useEntitySearch(debouncedKeyword)

  // Calculate total entity results for navigation logic
  const entityResultCount = useMemo(
    () => (entityExactMatch ? 1 : 0) + entityPartialMatches.length,
    [entityExactMatch, entityPartialMatches]
  )

  const searchResultMatchesQuery = useMemo(() => {
    if (!searchResult) return false
    const query = debouncedKeyword.trim()
    if (!query) return false
    if ('balance' in searchResult) return searchResult.balance.id === query
    if ('hash' in searchResult) return searchResult.hash === query
    if ('tickData' in searchResult) {
      const queryNumber = parseInt(query.replace(/,/g, ''), 10)
      return searchResult.tickData.tickNumber === queryNumber
    }
    return false
  }, [searchResult, debouncedKeyword])

  const shouldShowSearchResult =
    searchResultMatchesQuery &&
    isDebounceSynced &&
    (!searchResult || !('balance' in searchResult) || isAddressValid === true)

  const handleCloseCallback = useCallback(() => {
    setOpen(false)
    dispatch(resetSearch())
    setKeyword('')
    setDebouncedKeyword('')
    setIsAddressValid(null)
    setPendingEntityNavigation(null)
  }, [dispatch])

  // Clear stale search results when the input changes before debounce completes
  useEffect(() => {
    if (!searchResult) return
    if (keyword.trim() === debouncedKeyword.trim()) return
    dispatch(resetSearch())
  }, [keyword, debouncedKeyword, searchResult, dispatch])

  const handleKeyPressCallback = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      // Close modal on Escape
      if (event.key === 'Escape') {
        handleCloseCallback()
        return
      }

      if (event.key === 'Enter' && keyword !== '') {
        event.preventDefault()
        const type = evaluateSearchType(keyword)
        const trimmedKeyword = keyword.trim()

        // Handle tick/address/tx searches
        if (type === 'address') {
          const isSearchReady =
            debouncedKeyword === trimmedKeyword && isAddressValid !== null && !entitySearchLoading
          if (!isSearchReady || isAddressValid !== true) {
            return
          }
          navigate(Routes.NETWORK.ADDRESS(trimmedKeyword))
          handleCloseCallback()
        } else if (type === 'tx') {
          navigate(Routes.NETWORK.TX(trimmedKeyword))
          handleCloseCallback()
        } else if (type === 'tick') {
          navigate(Routes.NETWORK.TICK(parseInt(keyword.replace(/,/g, ''), 10)))
          handleCloseCallback()
        } else {
          // Handle entity searches - navigate only if exactly one result
          // Wait for debounce to catch up and search to complete before deciding
          const isSearchReady = debouncedKeyword === trimmedKeyword && !entitySearchLoading
          if (!isSearchReady) {
            // Search not ready yet, set pending navigation to auto-navigate when ready
            setPendingEntityNavigation(trimmedKeyword)
            return
          }

          if (entityResultCount === 1) {
            const entity = entityExactMatch || entityPartialMatches[0]
            navigate(Routes.NETWORK.ADDRESS(entity.address))
            handleCloseCallback()
          }
          // Zero or multiple results: keep modal open (shows "no results" or list)
        }
      }
    },
    [
      handleCloseCallback,
      keyword,
      navigate,
      entityResultCount,
      entityExactMatch,
      entityPartialMatches,
      debouncedKeyword,
      entitySearchLoading,
      isAddressValid
    ]
  )

  // Track previous search type to reset only when type changes
  const [prevSearchType, setPrevSearchType] = useState<SearchType | null>(null)

  // Validate address input (crypto) before searching/navigating
  useEffect(() => {
    if (!debouncedKeyword.trim()) {
      setIsAddressValid(null)
      return
    }

    if (debouncedSearchType !== SearchType.ADDRESS) {
      setIsAddressValid(null)
      return
    }

    addressValidationRequestId.current += 1
    const requestId = addressValidationRequestId.current
    const validate = async () => {
      const isValid = await isValidQubicAddress(debouncedKeyword.trim())
      if (addressValidationRequestId.current !== requestId) return
      setIsAddressValid(isValid)
      if (!isValid) {
        dispatch(resetSearch())
      }
    }

    validate()
  }, [debouncedKeyword, debouncedSearchType, dispatch])

  useEffect(() => {
    // Reset search result when type changes (e.g., from tick to entity search)
    if (debouncedSearchType !== prevSearchType) {
      dispatch(resetSearch())
      setPrevSearchType(debouncedSearchType)
    }

    // Only search when type is valid (address/tx requires 60 chars, tick is any number)
    if (debouncedKeyword && debouncedSearchType) {
      if (debouncedSearchType === SearchType.ADDRESS) {
        if (isAddressValid === false || isAddressValid === null) {
          return
        }
      }
      // Remove commas for tick searches (e.g., "43,329,624" -> "43329624")
      const query =
        debouncedSearchType === SearchType.TICK
          ? debouncedKeyword.replace(/,/g, '').trim()
          : debouncedKeyword.trim()
      dispatch(getSearch({ query, type: debouncedSearchType }))
    }
  }, [debouncedKeyword, debouncedSearchType, dispatch, prevSearchType, isAddressValid])

  // Handle pending entity navigation when search completes
  useEffect(() => {
    if (
      pendingEntityNavigation &&
      debouncedKeyword === pendingEntityNavigation &&
      !entitySearchLoading &&
      !debouncedSearchType // Entity search (not tick/address/tx)
    ) {
      if (entityResultCount === 1) {
        const entity = entityExactMatch || entityPartialMatches[0]
        navigate(Routes.NETWORK.ADDRESS(entity.address))
        handleCloseCallback()
      }
      // Clear pending navigation regardless of result count
      setPendingEntityNavigation(null)
    }
  }, [
    pendingEntityNavigation,
    debouncedKeyword,
    entitySearchLoading,
    debouncedSearchType,
    entityResultCount,
    entityExactMatch,
    entityPartialMatches,
    navigate,
    handleCloseCallback
  ])

  return (
    <ErrorBoundary fallback={<Alert variant="error" className="mx-5 my-2.5" />}>
      <button
        type="button"
        className="rounded-full p-8 transition-colors duration-500 ease-in-out hover:bg-muted"
        onClick={() => setOpen(true)}
        aria-label="search-button"
      >
        <MagnifyIcon className="h-18 w-18" />
      </button>
      <Modal
        id="search-modal"
        isOpen={open}
        className="top-40"
        closeOnOutsideClick
        onClose={handleCloseCallback}
      >
        <div className="h-fit w-full bg-card">
          {(isLoading || entitySearchLoading) && (
            <div className="absolute w-full">
              <LinearProgress />
            </div>
          )}

          <div className="flex w-full items-center justify-center border-y-[1px] border-border">
            <div className="relative mx-auto flex w-full max-w-[820px] items-center gap-8 pl-12 pr-12">
              <MagnifyIcon className="h-16 w-16 shrink-0" />
              <input
                className="w-full bg-inherit py-12 text-base placeholder:font-space placeholder:text-base placeholder:text-muted-foreground focus:outline-none sm:text-sm"
                placeholder={t('searchPlaceholder')}
                value={keyword}
                // eslint-disable-next-line jsx-a11y/no-autofocus
                autoFocus
                onChange={(e) => {
                  setKeyword(e.target.value)
                }}
                onKeyDown={handleKeyPressCallback}
              />
              <button
                type="button"
                className="shrink-0"
                onClick={handleCloseCallback}
                aria-label="close-button"
              >
                <XmarkIcon className="h-24 w-24 text-gray-50" />
              </button>
            </div>
          </div>

          {/* Show "no results" for Redux search errors or entity search with no matches */}
          {((error && !entityExactMatch && entityPartialMatches.length === 0) ||
            (debouncedKeyword &&
              debouncedSearchType === SearchType.ADDRESS &&
              isAddressValid === false) ||
            (debouncedKeyword &&
              !debouncedSearchType &&
              !entitySearchLoading &&
              !entityExactMatch &&
              entityPartialMatches.length === 0)) && (
            <div className="mx-auto flex max-w-[800px] flex-col items-center gap-8 py-32">
              <MagnifyIcon className="h-32 w-32 text-gray-50" />
              <p className="font-space text-base font-500">{t('noResultsFound')}</p>
              <p className="text-sm text-gray-50">
                {t('noResultsFoundFor', { keyword: debouncedKeyword })}
              </p>
            </div>
          )}

          {(shouldShowSearchResult ||
            entityExactMatch ||
            (entityPartialMatches.length > 0 && !debouncedSearchType)) && (
            <div className="mx-auto max-h-[320px] max-w-[800px] overflow-y-scroll pb-20 scrollbar scrollbar-track-transparent scrollbar-thumb-muted-foreground scrollbar-thumb-rounded-full scrollbar-w-4">
              <p className="px-12 pb-8 pt-12 font-space text-12 text-gray-50">
                {tNetwork('matchingEntities')}
              </p>
              {shouldShowSearchResult && searchResult && 'balance' in searchResult && (
                <ResultItem
                  type="address"
                  result={formatString(searchResult.balance.id)}
                  subInfo={`${t('balance')}: ${formatString(searchResult.balance.balance)}`}
                  link={Routes.NETWORK.ADDRESS(searchResult.balance.id)}
                  onClick={handleCloseCallback}
                />
              )}
              {shouldShowSearchResult && searchResult && 'hash' in searchResult && (
                <ResultItem
                  type="transaction"
                  result={formatString(searchResult.hash)}
                  subInfo={`${t('tick')}: ${formatString(searchResult.tickNumber)}`}
                  link={Routes.NETWORK.TX(searchResult.hash)}
                  onClick={handleCloseCallback}
                />
              )}
              {shouldShowSearchResult && searchResult && 'tickData' in searchResult && (
                <ResultItem
                  type="tick"
                  result={formatString(searchResult.tickData.tickNumber)}
                  subInfo={formatDate(searchResult.tickData.timestamp)}
                  link={Routes.NETWORK.TICK(searchResult.tickData.tickNumber)}
                  onClick={handleCloseCallback}
                />
              )}

              {/* Entity search results (exchanges, smart contracts, tokens) */}
              {!debouncedSearchType && (entityExactMatch || entityPartialMatches.length > 0) && (
                <div className="space-y-4">
                  {entityExactMatch && (
                    <EntityResultItem
                      entity={entityExactMatch}
                      searchTerm={keyword}
                      onClick={handleCloseCallback}
                    />
                  )}
                  {entityPartialMatches
                    .filter((match) => match.address !== entityExactMatch?.address)
                    .map((entity) => (
                      <EntityResultItem
                        key={entity.address}
                        entity={entity}
                        searchTerm={keyword}
                        onClick={handleCloseCallback}
                      />
                    ))}
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>
    </ErrorBoundary>
  )
}
