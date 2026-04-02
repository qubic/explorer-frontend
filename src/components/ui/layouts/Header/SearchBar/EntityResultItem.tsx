import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { Routes } from '@app/router'
import { clsxTwMerge, formatString } from '@app/utils'
import type { EntityType, SearchableEntity } from './useEntitySearch'

type Props = {
  entity: SearchableEntity
  searchTerm?: string
  onClick?: () => void
}

const BADGE_STYLE = 'border-gray-50 bg-primary-60 text-gray-50'

export default function EntityResultItem({ entity, searchTerm, onClick }: Props) {
  const { t } = useTranslation('network-page')

  const getTypeLabel = (type: EntityType): string => {
    switch (type) {
      case 'exchange':
        return t('exchange')
      case 'smartContract':
        return t('smartContract')
      case 'token':
        return t('token')
      default:
        return type
    }
  }

  // Find matching alias if name doesn't match the search term
  const getMatchingAlias = (): string | null => {
    if (!searchTerm || !entity.aliases) return null
    const normalizedSearch = searchTerm.toLowerCase().trim()
    const nameLower = entity.name.toLowerCase()

    // If name already matches, no need to show alias
    if (nameLower.includes(normalizedSearch)) return null

    // Find the alias that matches
    const matchingAlias = entity.aliases.find((alias) =>
      alias.toLowerCase().includes(normalizedSearch)
    )
    return matchingAlias || null
  }

  const matchingAlias = getMatchingAlias()

  return (
    <Link
      className="flex flex-col gap-2 break-all rounded-12 px-12 py-6 hover:bg-primary-60"
      to={Routes.NETWORK.ADDRESS(entity.address)}
      onClick={onClick}
    >
      <div className="flex items-center gap-8">
        <span className="font-sans text-xs">
          {entity.name}
          {matchingAlias && <span className="text-gray-50"> ({matchingAlias})</span>}
        </span>
        <span
          className={clsxTwMerge(
            'rounded-full border px-6 py-2 text-[10px] font-medium',
            BADGE_STYLE
          )}
        >
          {getTypeLabel(entity.type)}
        </span>
      </div>
      <span className="font-sans text-xs text-gray-50">{formatString(entity.address)}</span>
    </Link>
  )
}
