import { useMemo } from 'react'
import {
  useGetAddressLabelsQuery,
  useGetExchangesQuery,
  useGetSmartContractsQuery,
  useGetTokensQuery
} from '@app/store/apis/qubic-static'
import { useGetAssetsIssuancesQuery } from '@app/store/apis/archiver-v1'
import { EMPTY_ADDRESS } from '@app/utils/qubic-ts'

export type GetAddressNameResult = {
  name: string
  i18nKey: string
  website?: string
}

/**
 * Hook to get address name/label from static API data
 * Checks smart contracts (priority), exchanges, tokens (asset issuers), and address labels
 */
export function useGetAddressName(address: string): GetAddressNameResult | undefined {
  const { data: smartContracts } = useGetSmartContractsQuery()
  const { data: exchanges } = useGetExchangesQuery()
  const { data: addressLabels } = useGetAddressLabelsQuery()
  const { data: tokens } = useGetTokensQuery()
  const { data: assetsIssuances } = useGetAssetsIssuancesQuery({ issuerIdentity: address })

  return useMemo(() => {
    // Check smart contracts first (highest priority)
    const smartContract = smartContracts?.find((sc) => sc.address === address)
    if (smartContract) {
      return {
        name: smartContract.name,
        i18nKey: 'smart-contract'
      }
    }

    // Check exchanges
    const exchange = exchanges?.find((ex) => ex.address === address)
    if (exchange) {
      return {
        name: exchange.name,
        i18nKey: 'exchange'
      }
    }

    // Check tokens (asset issuers) - only if issuer is not the empty address
    if (assetsIssuances?.assets && assetsIssuances.assets.length > 0) {
      const tokenIssuance = assetsIssuances.assets.find(
        (asset) => asset.data.issuerIdentity !== EMPTY_ADDRESS
      )
      if (tokenIssuance) {
        // Try to find matching token data from static API to get website
        const tokenData = tokens?.find((t) => t.name === tokenIssuance.data.name)
        return {
          name: tokenIssuance.data.name,
          i18nKey: 'token',
          website: tokenData?.website
        }
      }
    }

    // Check address labels
    const addressLabel = addressLabels?.find((label) => label.address === address)
    if (addressLabel) {
      return {
        name: addressLabel.label,
        i18nKey: 'named-address'
      }
    }

    return undefined
  }, [address, smartContracts, exchanges, addressLabels, tokens, assetsIssuances])
}
