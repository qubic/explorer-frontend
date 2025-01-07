import type { SmartContracts, Tokens } from '@app/constants/qubic'
import { EXCHANGES, SMART_CONTRACTS, TOKENS } from '@app/constants/qubic'

enum AddressType {
  Exchange = 'EXCHANGE',
  SmartContract = 'SMART_CONTRACT',
  Token = 'TOKEN'
}

type GetAddressNameResult = {
  name: string
  type: AddressType
  i18nKey: string
}

export const getAddressName = (address: string): GetAddressNameResult | undefined => {
  const exchange = EXCHANGES.find(({ address: exAddress }) => exAddress === address)?.name
  if (exchange) return { name: exchange, type: AddressType.Exchange, i18nKey: 'exchange' }

  if (address in SMART_CONTRACTS) {
    return {
      name: SMART_CONTRACTS[address as SmartContracts].name,
      type: AddressType.SmartContract,
      i18nKey: 'smartContract'
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
