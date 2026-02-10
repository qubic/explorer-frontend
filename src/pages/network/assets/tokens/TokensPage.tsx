import { memo, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'

import { withHelmet } from '@app/components/hocs'
import { Breadcrumbs } from '@app/components/ui'
import { PageLayout } from '@app/components/ui/layouts'
import { useTailwindBreakpoint } from '@app/hooks'
import { useGetAssetsIssuancesQuery } from '@app/store/apis/rpc-live'
import { useGetTokenCategoriesQuery } from '@app/store/apis/qubic-static'
import {
  TOKEN_CATEGORY_ALL,
  isAssetsIssuerAddress,
  type CategoryFilter,
  filterTokensByCategory
} from '@app/utils'
import { HomeLink } from '../../components'
import { CategoryChips, TokenRow, TokensErrorRow, TokenSkeletonRow } from './components'

const TokensLoadingRows = memo(() =>
  Array.from({ length: 5 }).map((_, index) => <TokenSkeletonRow key={String(`${index}`)} />)
)

function TokensPage() {
  const { t } = useTranslation('network-page')
  const { isMobile } = useTailwindBreakpoint()
  const [searchParams, setSearchParams] = useSearchParams()
  const selectedCategory: CategoryFilter = searchParams.get('category') || TOKEN_CATEGORY_ALL

  const handleCategoryChange = useCallback(
    (category: CategoryFilter) => {
      setSearchParams(
        (prev) => {
          if (category === TOKEN_CATEGORY_ALL) {
            prev.delete('category')
          } else {
            prev.set('category', category)
          }
          return prev
        },
        { replace: true }
      )
    },
    [setSearchParams]
  )

  const { data, isLoading, error } = useGetAssetsIssuancesQuery()
  const { data: categoriesData } = useGetTokenCategoriesQuery()

  const allTokens = useMemo(
    () =>
      data?.assets
        .filter(({ data: asset }) => !isAssetsIssuerAddress(asset.issuerIdentity))
        .sort((a, b) => a.data.name.localeCompare(b.data.name)) ?? [],
    [data]
  )

  const tokens = useMemo(() => {
    const categories = categoriesData?.categories ?? []

    if (selectedCategory === TOKEN_CATEGORY_ALL) {
      return allTokens
    }

    const tokenData = allTokens.map(({ data: token }) => ({
      name: token.name,
      issuerIdentity: token.issuerIdentity
    }))

    const filteredTokenData = filterTokensByCategory(tokenData, selectedCategory, categories)
    const filteredNames = new Set(
      filteredTokenData.map((token) => `${token.name}-${token.issuerIdentity}`)
    )

    return allTokens.filter(({ data: token }) =>
      filteredNames.has(`${token.name}-${token.issuerIdentity}`)
    )
  }, [allTokens, categoriesData, selectedCategory])

  const renderTableContent = useCallback(() => {
    if (isLoading) return <TokensLoadingRows />

    if (error || tokens.length === 0) {
      return <TokensErrorRow />
    }

    return tokens.map(({ data: tokenAsset }) => (
      <TokenRow
        key={`${tokenAsset.name}-${tokenAsset.issuerIdentity}`}
        asset={tokenAsset}
        isMobile={isMobile}
      />
    ))
  }, [isLoading, error, tokens, isMobile])

  return (
    <PageLayout className="space-y-20">
      <Breadcrumbs aria-label="breadcrumb">
        <HomeLink />
        <p className="text-xs text-primary-30">{t('tokens')}</p>
      </Breadcrumbs>
      <div className="space-y-14 md:space-y-28">
        <div className="flex flex-col justify-between space-y-10 sm:flex-row sm:items-end">
          <div>
            <p className="font-space text-24 font-500 leading-26">{t('Tokens')}</p>
          </div>
        </div>
        {categoriesData && categoriesData.categories.length > 0 && (
          <CategoryChips
            categoriesData={categoriesData}
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
            showAll
          />
        )}
        <div className="w-full rounded-12 border-1 border-primary-60 bg-primary-70">
          <div className="overflow-x-scroll">
            <table className="w-full">
              <thead className="border-b-1 border-primary-60 text-left font-space text-sm text-gray-50">
                <tr>
                  <th className="px-10 py-16 text-left text-xs font-400 sm:text-sm">
                    <span className="text-gray-50">{t('name')}</span>
                  </th>
                  <th className="px-10 py-16 text-xs font-400 sm:p-16 sm:text-sm">
                    <span className="text-gray-50">{t('issuer')}</span>
                  </th>
                </tr>
              </thead>
              <tbody>{renderTableContent()}</tbody>
            </table>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}

const TokensPageWithHelmet = withHelmet(TokensPage, {
  title: 'Tokens | Qubic Explorer',
  meta: [{ name: 'description', content: 'Check the tokens of Qubic Network' }]
})

export default TokensPageWithHelmet
