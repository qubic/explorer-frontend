export type SmartContractProcedure = {
  id: number
  name: string
}

export type SmartContract = {
  filename: string
  name: string
  label: string
  githubUrl: string
  contractIndex: number
  address: string
  procedures: SmartContractProcedure[]
  website?: string
  proposalUrl?: string
}

export type GetSmartContractsResponse = {
  smart_contracts: SmartContract[]
}

export type Exchange = {
  name: string
  address: string
}

export type GetExchangesResponse = {
  exchanges: Exchange[]
}

export type AddressLabel = {
  label: string
  address: string
}

export type GetAddressLabelsResponse = {
  address_labels: AddressLabel[]
}

export type Token = {
  name: string
  website: string
}

export type GetTokensResponse = {
  tokens: Token[]
}

export type TokenCategoryRules = {
  nameRegex?: string
  issuerRegex?: string
  matchAll?: boolean // default true (AND), if false uses OR
}

export type TokenCategory = {
  id: string
  nameKey: string
  rules: TokenCategoryRules
}

export type GetTokenCategoriesResponse = {
  categories: TokenCategory[]
  defaultCategoryId: string
  defaultCategoryNameKey: string
  allCategoryNameKey: string
}

export type ExplorerTranslations = Record<string, string>
