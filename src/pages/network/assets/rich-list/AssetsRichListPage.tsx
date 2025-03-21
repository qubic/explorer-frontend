import type { TFunction } from 'i18next'
import { memo, useCallback, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'

import { withHelmet } from '@app/components/hocs'
import { Breadcrumbs, PaginationBar, Select } from '@app/components/ui'
import { PageLayout } from '@app/components/ui/layouts'
import type { Option } from '@app/components/ui/Select'
import { SMART_CONTRACTS, SmartContracts } from '@app/constants/qubic'
import { useTailwindBreakpoint } from '@app/hooks'
import { useGetAssetsRichListQuery } from '@app/store/apis/archiver-v1'
import { ASSETS_ISSUER_ADDRESS } from '@app/utils/qubic-ts'
import { HomeLink } from '../../components'
import {
  AssetRichListEmptyRow,
  AssetRichListErrorRow,
  AssetRichListRow,
  AssetRichListSkeletonRow,
  AssetsTabs
} from './components'

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
    <AssetRichListSkeletonRow key={String(`${index}`)} />
  ))
)

function AssetsRichListPage() {
  const { t } = useTranslation('network-page')
  const { isMobile } = useTailwindBreakpoint()
  const [searchParams, setSearchParams] = useSearchParams()

  const issuerParam = searchParams.get('issuer') || ''
  const assetParam = searchParams.get('asset') || ''
  const page = parseInt(searchParams.get('page') || '1', 10)
  const pageSize = parseInt(searchParams.get('pageSize') ?? String(DEFAULT_PAGE_SIZE), 10)

  const pageSizeOptions = useMemo(() => getSelectOptions(t), [t])
  const defaultPageSizeOption = useMemo(
    () => pageSizeOptions.find((option) => option.value === String(pageSize)),
    [pageSizeOptions, pageSize]
  )

  const { data, isFetching, error } = useGetAssetsRichListQuery({
    issuer: issuerParam || ASSETS_ISSUER_ADDRESS,
    asset: assetParam || SMART_CONTRACTS[SmartContracts.Qx].name,
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
      data?.owners.map((entity, index) => ({
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
    if (!params.has('issuer')) {
      params.set('issuer', ASSETS_ISSUER_ADDRESS)
    }
    if (!params.has('asset')) {
      params.set('asset', SMART_CONTRACTS[SmartContracts.Qx].name)
    }
    setSearchParams(params)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- We only want to run this effect once
  }, [])

  const renderTableContent = useCallback(() => {
    if (isFetching) return <RichListLoadingRows pageSize={pageSize} />

    if (error) {
      return <AssetRichListErrorRow />
    }

    if (entitiesWithRank?.length === 0) {
      return <AssetRichListEmptyRow />
    }

    return entitiesWithRank?.map((entity) => (
      <AssetRichListRow key={entity.identity} entity={entity} isMobile={isMobile} />
    ))
  }, [entitiesWithRank, isFetching, error, isMobile, pageSize])

  return (
    <PageLayout className="space-y-20">
      <Breadcrumbs aria-label="breadcrumb">
        <HomeLink />
        <p className="text-xs text-primary-30">{t('assetsRichList')}</p>
      </Breadcrumbs>

      <div className="space-y-14 md:space-y-28">
        <div className="flex flex-col justify-between space-y-10 sm:flex-row sm:items-end">
          <div>
            <p className="font-space text-24 font-500 leading-26">{t('assetsRichList')}</p>
            <p className="text-left text-sm text-gray-50">{t('assetsRichListDesc')}</p>
          </div>
        </div>

        <div className="flex flex-col items-start justify-between gap-12 md:flex-row md:items-end">
          <AssetsTabs />

          <Select
            className="w-[170px] justify-self-start"
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
                    <span className="text-gray-50">{t('amount')}</span>
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

const AssetsRichListPageWithHelmet = withHelmet(AssetsRichListPage, {
  title: 'Assets Rich List | Qubic Explorer',
  meta: [{ name: 'description', content: 'Check the assets rich list of Qubic Network' }]
})

export default AssetsRichListPageWithHelmet
