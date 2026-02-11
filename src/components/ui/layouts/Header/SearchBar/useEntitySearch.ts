import { useMemo } from 'react'

import { useGetExchangesQuery, useGetSmartContractsQuery } from '@app/store/apis/qubic-static'
import { useGetAssetsIssuancesQuery } from '@app/store/apis/rpc-live'
import { isAssetsIssuerAddress } from '@app/utils'

export type EntityType = 'exchange' | 'smartContract' | 'token'

export interface SearchableEntity {
  name: string
  address: string
  type: EntityType
  aliases?: string[] // Additional searchable names (e.g., smart contract name vs label)
}

export interface EntitySearchResult {
  exactMatch: SearchableEntity | null
  partialMatches: SearchableEntity[]
}

// Constants moved outside component to avoid recreation
const TYPE_ORDER: Record<EntityType, number> = { exchange: 0, smartContract: 1, token: 2 }

// Helper to check if search matches entity name or aliases (exact match)
const matchesExact = (entity: SearchableEntity, normalizedSearch: string): boolean => {
  if (entity.name.toLowerCase() === normalizedSearch) return true
  return entity.aliases?.some((alias) => alias.toLowerCase() === normalizedSearch) ?? false
}

// Helper to check if entity matches (starts with or contains search term)
const matchesPartial = (entity: SearchableEntity, normalizedSearch: string): boolean => {
  const nameLower = entity.name.toLowerCase()
  if (nameLower.includes(normalizedSearch)) return true
  return entity.aliases?.some((alias) => alias.toLowerCase().includes(normalizedSearch)) ?? false
}

// Helper to get match priority (lower = better)
// 0: name starts with search term
// 1: alias starts with search term
// 2: name ends with search term
// 3: alias ends with search term
// 4: name contains search term
// 5: alias contains search term
const getMatchPriority = (entity: SearchableEntity, normalizedSearch: string): number => {
  const nameLower = entity.name.toLowerCase()
  if (nameLower.startsWith(normalizedSearch)) return 0
  if (entity.aliases?.some((alias) => alias.toLowerCase().startsWith(normalizedSearch))) {
    return 1
  }
  if (nameLower.endsWith(normalizedSearch)) return 2
  if (entity.aliases?.some((alias) => alias.toLowerCase().endsWith(normalizedSearch))) {
    return 3
  }
  if (nameLower.includes(normalizedSearch)) return 4
  return 5
}

export function useEntitySearch(searchTerm: string): EntitySearchResult & { isLoading: boolean } {
  const { data: exchanges, isLoading: exchangesLoading } = useGetExchangesQuery()
  const { data: smartContracts, isLoading: smartContractsLoading } = useGetSmartContractsQuery()
  const { data: tokensData, isLoading: tokensLoading } = useGetAssetsIssuancesQuery()

  const isLoading = exchangesLoading || smartContractsLoading || tokensLoading

  const allEntities = useMemo<SearchableEntity[]>(() => {
    const entities: SearchableEntity[] = []

    // Add exchanges
    if (exchanges) {
      exchanges.forEach((exchange) => {
        entities.push({
          name: exchange.name,
          address: exchange.address,
          type: 'exchange'
        })
      })
    }

    // Add smart contracts (use label as primary name, include name as alias if different)
    if (smartContracts) {
      smartContracts.forEach((sc) => {
        const primaryName = sc.label || sc.name
        const aliases =
          sc.label && sc.name && sc.label.toLowerCase() !== sc.name.toLowerCase()
            ? [sc.name]
            : undefined
        entities.push({
          name: primaryName,
          address: sc.address,
          type: 'smartContract',
          aliases
        })
      })
    }

    // Add tokens (filter out asset issuer addresses like QX)
    if (tokensData) {
      tokensData.assets
        .filter(({ data: asset }) => !isAssetsIssuerAddress(asset.issuerIdentity))
        .forEach(({ data: asset }) => {
          entities.push({
            name: asset.name,
            address: asset.issuerIdentity,
            type: 'token'
          })
        })
    }

    return entities
  }, [exchanges, smartContracts, tokensData])

  const result = useMemo<EntitySearchResult>(() => {
    if (!searchTerm || searchTerm.trim().length === 0) {
      return { exactMatch: null, partialMatches: [] }
    }

    const normalizedSearch = searchTerm.toLowerCase().trim()

    // Find exact matches
    const exactMatches = allEntities.filter((e) => matchesExact(e, normalizedSearch))
    // Prefer exchanges/smart contracts over tokens if multiple exact matches
    const exactMatch =
      exactMatches.find((entity) => entity.type !== 'token') || exactMatches[0] || null

    // Find partial matches (excluding exact matches)
    const partialMatches = allEntities
      .filter(
        (entity) =>
          !matchesExact(entity, normalizedSearch) && matchesPartial(entity, normalizedSearch)
      )
      // Sort: 1) by match priority (starts with > ends with > contains)
      //       2) by type (exchanges > smart contracts > tokens)
      //       3) alphabetically
      .sort((a, b) => {
        const priorityDiff =
          getMatchPriority(a, normalizedSearch) - getMatchPriority(b, normalizedSearch)
        if (priorityDiff !== 0) return priorityDiff
        const orderDiff = TYPE_ORDER[a.type] - TYPE_ORDER[b.type]
        if (orderDiff !== 0) return orderDiff
        return a.name.localeCompare(b.name)
      })
      // Limit partial matches to prevent UI overload
      .slice(0, 10)

    return { exactMatch, partialMatches }
  }, [searchTerm, allEntities])

  return { ...result, isLoading }
}
