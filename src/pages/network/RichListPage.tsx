import { useAppDispatch, useAppSelector } from '@app/hooks/redux'
import { useTranslation } from 'react-i18next'

import { Alert, Breadcrumbs, PaginationBar } from '@app/components/ui'
import { LinearProgress } from '@app/components/ui/loaders'
import { getRichList, selectRichList } from '@app/store/network/richListSlice'
import { formatString } from '@app/utils'
import { useEffect, useMemo, useState } from 'react'
import { AddressLink, HomeLink } from './components'

const PAGE_SIZE = 15

export default function RichListPage() {
  const { t } = useTranslation('network-page')
  const dispatch = useAppDispatch()
  const { entities, paginationInfo, isLoading, error } = useAppSelector(selectRichList)
  const [page, setPage] = useState(1)

  const handlePageChange = (value: number) => {
    setPage(value)
  }

  const entitiesWithRank = useMemo(
    () =>
      entities?.map((entity, index) => ({
        ...entity,
        rank: (paginationInfo.currentPage - 1) * PAGE_SIZE + index + 1
      })),
    [entities, paginationInfo]
  )

  useEffect(() => {
    dispatch(getRichList({ page, pageSize: PAGE_SIZE }))
  }, [dispatch, page])

  if (isLoading) {
    return (
      <div className="absolute w-full">
        <LinearProgress />
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="mx-auto max-w-[960px] space-y-20 px-20 py-32 md:space-y-40">
        <Breadcrumbs aria-label="breadcrumb">
          <HomeLink />
          <p className="text-xs text-primary-30">{t('richList')}</p>
        </Breadcrumbs>
        <div className="space-y-14 md:space-y-28">
          <div className="space-y-10">
            <p className="font-space text-24 font-500 leading-26">{t('richList')}</p>
            <p className="text-left text-sm text-gray-50">{t('richListWarning')}</p>
          </div>
          <div className="w-full rounded-12 border-1 border-primary-60 bg-primary-70">
            <table className="w-full">
              <thead className="border-b-1 border-primary-60 text-left font-space text-sm text-gray-50">
                <tr>
                  <th className="p-16 text-center font-400">
                    <span className="hidden text-gray-50 sm:block">{t('rank')}</span>
                  </th>
                  <th className="p-16 font-400">
                    <span className="text-gray-50">{t('addressID')}</span>
                  </th>
                  <th className="p-16 text-right font-400">
                    <span className="text-gray-50">{t('amount')} (QUBIC)</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {error || entitiesWithRank?.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="p-32">
                      <Alert variant="error">{t('richListLoadFailed')}</Alert>
                    </td>
                  </tr>
                ) : (
                  entitiesWithRank?.map((entity) => (
                    <tr key={entity.identity} className="border-b border-primary-60">
                      <td className="p-16 text-center font-space text-sm">{entity.rank}</td>
                      <td className="max-w-[30vw] overflow-hidden overflow-ellipsis whitespace-nowrap p-16 sm:max-w-[45vw] md:max-w-[50vw]">
                        <AddressLink value={entity.identity} />
                      </td>
                      <td className="p-16 text-right font-space text-sm">
                        {formatString(entity.balance)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <PaginationBar
              className="mx-auto w-fit gap-8 p-20"
              pageCount={paginationInfo.totalPages}
              page={paginationInfo.currentPage}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
