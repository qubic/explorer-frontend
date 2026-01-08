import { animated, useSpring, useTransition } from '@react-spring/web'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { ChevronToggleButton } from '@app/components/ui/buttons'
import { useGetAddressOwnedAssetsQuery } from '@app/store/apis/rpc-live'
import { useGetSmartContractsQuery } from '@app/store/apis/qubic-static'
import { formatString } from '@app/utils'
import { isAssetsIssuerAddress } from '@app/utils/qubic-ts'
import { AddressLink, CardItem } from '../../components'

type Props = {
  addressId: string
}

type AssetBalance = {
  assetName: string
  issuerIdentity: string
  numberOfUnits: string
}

type ContractGroup = {
  contractIndex: number
  contractName: string
  assets: AssetBalance[]
}

// Animation constants
const ANIMATION_DELAY = 800
const ANIMATION_TRAIL = 500
const ANIMATION_DURATION = 500

export default function OwnedAssets({ addressId }: Props) {
  const { t } = useTranslation('network-page')
  const { data: ownedAssets } = useGetAddressOwnedAssetsQuery(
    { address: addressId },
    { skip: !addressId }
  )
  const { data: smartContracts } = useGetSmartContractsQuery()

  const [isExpanded, setIsExpanded] = useState(false)
  const [showChevron, setShowChevron] = useState(false)

  // Reset expansion state and chevron visibility when address changes
  useEffect(() => {
    setIsExpanded(false)
    setShowChevron(false)
  }, [addressId])

  // Group assets by managing contract for expanded view
  const contractGroups = useMemo<ContractGroup[]>(() => {
    if (!ownedAssets || !smartContracts) return []

    const groups = new Map<number, ContractGroup>()

    ownedAssets.forEach(({ data }) => {
      // Skip tokens with 0 balance
      if (BigInt(data.numberOfUnits) === BigInt(0)) {
        return
      }

      const contractIndex = data.managingContractIndex

      if (!groups.has(contractIndex)) {
        const contract = smartContracts.find((sc) => sc.contractIndex === contractIndex)
        groups.set(contractIndex, {
          contractIndex,
          contractName: contract?.label ?? t('unknownContract'),
          assets: []
        })
      }

      const group = groups.get(contractIndex)
      if (group) {
        group.assets.push({
          assetName: data.issuedAsset.name,
          issuerIdentity: data.issuedAsset.issuerIdentity,
          numberOfUnits: data.numberOfUnits
        })
      }
    })

    return Array.from(groups.values())
  }, [ownedAssets, smartContracts, t])

  // Individual assets for top display - sum up tokens with same name/issuer
  const individualAssets = useMemo(() => {
    if (!ownedAssets) return []

    const grouped = new Map<string, AssetBalance>()

    ownedAssets.forEach(({ data }) => {
      // Skip tokens with 0 balance
      if (BigInt(data.numberOfUnits) === BigInt(0)) {
        return
      }

      const key = `${data.issuedAsset.name}-${data.issuedAsset.issuerIdentity}`

      if (!grouped.has(key)) {
        grouped.set(key, {
          assetName: data.issuedAsset.name,
          issuerIdentity: data.issuedAsset.issuerIdentity,
          numberOfUnits: '0'
        })
      }

      const existing = grouped.get(key)
      if (existing) {
        existing.numberOfUnits = (
          BigInt(existing.numberOfUnits) + BigInt(data.numberOfUnits)
        ).toString()
      }
    })

    return Array.from(grouped.values())
  }, [ownedAssets])

  // Show chevron with same timing as token items
  useEffect(() => {
    if (individualAssets.length === 0) {
      setShowChevron(false)
      return undefined
    }

    // Start chevron animation at same time as first token item
    const timer = setTimeout(() => {
      setShowChevron(true)
    }, ANIMATION_DELAY)

    return () => clearTimeout(timer)
  }, [individualAssets.length])

  // Fade and scale animation for the entire component
  const containerAnimation = useSpring({
    from: { opacity: 0, transform: 'translateX(100px)' },
    to: {
      opacity: ownedAssets?.length ? 1 : 0,
      transform: ownedAssets?.length ? 'translateX(0px)' : 'translateX(20px)'
    },
    config: { tension: 220, friction: 15, duration: ANIMATION_DURATION }
  })

  // Staggered animation for collapsed view
  const collapsedTransitions = useTransition(individualAssets, {
    from: { opacity: 0, transform: 'translateX(20px)' },
    enter: { opacity: 1, transform: 'translateX(0px)' },
    leave: { opacity: 0, transform: 'translateX(-10px)' },
    delay: ANIMATION_DELAY, // Delay the entire animation
    trail: ANIMATION_TRAIL, // Delay between items
    config: { duration: ANIMATION_DURATION }
  })

  // Staggered animation for expanded view (by contract)
  const expandedTransitions = useTransition(isExpanded ? contractGroups : [], {
    keys: (item) => item.contractIndex,
    from: { opacity: 0, transform: 'translateX(20px)' },
    enter: { opacity: 1, transform: 'translateX(0px)' },
    leave: { opacity: 0, transform: 'translateX(-10px)' },
    trail: ANIMATION_TRAIL, // Delay between items
    config: { duration: ANIMATION_DURATION },
    immediate: !isExpanded // Skip animation when collapsing
  })

  // Chevron fade-in animation - matches token items animation
  const chevronAnimation = useSpring({
    opacity: showChevron ? 1 : 0,
    transform: showChevron ? 'translateX(0px)' : 'translateX(20px)',
    config: { duration: ANIMATION_DURATION }
  })

  const toggleExpanded = () => {
    setIsExpanded((prev) => !prev)
  }

  // Don't show section if no assets with balance > 0
  if (!ownedAssets || ownedAssets.length === 0 || individualAssets.length === 0) {
    return null
  }

  return (
    <animated.div style={containerAnimation}>
      <CardItem className="mt-16 flex flex-col gap-16 p-12">
        {/* Always show token list at top */}
        <div className="flex items-start justify-between gap-12">
          <ul className="flex flex-1 flex-wrap gap-16">
            {collapsedTransitions((styles, asset) => (
              <animated.li
                key={`${asset.assetName}-${asset.issuerIdentity}`}
                style={styles}
                className="flex items-center gap-4"
              >
                <p className="font-space text-base text-white">
                  {formatString(asset.numberOfUnits)}
                </p>
                {isAssetsIssuerAddress(asset.issuerIdentity) ? (
                  <p className="font-space text-base text-gray-50">{asset.assetName}</p>
                ) : (
                  <AddressLink
                    label={asset.assetName}
                    value={asset.issuerIdentity}
                    className="text-base"
                  />
                )}
              </animated.li>
            ))}
          </ul>
          {showChevron && (
            <animated.div style={chevronAnimation}>
              <ChevronToggleButton
                aria-label="toggle-owned-assets-view"
                isOpen={isExpanded}
                onClick={toggleExpanded}
              />
            </animated.div>
          )}
        </div>

        {/* Divider line when expanded */}
        {isExpanded && <div className="border-t border-primary-60" />}

        {/* Expanded view: Show grouped by managing contract */}
        {isExpanded && (
          <ul className="flex flex-col gap-8">
            {expandedTransitions((styles, contractGroup) => (
              <animated.li key={contractGroup.contractIndex} style={styles}>
                <p className="mb-4 font-space text-sm text-gray-50">
                  {t('managedBy', { contract: contractGroup.contractName })}
                </p>
                <ul className="ml-12 flex flex-col gap-4">
                  {contractGroup.assets.map((asset) => (
                    <li
                      key={`${asset.assetName}-${asset.issuerIdentity}`}
                      className="flex items-center gap-6"
                    >
                      <p className="font-space text-base text-white">
                        {formatString(asset.numberOfUnits)}
                      </p>
                      {isAssetsIssuerAddress(asset.issuerIdentity) ? (
                        <p className="font-space text-base text-gray-50">{asset.assetName}</p>
                      ) : (
                        <AddressLink
                          label={asset.assetName}
                          value={asset.issuerIdentity}
                          className="text-base"
                        />
                      )}
                    </li>
                  ))}
                </ul>
              </animated.li>
            ))}
          </ul>
        )}
      </CardItem>
    </animated.div>
  )
}
