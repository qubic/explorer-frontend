import type { SmartContracts, Tokens } from '@app/constants/qubic'
import { EXCHANGES, SMART_CONTRACTS, TOKENS } from '@app/constants/qubic'

export enum AddressType {
  Exchange = 'EXCHANGE',
  SmartContract = 'SMART_CONTRACT',
  Token = 'TOKEN'
}

export type GetAddressNameResult =
  | {
      name: string
      type: AddressType.Exchange
      i18nKey: string
      website?: string
    }
  | {
      name: string
      type: AddressType.Token
      i18nKey: string
      website?: string
    }
  | {
      name: string
      type: AddressType.SmartContract
      i18nKey: string
      website?: string
      githubUrl: string
      proposalUrl?: string
    }

export const getAddressName = (address: string): GetAddressNameResult | undefined => {
  const exchange = EXCHANGES.find(({ address: exAddress }) => exAddress === address)?.name
  if (exchange) return { name: exchange, type: AddressType.Exchange, i18nKey: 'exchange' }

  if (address in SMART_CONTRACTS) {
    return {
      name: SMART_CONTRACTS[address as SmartContracts].name,
      type: AddressType.SmartContract,
      i18nKey: 'smartContract',
      website: SMART_CONTRACTS[address as SmartContracts].website,
      githubUrl: SMART_CONTRACTS[address as SmartContracts].githubUrl,
      proposalUrl: SMART_CONTRACTS[address as SmartContracts].proposalUrl
    }
  }

  if (address in TOKENS) {
    return {
      name: TOKENS[address as Tokens].name,
      type: AddressType.Token,
      i18nKey: 'token'
    }
  }

  return undefined
}
