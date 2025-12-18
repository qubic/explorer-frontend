import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'

import { Skeleton } from '@app/components/ui'
import { Button } from '@app/components/ui/buttons'
import type { IssuedAsset } from '@app/store/apis/rpc-live'
import { useGetAssetsIssuancesQuery } from '@app/store/apis/rpc-live'
import { useGetTokenCategoriesQuery } from '@app/store/apis/qubic-static'
import {
  clsxTwMerge,
  ASSET_CATEGORY_SC_SHARES,
  isAssetsIssuerAddress,
  type CategoryFilter,
  filterTokensByCategory
} from '@app/utils'
import { CategoryChips } from '@app/pages/network/assets/tokens/components'

const AssetTabsSkeleton = memo(({ items }: { items: number }) =>
  Array.from({ length: items }).map((_, index) => (
    <Skeleton key={String(`${index}`)} className="h-28 w-52" />
  ))
)

type AssetSelection = Pick<IssuedAsset, 'name' | 'issuerIdentity'>

export default function AssetsTabs() {
  const { t } = useTranslation('network-page')
  const [searchParams, setSearchParams] = useSearchParams()
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>(ASSET_CATEGORY_SC_SHARES)
  const [categorySelections, setCategorySelections] = useState<Record<string, AssetSelection>>({})

  const assetParam = searchParams.get('asset') || ''
  const issuerParam = searchParams.get('issuer') || ''

  const selectedAsset = useMemo(
    () => ({
      issuerIdentity: issuerParam,
      name: assetParam
    }),
    [assetParam, issuerParam]
  )

  const { data, isFetching } = useGetAssetsIssuancesQuery()
  const { data: categoriesData } = useGetTokenCategoriesQuery()

  const updateUrlParams = useCallback(
    ({ issuerIdentity, name }: AssetSelection) => {
      setSearchParams((prev) => ({
        ...Object.fromEntries(prev.entries()),
        issuer: issuerIdentity,
        asset: name,
        page: '1'
      }))
    },
    [setSearchParams]
  )

  const handleAssetChange = useCallback(
    (asset: IssuedAsset) => {
      // Remember selection for current category
      setCategorySelections((prev) => ({
        ...prev,
        [selectedCategory]: { name: asset.name, issuerIdentity: asset.issuerIdentity }
      }))
      updateUrlParams(asset)
    },
    [selectedCategory, updateUrlParams]
  )

  const allAssets = useMemo(() => {
    const assets = data?.assets.map((a) => a.data) ?? []
    return assets.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }))
  }, [data])

  const filteredAssets = useMemo(() => {
    const categories = categoriesData?.categories ?? []

    if (selectedCategory === ASSET_CATEGORY_SC_SHARES) {
      return allAssets.filter((asset) => isAssetsIssuerAddress(asset.issuerIdentity))
    }

    // Filter out SC shares for non-SC categories
    const nonScAssets = allAssets.filter((asset) => !isAssetsIssuerAddress(asset.issuerIdentity))

    const tokenData = nonScAssets.map((asset) => ({
      name: asset.name,
      issuerIdentity: asset.issuerIdentity
    }))

    const filteredTokenData = filterTokensByCategory(tokenData, selectedCategory, categories)
    const filteredKeys = new Set(
      filteredTokenData.map((token) => `${token.name}-${token.issuerIdentity}`)
    )

    return nonScAssets.filter((asset) => filteredKeys.has(`${asset.name}-${asset.issuerIdentity}`))
  }, [allAssets, categoriesData, selectedCategory])

  // Auto-select asset when category changes and current selection is not in filtered list
  // Prioritizes remembered selection for the category, then falls back to first asset
  // Exception: SC Shares defaults to QX
  useEffect(() => {
    if (filteredAssets.length === 0) return

    const currentAssetInList = filteredAssets.some(
      (asset) =>
        asset.issuerIdentity === selectedAsset.issuerIdentity && asset.name === selectedAsset.name
    )

    if (!currentAssetInList) {
      // Check if we have a remembered selection for this category
      const rememberedSelection = categorySelections[selectedCategory]
      if (rememberedSelection) {
        const rememberedAssetInList = filteredAssets.find(
          (asset) =>
            asset.issuerIdentity === rememberedSelection.issuerIdentity &&
            asset.name === rememberedSelection.name
        )
        if (rememberedAssetInList) {
          updateUrlParams(rememberedSelection)
          return
        }
      }

      // For SC Shares category, default to QX if available
      if (selectedCategory === ASSET_CATEGORY_SC_SHARES) {
        const qxAsset = filteredAssets.find((asset) => asset.name === 'QX')
        if (qxAsset) {
          handleAssetChange(qxAsset)
          return
        }
      }

      // Fall back to first asset if no remembered selection or it's not in the list
      const firstAsset = filteredAssets[0]
      handleAssetChange(firstAsset)
    }
  }, [
    filteredAssets,
    selectedAsset,
    selectedCategory,
    categorySelections,
    handleAssetChange,
    updateUrlParams
  ])

  const getButtonClasses = (isSelected: boolean) =>
    clsxTwMerge(
      isSelected
        ? 'bg-primary-30 text-primary-80 hover:bg-primary-30 hover:text-primary-80'
        : 'hover:text-primary-30'
    )

  return (
    <div className="grid gap-20">
      {categoriesData && categoriesData.categories.length > 0 && (
        <CategoryChips
          categoriesData={categoriesData}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          showScShares
          label={t('filterByCategory')}
        />
      )}
      <div className="flex flex-col gap-10">
        <h3 className="text-sm text-gray-50">{t('selectAsset')}</h3>
        <ul className="flex flex-wrap gap-10">
          {isFetching ? (
            <AssetTabsSkeleton items={8} />
          ) : (
            filteredAssets.map((asset) => {
              const isSelected =
                selectedAsset.issuerIdentity === asset.issuerIdentity &&
                selectedAsset.name === asset.name
              return (
                <li key={`${asset.name}-${asset.issuerIdentity}`}>
                  <Button
                    className={getButtonClasses(isSelected)}
                    variant="outlined"
                    size="xs"
                    onClick={() => handleAssetChange(asset)}
                  >
                    {asset.name}
                  </Button>
                </li>
              )
            })
          )}
        </ul>
      </div>
    </div>
  )
}
