import { CheckIcon, XmarkIcon } from '@app/assets/icons'

type Props = {
  executed: boolean
}

function TxStatus({ executed }: Props) {
  return (
    <div className="flex w-fit items-center gap-4 rounded-full bg-primary-60 px-8 py-4">
      <p className="font-space text-xs text-gray-50">TX</p>
      {executed ? (
        <CheckIcon className="h-16 w-16 text-success-40" />
      ) : (
        <XmarkIcon className="h-16 w-16 text-error-40" />
      )}
    </div>
  )
}

export default TxStatus
