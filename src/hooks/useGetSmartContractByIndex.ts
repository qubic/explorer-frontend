import { useMemo } from 'react'
import { useGetSmartContractsQuery } from '@app/store/apis/qubic-static'
import type { SmartContract } from '@app/store/apis/qubic-static'

export function useGetSmartContractByIndex(
  contractIndex: number | undefined
): SmartContract | undefined {
  const { data: smartContracts } = useGetSmartContractsQuery(undefined, {
    skip: contractIndex === undefined
  })

  return useMemo(
    () =>
      contractIndex !== undefined
        ? smartContracts?.find((sc) => sc.contractIndex === contractIndex)
        : undefined,
    [smartContracts, contractIndex]
  )
}
