import { useCallback, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'

import { withHelmet } from '@app/components/hocs'
import { Breadcrumbs, PaginationBar, Select, TableErrorRow } from '@app/components/ui'
import { PageLayout } from '@app/components/ui/layouts'
import {
  RICH_LIST_DEFAULT_PAGE_SIZE,
  VALID_PAGE_SIZES,
  getPageSizeSelectOptions
} from '@app/constants'
import { usePaginationSearchParams, useTailwindBreakpoint } from '@app/hooks'
import { useGetAssetsIssuancesQuery } from '@app/store/apis/rpc-live'
import { useGetAssetsRichListQuery } from '@app/store/apis/rpc-stats'
import { HomeLink, RichListLoadingRows } from '../../components'
import {
  AssetRichListEmptyRow,
  AssetRichListInvalidAssetRow,
  AssetRichListRow,
  AssetsTabs
} from './components'

function AssetsRichListPage() {
  const { t } = useTranslation('network-page')
  const { isMobile } = useTailwindBreakpoint()
  const [searchParams, setSearchParams] = useSearchParams()

  const issuerParam = searchParams.get('issuer') || ''
  const assetParam = searchParams.get('asset') || ''
  const page = parseInt(searchParams.get('page') || '1', 10)
  const pageSizeParam = parseInt(
    searchParams.get('pageSize') ?? String(RICH_LIST_DEFAULT_PAGE_SIZE),
    10
  )
  const pageSize = VALID_PAGE_SIZES.includes(pageSizeParam)
    ? pageSizeParam
    : RICH_LIST_DEFAULT_PAGE_SIZE

  const pageSizeOptions = useMemo(() => getPageSizeSelectOptions(t), [t])
  const defaultPageSizeOption = useMemo(
    () => pageSizeOptions.find((option) => option.value === String(pageSize)),
    [pageSizeOptions, pageSize]
  )

  const { data: assetsData } = useGetAssetsIssuancesQuery()

  const isValidAsset = useMemo(() => {
    if (!issuerParam || !assetParam || !assetsData?.assets) return true
    return assetsData.assets.some(
      (asset) => asset.data.name === assetParam && asset.data.issuerIdentity === issuerParam
    )
  }, [issuerParam, assetParam, assetsData])

  const { handlePageChange, handlePageSizeChange } = usePaginationSearchParams()

  const { data, isFetching, error } = useGetAssetsRichListQuery(
    {
      issuer: issuerParam,
      asset: assetParam,
      page,
      pageSize
    },
    { skip: !issuerParam || !assetParam || !isValidAsset }
  )

  const entitiesWithRank = useMemo(
    () =>
      data?.owners.map((entity, index) => ({
        ...entity,
        rank: (data.pagination.currentPage - 1) * pageSize + index + 1
      })),
    [data, pageSize]
  )

  // Set URL defaults for page/pageSize only when asset/issuer are already present
  // This prevents interfering with AssetsTabs which handles initial asset selection
  useEffect(() => {
    const hasAsset = searchParams.has('asset') && searchParams.has('issuer')
    const hasPage = searchParams.has('page')
    const hasValidPageSize =
      searchParams.has('pageSize') && VALID_PAGE_SIZES.includes(pageSizeParam)

    // Only set page/pageSize defaults if asset/issuer already exist
    if (hasAsset && (!hasPage || !hasValidPageSize)) {
      setSearchParams(
        (prev) => ({
          ...Object.fromEntries(prev.entries()),
          ...(!prev.has('page') && { page: '1' }),
          ...(!prev.has('pageSize') && { pageSize: String(RICH_LIST_DEFAULT_PAGE_SIZE) })
        }),
        { replace: true }
      )
    }
  }, [searchParams, setSearchParams, pageSizeParam])

  const renderTableContent = useCallback(() => {
    if (isFetching) return <RichListLoadingRows pageSize={pageSize} />

    if (!isValidAsset) {
      return <AssetRichListInvalidAssetRow />
    }

    if (error) {
      return <TableErrorRow colSpan={4} message={t('richListLoadFailed')} />
    }

    if (entitiesWithRank?.length === 0) {
      return <AssetRichListEmptyRow />
    }

    return entitiesWithRank?.map((entity) => (
      <AssetRichListRow key={entity.identity} entity={entity} isMobile={isMobile} />
    ))
  }, [entitiesWithRank, isFetching, error, isMobile, pageSize, isValidAsset, t])

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
          <div className="overflow-x-auto">
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
