export enum SmartContracts {
  QEarn = 'JAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVKHO'
}

export const SMART_CONTRACTS: Record<SmartContracts, { name: string; label: string }> = {
  [SmartContracts.QEarn]: {
    name: 'QEarn',
    label: 'Qubic Earn'
  }
} as const
