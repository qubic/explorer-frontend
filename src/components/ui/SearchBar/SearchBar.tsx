import { CameraIcon, GridAddIcon, MagnifyIcon, XmarkIcon } from '@app/assets/icons'
import { useAppDispatch, useAppSelector } from '@app/hooks/redux'
import { Routes } from '@app/router'
import { getSearch, resetSearch, searchSelector } from '@app/store/searchSlice'
import { formatBase64, formatDate, formatString } from '@app/utils'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { LinearProgress } from '../loaders'
import Modal from '../Modal'
import ResultItem from './ResultItem'

const evaluateSearchType = (keyword: string) => {
  const trimmedKeyword = keyword.trim()
  if (trimmedKeyword.length === 60) {
    if (/^[A-Z\s]+$/.test(trimmedKeyword)) {
      return 'address'
    }
    if (/^[a-z]+$/.test(trimmedKeyword)) {
      return 'tx'
    }
  } else if (parseInt(keyword.replace(/,/g, ''), 10).toString().length === 8) {
    return 'tick'
  }
  return null
}

export default function SearchBar() {
  const { t } = useTranslation('global')
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { result: searchResult, isLoading, error } = useAppSelector(searchSelector)
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
    <>
      <button
        type="button"
        className="hover:bg-gray-70/80 p-8 rounded-full"
        onClick={() => setOpen(true)}
        aria-label="search-button"
      >
        <MagnifyIcon className="w-24 h-24" />
      </button>
      <Modal
        id="search-modal"
        isOpen={open}
        className="top-60"
        closeOnOutsideClick
        onClose={handleCloseCallback}
      >
        <div className="w-full h-fit bg-gray-80">
          {isLoading && (
            <div className="absolute w-full">
              <LinearProgress />
            </div>
          )}

          <div className="flex justify-center items-center w-full relative border-y-[1px] border-gray-70">
            <div className="flex items-center bg-gray-40 mx-auto max-w-[820px] w-full gap-8 pl-12 pr-20">
              <MagnifyIcon className="w-16 h-16" />
              <input
                className="w-full py-12 pr-20 bg-inherit focus:outline-none placeholder:font-space placeholder:text-14 placeholder:text-gray-50 text-14"
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
              <XmarkIcon className="w-24 h-24" />
            </button>
          </div>

          {error && (
            <div className="mt-12 max-w-[800px] mx-auto pb-10">
              <p className="text-center font-space ">{t('noResult')}</p>
            </div>
          )}

          {searchResult && (
            <div className="max-h-[320px] overflow-y-scroll max-w-[800px] mx-auto pb-20 scrollbar scrollbar-track-transparent scrollbar-thumb-gray-70 scrollbar-thumb-rounded-full scrollbar-w-4">
              {'balance' in searchResult && (
                <ResultItem
                  icon={<GridAddIcon className="min-w-16 min-h-16 w-16 h-16 mr-6" />}
                  title={`Qubic ${t('address')}`}
                  result={formatString(searchResult.balance.id)}
                  label={t('balance')}
                  info={formatString(searchResult.balance.balance)}
                  link={Routes.NETWORK.ADDRESS(searchResult.balance.id)}
                  onClick={handleCloseCallback}
                />
              )}
              {'transaction' in searchResult && (
                <ResultItem
                  icon={<CameraIcon className="w-16 h-16 mr-6" />}
                  title={t('transaction')}
                  result={formatString(searchResult.transaction.txId)}
                  label={t('tick')}
                  info={formatString(searchResult.transaction.tickNumber)}
                  link={Routes.NETWORK.TX(searchResult.transaction.txId)}
                  onClick={handleCloseCallback}
                />
              )}
              {'tickData' in searchResult && (
                <ResultItem
                  icon={<CameraIcon className="min-w-16 w-16 h-16 mr-6" />}
                  title={t('tick')}
                  result={formatBase64(searchResult.tickData.signatureHex)}
                  label={t('from')}
                  info={formatDate(searchResult.tickData.timestamp)}
                  link={Routes.NETWORK.TICK(searchResult.tickData.tickNumber)}
                  onClick={handleCloseCallback}
                  items={searchResult.tickData.transactionIds}
                />
              )}
            </div>
          )}
        </div>
      </Modal>
    </>
  )
}
