import { useAppDispatch, useAppSelector } from '@app/hooks/redux'
import { useTranslation } from 'react-i18next'

import { Breadcrumbs, PaginationBar } from '@app/components/ui'
import { useTailwindBreakpoint } from '@app/hooks'
import { getRichList, selectRichList } from '@app/store/network/richListSlice'
import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { HomeLink } from '../components'
import { RichListErrorRow, RichListRow, RichListSkeletonRow } from './components'

const PAGE_SIZE = 15

const RichListLoadingRows = memo(() => {
  return Array.from({ length: PAGE_SIZE }).map((_, index) => (
    <RichListSkeletonRow key={String(`${index}`)} />
  ))
})

export default function RichListPage() {
  const { t } = useTranslation('network-page')
  const dispatch = useAppDispatch()
  const { entities, paginationInfo, isLoading, error } = useAppSelector(selectRichList)
  const [page, setPage] = useState(1)
  const { isMobile } = useTailwindBreakpoint()

  const handlePageChange = useCallback((value: number) => {
    setPage(value)
  }, [])

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

  const renderTableContent = useCallback(() => {
    if (isLoading) return <RichListLoadingRows />

    if (error || entitiesWithRank?.length === 0) {
      return <RichListErrorRow />
    }

    return entitiesWithRank?.map((entity) => (
      <RichListRow key={entity.identity} entity={entity} isMobile={isMobile} />
    ))
  }, [entitiesWithRank, isLoading, error, isMobile])

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
            <div className="overflow-x-scroll">
              <table className="w-full">
                <thead className="border-b-1 border-primary-60 text-left font-space text-sm text-gray-50">
                  <tr>
                    <th className="p-16 text-center font-400 sm:w-72">
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
                <tbody>{renderTableContent()}</tbody>
              </table>
            </div>
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
