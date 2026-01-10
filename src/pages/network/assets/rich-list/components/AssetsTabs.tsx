import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
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
  QX_ASSET_NAME,
  isAssetsIssuerAddress,
  type CategoryFilter,
  filterTokensByCategory,
  findTokenCategory
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
  const [hasInitializedCategory, setHasInitializedCategory] = useState(false)
  const hasInvalidUrlParams = useRef(false)

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
    ({ issuerIdentity, name }: AssetSelection, forceResetPage = false) => {
      const currentIssuer = searchParams.get('issuer')
      const currentAsset = searchParams.get('asset')
      const isAssetChanging = currentIssuer !== issuerIdentity || currentAsset !== name

      if (!isAssetChanging && !forceResetPage) {
        return
      }

      setSearchParams((prev) => ({
        ...Object.fromEntries(prev.entries()),
        issuer: issuerIdentity,
        asset: name,
        ...((isAssetChanging || forceResetPage) && { page: '1' })
      }))
    },
    [searchParams, setSearchParams]
  )

  const handleAssetChange = useCallback(
    (asset: IssuedAsset) => {
      hasInvalidUrlParams.current = false
      setCategorySelections((prev) => ({
        ...prev,
        [selectedCategory]: { name: asset.name, issuerIdentity: asset.issuerIdentity }
      }))
      updateUrlParams(asset, true)
    },
    [selectedCategory, updateUrlParams]
  )

  const allAssets = useMemo(() => {
    const assets = data?.assets.map((a) => a.data) ?? []
    return assets.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }))
  }, [data])

  // Detect category from URL params on initial load - only runs once
  const hasRunCategoryDetection = useRef(false)
  useEffect(() => {
    if (hasRunCategoryDetection.current) return
    if (!allAssets.length) return
    if (!assetParam || !issuerParam) {
      hasRunCategoryDetection.current = true
      setHasInitializedCategory(true)
      return
    }

    const urlAsset = allAssets.find(
      (asset) => asset.name === assetParam && asset.issuerIdentity === issuerParam
    )

    if (!urlAsset) {
      hasRunCategoryDetection.current = true
      setHasInitializedCategory(true)
      hasInvalidUrlParams.current = true
      return
    }

    // Check if it's an SC Share - no need to wait for categories
    if (isAssetsIssuerAddress(urlAsset.issuerIdentity)) {
      hasRunCategoryDetection.current = true
      setHasInitializedCategory(true)
      setSelectedCategory(ASSET_CATEGORY_SC_SHARES)
      return
    }

    // For non-SC assets, wait for categories data before determining category
    if (!categoriesData?.categories) return

    hasRunCategoryDetection.current = true
    setHasInitializedCategory(true)

    const detectedCategory = findTokenCategory(urlAsset, categoriesData.categories)
    setSelectedCategory(detectedCategory)
  }, [allAssets, assetParam, issuerParam, categoriesData])

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

  // Handle category change from user action
  const handleCategoryChange = useCallback((category: CategoryFilter) => {
    setSelectedCategory(category)
  }, [])

  // Store category selections in a ref to avoid effect re-runs
  const categorySelectionsRef = useRef<Record<string, AssetSelection>>({})
  const lastCategoryRef = useRef(selectedCategory)
  const hasSelectedInitialAsset = useRef(false)

  // Sync ref with state
  useEffect(() => {
    categorySelectionsRef.current = categorySelections
  }, [categorySelections])

  // Helper to select an asset for the current category
  const selectDefaultAsset = useCallback(
    (assets: IssuedAsset[], category: CategoryFilter) => {
      // For SC Shares, prefer QX
      if (category === ASSET_CATEGORY_SC_SHARES) {
        const qxAsset = assets.find((asset) => asset.name === QX_ASSET_NAME)
        if (qxAsset) {
          setCategorySelections((prev) => ({
            ...prev,
            [category]: { name: qxAsset.name, issuerIdentity: qxAsset.issuerIdentity }
          }))
          setSearchParams((prev) => ({
            issuer: qxAsset.issuerIdentity,
            asset: qxAsset.name,
            page: '1',
            pageSize: prev.get('pageSize') || '15'
          }))
          return true
        }
      }

      // Fall back to first asset
      const firstAsset = assets[0]
      if (firstAsset) {
        setCategorySelections((prev) => ({
          ...prev,
          [category]: { name: firstAsset.name, issuerIdentity: firstAsset.issuerIdentity }
        }))
        setSearchParams((prev) => ({
          issuer: firstAsset.issuerIdentity,
          asset: firstAsset.name,
          page: '1',
          pageSize: prev.get('pageSize') || '15'
        }))
        return true
      }
      return false
    },
    [setSearchParams]
  )

  // Initial asset selection - runs once when assets are loaded and no URL params exist
  useEffect(() => {
    if (hasSelectedInitialAsset.current) return
    if (filteredAssets.length === 0) return
    if (hasInvalidUrlParams.current) return

    // If URL already has valid asset params, mark as initialized
    if (assetParam && issuerParam) {
      const currentAssetInList = filteredAssets.some(
        (asset) => asset.issuerIdentity === issuerParam && asset.name === assetParam
      )
      if (currentAssetInList) {
        hasSelectedInitialAsset.current = true
        return
      }
      // If URL has invalid params, wait for category detection
      if (!hasInitializedCategory) return
    }

    // No URL params or invalid params - select default asset
    if (selectDefaultAsset(filteredAssets, selectedCategory)) {
      hasSelectedInitialAsset.current = true
      // Also prevent Category Detection from re-running and changing category
      hasRunCategoryDetection.current = true
    }
  }, [
    filteredAssets,
    assetParam,
    issuerParam,
    hasInitializedCategory,
    selectedCategory,
    selectDefaultAsset
  ])

  // Category change handler - runs when user changes category
  useEffect(() => {
    // Skip during initial setup - wait for initial selection to complete
    if (!hasSelectedInitialAsset.current) {
      // Still update the ref to avoid false positives later
      lastCategoryRef.current = selectedCategory
      return
    }

    // Skip if category hasn't changed
    if (lastCategoryRef.current === selectedCategory) return

    lastCategoryRef.current = selectedCategory

    if (filteredAssets.length === 0) return

    // Check for remembered selection
    const rememberedSelection = categorySelectionsRef.current[selectedCategory]
    if (rememberedSelection) {
      const rememberedAssetInList = filteredAssets.find(
        (asset) =>
          asset.issuerIdentity === rememberedSelection.issuerIdentity &&
          asset.name === rememberedSelection.name
      )
      if (rememberedAssetInList) {
        setSearchParams((prev) => ({
          issuer: rememberedSelection.issuerIdentity,
          asset: rememberedSelection.name,
          page: '1',
          pageSize: prev.get('pageSize') || '15'
        }))
        return
      }
    }

    // Select default for this category
    selectDefaultAsset(filteredAssets, selectedCategory)
  }, [selectedCategory, filteredAssets, setSearchParams, selectDefaultAsset])

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
          onCategoryChange={handleCategoryChange}
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
