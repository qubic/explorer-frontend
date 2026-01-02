import { ContractDefinitions } from '@qubic-labs/kit'

type KitContractSurface = (typeof ContractDefinitions.contracts)[number]

export type ContractSurface = KitContractSurface

export const kitContracts: ContractSurface[] = ContractDefinitions.contracts as ContractSurface[]
