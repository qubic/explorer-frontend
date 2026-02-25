import { memo, useCallback, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'

import { withHelmet } from '@app/components/hocs'
import {
  Breadcrumbs,
  PaginationBar,
  Select,
  TableErrorRow,
  TableSkeletonRow
} from '@app/components/ui'
import { PageLayout } from '@app/components/ui/layouts'
import type { Option } from '@app/components/ui/Select'
import { RICH_LIST_DEFAULT_PAGE_SIZE, getPageSizeSelectOptions } from '@app/constants'
import { useTailwindBreakpoint } from '@app/hooks'
import { useGetRichListQuery } from '@app/store/apis/rpc-stats'
import { HomeLink } from '../../components'
import { RichListRow } from './components'

const RICH_LIST_SKELETON_CELLS = [
  { id: 'rank-skeleton-cell', className: 'mx-auto size-16 xs:size-20' },
  {
    id: 'address-skeleton-cell',
    className:
      'h-16 w-96 xs:h-20 sm:h-40 sm:w-full sm:min-w-[248px] sm:max-w-[532px] md:w-[546px] 827px:h-20'
  },
  { id: 'name-skeleton-cell', className: 'size-16 xs:size-20 sm:w-84 w-72' },
  { id: 'amount-skeleton-cell', className: 'ml-auto h-16 w-136 xs:h-20' }
]

const RichListLoadingRows = memo(({ pageSize }: { pageSize: number }) =>
  Array.from({ length: pageSize }).map((_, index) => (
    <TableSkeletonRow key={String(`${index}`)} cells={RICH_LIST_SKELETON_CELLS} />
  ))
)

function RichListPage() {
  const { t } = useTranslation('network-page')
  const { isMobile } = useTailwindBreakpoint()
  const [searchParams, setSearchParams] = useSearchParams()

  const page = parseInt(searchParams.get('page') || '1', 10)
  const pageSize = parseInt(searchParams.get('pageSize') ?? String(RICH_LIST_DEFAULT_PAGE_SIZE), 10)

  const pageSizeOptions = useMemo(() => getPageSizeSelectOptions(t), [t])
  const defaultPageSizeOption = useMemo(
    () => pageSizeOptions.find((option) => option.value === String(pageSize)),
    [pageSizeOptions, pageSize]
  )

  const { data, isFetching, error } = useGetRichListQuery({
    page,
    pageSize
  })

  const handlePageChange = useCallback(
    (value: number) => {
      setSearchParams((prev) => ({
        ...Object.fromEntries(prev.entries()),
        page: value.toString()
      }))
    },
    [setSearchParams]
  )

  const handlePageSizeChange = useCallback(
    (option: Option) => {
      setSearchParams((prev) => ({
        ...Object.fromEntries(prev.entries()),
        pageSize: option.value,
        page: '1'
      }))
    },
    [setSearchParams]
  )

  const entitiesWithRank = useMemo(
    () =>
      data?.richList.entities?.map((entity, index) => ({
        ...entity,
        rank: (data.pagination.currentPage - 1) * pageSize + index + 1
      })),
    [data, pageSize]
  )

  useEffect(() => {
    const hasPage = searchParams.has('page')
    const hasPageSize = searchParams.has('pageSize')

    if (!hasPage || !hasPageSize) {
      setSearchParams(
        (prev) => ({
          ...Object.fromEntries(prev.entries()),
          ...(!prev.has('page') && { page: '1' }),
          ...(!prev.has('pageSize') && { pageSize: String(RICH_LIST_DEFAULT_PAGE_SIZE) })
        }),
        { replace: true }
      )
    }
  }, [searchParams, setSearchParams])

  const renderTableContent = useCallback(() => {
    if (isFetching) return <RichListLoadingRows pageSize={pageSize} />

    if (error || entitiesWithRank?.length === 0) {
      return <TableErrorRow colSpan={3} message={t('richListLoadFailed')} />
    }

    return entitiesWithRank?.map((entity) => (
      <RichListRow key={entity.identity} entity={entity} isMobile={isMobile} />
    ))
  }, [entitiesWithRank, isFetching, error, isMobile, pageSize, t])

  return (
    <PageLayout className="space-y-20">
      <Breadcrumbs aria-label="breadcrumb">
        <HomeLink />
        <p className="text-xs text-primary-30">{t('richList')}</p>
      </Breadcrumbs>
      <div className="space-y-14 md:space-y-28">
        <div className="flex flex-col justify-between space-y-10 sm:flex-row sm:items-end">
          <div>
            <p className="font-space text-24 font-500 leading-26">{t('richList')}</p>
            <p className="text-left text-sm text-gray-50">{t('richListWarning')}</p>
          </div>
          <Select
            className="w-[170px] justify-self-end"
            label={t('itemsPerPage')}
            defaultValue={defaultPageSizeOption}
            onSelect={handlePageSizeChange}
            options={pageSizeOptions}
          />
        </div>
        <div className="w-full rounded-12 border-1 border-primary-60 bg-primary-70">
          <div className="overflow-x-scroll">
            <table className="w-full">
              <thead className="border-b-1 border-primary-60 text-left font-space text-sm text-gray-50">
                <tr>
                  <th className="p-16 text-center font-400 sm:w-52">
                    <span className="hidden text-gray-50 sm:block">{t('rank')}</span>
                  </th>
                  <th className="p-16 font-400 md:min-w-[581px]">
                    <span className="whitespace-nowrap text-gray-50">{t('addressID')}</span>
                  </th>
                  <th className="p-16 font-400">
                    <span className="text-gray-50">{t('name')}</span>
                  </th>
                  <th className="w-[166px] whitespace-nowrap p-16 text-right font-400">
                    <span className="text-gray-50">{t('amount')} (QUBIC)</span>
                  </th>
                </tr>
              </thead>
              <tbody>{renderTableContent()}</tbody>
            </table>
          </div>
          <PaginationBar
            className="mx-auto w-fit gap-8 p-20"
            pageCount={data?.pagination.totalPages ?? 0}
            page={page}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </PageLayout>
  )
}

const RichListPageWithHelmet = withHelmet(RichListPage, {
  title: 'Rich List | Qubic Explorer',
  meta: [{ name: 'description', content: 'Check the addresses rich list of Qubic Network' }]
})

export default RichListPageWithHelmet
