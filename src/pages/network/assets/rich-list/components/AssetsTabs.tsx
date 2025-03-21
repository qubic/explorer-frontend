import { memo, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'

import { Skeleton } from '@app/components/ui'
import { Button } from '@app/components/ui/buttons'
import type { Asset } from '@app/store/apis/qx'
import { useGetAssetsQuery } from '@app/store/apis/qx'
import { clsxTwMerge } from '@app/utils'
import { ASSETS_ISSUER_ADDRESS } from '@app/utils/qubic-ts'

const AssetTabsSkeleton = memo(({ items }: { items: number }) =>
  Array.from({ length: items }).map((_, index) => (
    <Skeleton key={String(`${index}`)} className="h-28 w-52" />
  ))
)

function AssetsTabsSection({
  title,
  assets,
  isLoading,
  skeletonItems = 5,
  onTabChange,
  selectedAsset
}: {
  title: string
  assets: Asset[]
  isLoading?: boolean
  skeletonItems?: number
  onTabChange: (asset: Asset) => void
  selectedAsset?: Asset
}) {
  return (
    <section className="flex flex-col gap-10">
      <h2>{title}</h2>
      <ul className="flex flex-wrap gap-10">
        {isLoading ? (
          <AssetTabsSkeleton items={skeletonItems} />
        ) : (
          assets?.map((asset) => {
            const isSelected =
              selectedAsset?.issuer === asset.issuer && selectedAsset?.name === asset.name
            return (
              <li key={asset.name}>
                <Button
                  className={clsxTwMerge(
                    isSelected && 'bg-primary-30 text-primary-80 hover:text-primary-30'
                  )}
                  variant="outlined"
                  size="xs"
                  onClick={() => onTabChange(asset)}
                >
                  {asset.name}
                </Button>
              </li>
            )
          })
        )}
      </ul>
    </section>
  )
}

export default function AssetsTabs() {
  const { t } = useTranslation('network-page')
  const [searchParams, setSearchParams] = useSearchParams()

  const assetParam = searchParams.get('asset') || ''
  const issuerParam = searchParams.get('issuer') || ''

  const selectedAsset = useMemo(
    () => ({
      issuer: issuerParam,
      name: assetParam
    }),
    [assetParam, issuerParam]
  )
  const { data = [], isFetching } = useGetAssetsQuery()

  const handleAssetChange = useCallback(
    ({ issuer, name }: Asset) => {
      setSearchParams((prev) => ({
        ...Object.fromEntries(prev.entries()),
        issuer,
        asset: name,
        page: '1'
      }))
    },
    [setSearchParams]
  )

  const { smartContractShares, tokens } = useMemo(
    () =>
      data.reduce(
        (acc: { smartContractShares: Asset[]; tokens: Asset[] }, asset) => {
          const key = asset.issuer === ASSETS_ISSUER_ADDRESS ? 'smartContractShares' : 'tokens'
          acc[key].push(asset)
          return acc
        },
        { smartContractShares: [], tokens: [] }
      ),
    [data]
  )

  return (
    <div className="grid gap-14">
      <AssetsTabsSection
        title={t('tokens')}
        assets={tokens}
        isLoading={isFetching}
        onTabChange={handleAssetChange}
        selectedAsset={selectedAsset}
      />
      <AssetsTabsSection
        title={t('smartContracts')}
        assets={smartContractShares}
        isLoading={isFetching}
        skeletonItems={9}
        onTabChange={handleAssetChange}
        selectedAsset={selectedAsset}
      />
    </div>
  )
}
