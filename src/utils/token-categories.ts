import type { TokenCategory } from '@app/store/apis/qubic-static'

export const TOKEN_CATEGORY_STANDARD = 'standard'

export type CategoryFilter = typeof TOKEN_CATEGORY_STANDARD | string

export type TokenLike = {
  name: string
  issuerIdentity: string
}

const matchesCategory = (token: TokenLike, category: TokenCategory): boolean => {
  const { rules } = category

  if (!rules) {
    return false
  }

  const { nameRegex, issuerRegex, matchAll = true } = rules

  // If no patterns defined, no match
  if (!nameRegex && !issuerRegex) {
    return false
  }

  const nameMatches = nameRegex ? new RegExp(nameRegex).test(token.name) : undefined
  const issuerMatches = issuerRegex ? new RegExp(issuerRegex).test(token.issuerIdentity) : undefined

  // If only one pattern is defined, use that result
  if (nameMatches !== undefined && issuerMatches === undefined) {
    return nameMatches
  }
  if (issuerMatches !== undefined && nameMatches === undefined) {
    return issuerMatches
  }

  // Both patterns defined - use matchAll for AND/OR logic
  if (matchAll) {
    return nameMatches === true && issuerMatches === true
  }
  return nameMatches === true || issuerMatches === true
}

const isStandardToken = (token: TokenLike, categories: TokenCategory[]): boolean => {
  return !categories.some((category) => matchesCategory(token, category))
}

export const filterTokensByCategory = (
  tokens: TokenLike[],
  selectedCategory: CategoryFilter,
  categories: TokenCategory[]
): TokenLike[] => {
  if (selectedCategory === TOKEN_CATEGORY_STANDARD) {
    return tokens.filter((token) => isStandardToken(token, categories))
  }

  const category = categories.find((cat) => cat.id === selectedCategory)
  if (category) {
    return tokens.filter((token) => matchesCategory(token, category))
  }

  return tokens
}
