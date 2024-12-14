import { withHelmet } from '@app/components/hocs'
import { Breadcrumbs, PaginationBar, Select } from '@app/components/ui'
import type { Option } from '@app/components/ui/Select'
import { useTailwindBreakpoint } from '@app/hooks'
import { useGetRickListQuery } from '@app/store/apis/archiver-v1.api'
import type { TFunction } from 'i18next'
import { memo, useCallback, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { HomeLink } from '../components'
import { RichListErrorRow, RichListRow, RichListSkeletonRow } from './components'

const DEFAULT_PAGE_SIZE = 15

const PAGE_SIZE_OPTIONS = [
  { i18nKey: 'showItemsPerPage', value: '15' },
  { i18nKey: 'showItemsPerPage', value: '30' },
  { i18nKey: 'showItemsPerPage', value: '50' },
  { i18nKey: 'showItemsPerPage', value: '100' }
]

const getSelectOptions = (t: TFunction) =>
  PAGE_SIZE_OPTIONS.map((option) => ({
    label: t(option.i18nKey, { count: parseInt(option.value, 10) }),
    value: option.value
  }))

const RichListLoadingRows = memo(({ pageSize }: { pageSize: number }) =>
  Array.from({ length: pageSize }).map((_, index) => (
    <RichListSkeletonRow key={String(`${index}`)} />
  ))
)

function RichListPage() {
  const { t } = useTranslation('network-page')
  const { isMobile } = useTailwindBreakpoint()
  const [searchParams, setSearchParams] = useSearchParams()

  const page = parseInt(searchParams.get('page') || '1', 10)
  const pageSize = parseInt(searchParams.get('pageSize') ?? String(DEFAULT_PAGE_SIZE), 10)

  const pageSizeOptions = useMemo(() => getSelectOptions(t), [t])
  const defaultPageSizeOption = useMemo(
    () => pageSizeOptions.find((option) => option.value === String(pageSize)),
    [pageSizeOptions, pageSize]
  )

  const { data, isFetching, error } = useGetRickListQuery({
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
    const params = new URLSearchParams(searchParams)
    if (!params.has('page')) {
      params.set('page', '1')
    }
    if (!params.has('pageSize')) {
      params.set('pageSize', String(DEFAULT_PAGE_SIZE))
    }
    setSearchParams(params, { replace: true })
  }, [searchParams, setSearchParams])

  const renderTableContent = useCallback(() => {
    if (isFetching) return <RichListLoadingRows pageSize={pageSize} />

    if (error || entitiesWithRank?.length === 0) {
      return <RichListErrorRow />
    }

    return entitiesWithRank?.map((entity) => (
      <RichListRow key={entity.identity} entity={entity} isMobile={isMobile} />
    ))
  }, [entitiesWithRank, isFetching, error, isMobile, pageSize])

  return (
    <div className="w-full">
      <div className="mx-auto max-w-[960px] space-y-20 px-20 py-32 md:space-y-40">
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
              pageCount={data?.pagination.totalPages ?? 0}
              page={page}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

const RichListPageWithHelmet = withHelmet(RichListPage, {
  title: 'Rich List | Qubic Explorer',
  meta: [{ name: 'description', content: 'Check the addresses rich list of Qubic Network' }]
})

export default RichListPageWithHelmet
