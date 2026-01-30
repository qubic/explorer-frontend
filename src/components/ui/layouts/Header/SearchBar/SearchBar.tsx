import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { CameraIcon, GridAddIcon, MagnifyIcon, XmarkIcon } from '@app/assets/icons'
import { Alert, Modal } from '@app/components/ui'
import { ErrorBoundary } from '@app/components/ui/error-boundaries'
import { LinearProgress } from '@app/components/ui/loaders'
import { useAppDispatch, useAppSelector } from '@app/hooks/redux'
import { Routes } from '@app/router'
import { getSearch, resetSearch, SearchType, selectSearch } from '@app/store/searchSlice'
import { formatDate, formatString } from '@app/utils'
import ResultItem from './ResultItem'

const evaluateSearchType = (keyword: string): SearchType | null => {
  const trimmedKeyword = keyword.trim()
  if (trimmedKeyword.length === 60) {
    if (/^[A-Z\s]+$/.test(trimmedKeyword)) {
      return SearchType.ADDRESS
    }
    if (/^[a-z]+$/.test(trimmedKeyword)) {
      return SearchType.TX
    }
  } else if (parseInt(keyword.replace(/,/g, ''), 10).toString().length === 8) {
    return SearchType.TICK
  }
  return null
}

export default function SearchBar() {
  const { t } = useTranslation('global')
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { result: searchResult, isLoading, error } = useAppSelector(selectSearch)
  const [open, setOpen] = useState(false)
  const [keyword, setKeyword] = useState('')

  const handleCloseCallback = useCallback(() => {
    setOpen(false)
    dispatch(resetSearch())
    setKeyword('')
  }, [dispatch])

  const handleKeyPressCallback = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter' && keyword !== '') {
        event.preventDefault()
        const type = evaluateSearchType(keyword)
        const trimmedKeyword = keyword.trim()
        if (type === 'address') {
          navigate(Routes.NETWORK.ADDRESS(trimmedKeyword))
        } else if (type === 'tx') {
          navigate(Routes.NETWORK.TX(trimmedKeyword))
        } else if (type === 'tick') {
          navigate(Routes.NETWORK.TICK(parseInt(keyword.replace(/,/g, ''), 10)))
        } else {
          navigate(Routes.NOT_FOUND)
        }
        handleCloseCallback()
      }
    },
    [handleCloseCallback, keyword, navigate]
  )

  useEffect(() => {
    const timerId = setTimeout(() => {
      const type = evaluateSearchType(keyword)
      if (keyword && keyword.length > 1) {
        dispatch(getSearch({ query: keyword.trim(), type }))
      }
    }, 1000)
    return () => clearTimeout(timerId)
  }, [keyword, dispatch])

  return (
    <ErrorBoundary fallback={<Alert variant="error" className="mx-5 my-2.5" />}>
      <button
        type="button"
        className="rounded-full p-8 transition-colors duration-500 ease-in-out hover:bg-primary-70"
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
        <div className="h-fit w-full bg-primary-70">
          {isLoading && (
            <div className="absolute w-full">
              <LinearProgress />
            </div>
          )}

          <div className="relative flex w-full items-center justify-center border-y-[1px] border-primary-60">
            <div className="bg-gray-40 mx-auto flex w-full max-w-[820px] items-center gap-8 pl-12 pr-20">
              <MagnifyIcon className="h-16 w-16" />
              <input
                className="w-full bg-inherit py-12 pr-20 text-base placeholder:font-space placeholder:text-base placeholder:text-gray-50 focus:outline-none sm:text-sm"
                placeholder="Search TX, ticks, IDs..."
                value={keyword}
                // eslint-disable-next-line jsx-a11y/no-autofocus
                autoFocus
                onChange={(e) => {
                  setKeyword(e.target.value)
                }}
                onKeyDown={handleKeyPressCallback}
              />
            </div>
            <button
              type="button"
              className="absolute ltr:right-12 ltr:sm:right-24 rtl:left-12 rtl:sm:left-24"
              onClick={handleCloseCallback}
              aria-label="close-button"
            >
              <XmarkIcon className="h-24 w-24 text-gray-50" />
            </button>
          </div>

          {error && (
            <div className="mx-auto mt-12 max-w-[800px] pb-10">
              <p className="text-center font-space">{t('noResult')}</p>
            </div>
          )}

          {searchResult && (
            <div className="mx-auto max-h-[320px] max-w-[800px] overflow-y-scroll pb-20 scrollbar scrollbar-track-transparent scrollbar-thumb-primary-60 scrollbar-thumb-rounded-full scrollbar-w-4">
              {'balance' in searchResult && (
                <ResultItem
                  icon={<GridAddIcon className="mr-6 h-16 min-h-16 w-16 min-w-16" />}
                  title={`Qubic ${t('address')}`}
                  result={formatString(searchResult.balance.id)}
                  label={t('balance')}
                  info={formatString(searchResult.balance.balance)}
                  link={Routes.NETWORK.ADDRESS(searchResult.balance.id)}
                  onClick={handleCloseCallback}
                />
              )}
              {'hash' in searchResult && (
                <ResultItem
                  icon={<CameraIcon className="mr-6 h-16 w-16" />}
                  title={t('transaction')}
                  result={formatString(searchResult.hash)}
                  label={t('tick')}
                  info={formatString(searchResult.tickNumber)}
                  link={Routes.NETWORK.TX(searchResult.hash)}
                  onClick={handleCloseCallback}
                />
              )}
              {'tickData' in searchResult && (
                <ResultItem
                  icon={<CameraIcon className="mr-6 h-16 w-16 min-w-16" />}
                  title={t('tick')}
                  result={searchResult.tickData.signature}
                  label={t('from')}
                  info={formatDate(searchResult.tickData.timestamp)}
                  link={Routes.NETWORK.TICK(searchResult.tickData.tickNumber)}
                  onClick={handleCloseCallback}
                  items={searchResult.tickData.transactionHashes}
                />
              )}
            </div>
          )}
        </div>
      </Modal>
    </ErrorBoundary>
  )
}
