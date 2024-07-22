import { CameraIcon, GridAddIcon, MagnifyIcon, XmarkIcon } from '@app/assets/icons'
import { getSearch, resetSearch, searchSelector } from '@app/store/searchSlice'
import { formatBase64, formatDate, formatString } from '@app/utils'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { LinearProgress } from '../loaders'
import ResultItem from './ResultItem'

const evaluateSearchType = (keyword: string) => {
  if (keyword.trim().length === 60) {
    if (/^[A-Z\s]+$/.test(keyword.trim())) {
      return 'address'
    }
    if (/^[a-z]+$/.test(keyword.trim())) {
      return 'tx'
    }
  } else if (parseInt(keyword.replace(/,/g, ''), 10).toString().length === 8) {
    return 'tick'
  }
  return ''
}

export default function SearchBar() {
  const { t } = useTranslation('global')
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { result: searchResult, isLoading, error } = useSelector(searchSelector)
  const [open, setOpen] = useState(false)
  const [keyword, setKeyword] = useState('')

  const handleClose = () => {
    setOpen(false)
    dispatch(resetSearch())
    setKeyword('')
  }

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && keyword !== '') {
      const type = evaluateSearchType(keyword)
      event.preventDefault()
      if (type === 'address') {
        navigate(`/network/address/${keyword.trim()}`)
      } else if (type === 'tx') {
        navigate(`/network/tx/${keyword.trim()}`)
      } else if (type === 'tick') {
        navigate(`/network/tick/${parseInt(keyword.replace(/,/g, ''), 10)}`)
      } else {
        navigate('/404')
      }
      handleClose()
    }
  }
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
      {open && (
        <div className="fixed inset-0 z-50 flex itemtart justify-center pt-60 bg-primary-60 bg-opacity-80">
          <div className="w-full">
            <div className="bg-gray-80">
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
                    onKeyDown={handleKeyPress}
                  />
                </div>
                <button
                  type="button"
                  className="absolute ltr:right-12 ltr:sm:right-24 rtl:left-12 rtl:sm:left-24"
                  onClick={handleClose}
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
                <div className="max-h-[320px] overflow-auto max-w-[800px] mx-auto pb-20">
                  {searchResult?.balance && (
                    <ResultItem
                      icon={<GridAddIcon className="min-w-16 min-h-16 w-16 h-16 mr-6" />}
                      title={`Qubic ${t('address')}`}
                      content={
                        <p className="text-14 font-sans">
                          {searchResult?.balance?.id}{' '}
                          <span className="text-gray-50">{t('balance')}:</span>{' '}
                          {formatString(searchResult?.balance?.balance)}
                        </p>
                      }
                      onClick={handleClose}
                      // TODO: Use path from routes obj
                      link={`/network/address/${searchResult?.balance?.id}`}
                    />
                  )}
                  {searchResult?.transaction && (
                    <ResultItem
                      icon={<CameraIcon className="w-16 h-16 mr-6" />}
                      title={t('transaction')}
                      content={
                        <p>
                          {searchResult?.transaction?.txId}{' '}
                          <span className="text-gray-50">{t('tick')}:</span>{' '}
                          {formatString(searchResult?.transaction?.tickNumber)}
                        </p>
                      }
                      // TODO: Use path from routes obj
                      link={`/network/tx/${searchResult?.transaction?.txId}`}
                      onClick={handleClose}
                    />
                  )}
                  {searchResult?.tickData && (
                    <ResultItem
                      icon={<CameraIcon className="w-16 h-16 mr-6" />}
                      title={t('tick')}
                      content={
                        <p>
                          {formatBase64(searchResult?.tickData?.signatureHex)}{' '}
                          <span className="text-gray-50">{t('from')}</span>{' '}
                          {formatDate(searchResult?.tickData?.timestamp)}
                        </p>
                      }
                      link={`/network/tick/${searchResult?.tickData?.tickNumber}`}
                      onClick={handleClose}
                      items={searchResult?.tickData?.transactionIds}
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
