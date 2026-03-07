import { useMemo } from 'react'

import type { DecodedContractInput } from '@app/utils/contract-input-decoder'
import SubCardItem from '../SubCardItem'
import type { TxItemVariant } from './TxItem.types'

type Props = Readonly<{
  variant: TxItemVariant
  shouldDecodeInput: boolean
  decodedInput: DecodedContractInput | null
}>

export default function DecodedDataSection({ variant, shouldDecodeInput, decodedInput }: Props) {
  const decodedInputJson = useMemo(() => {
    if (!decodedInput || decodedInput.status !== 'decoded') return null
    return JSON.stringify(decodedInput.value, null, 2)
  }, [decodedInput])

  if (!shouldDecodeInput || !decodedInput) return null

  return (
    <SubCardItem
      title="Decoded Data"
      variant={variant}
      content={
        <div className="min-w-0 flex-1">
          {decodedInput.status === 'decoded' ? (
            <pre className="max-h-[20rem] overflow-auto break-all rounded-8 bg-primary-60 p-12 font-space text-sm text-gray-50">
              {decodedInputJson}
            </pre>
          ) : (
            <>
              <p className="break-all font-space text-sm text-gray-50">
                Unable to decode this contract input.
              </p>
              {decodedInput.message && (
                <p className="text-gray-40 mt-8 break-all font-space text-xs">
                  {decodedInput.message}
                </p>
              )}
            </>
          )}
        </div>
      }
    />
  )
}
