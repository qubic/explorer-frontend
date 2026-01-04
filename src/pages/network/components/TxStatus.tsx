import { CheckIcon, XmarkIcon } from '@app/assets/icons'

type Props = {
  executed: boolean
  isTransferTx: boolean
}

function TxSatusIcon({ executed }: { executed: boolean }) {
  return executed ? (
    <CheckIcon className="h-16 w-16 text-success-40" />
  ) : (
    <XmarkIcon className="h-16 w-16 text-error-40" />
  )
}

export default function TxStatus({ executed, isTransferTx }: Props) {
  return (
    <div className="flex w-fit items-center gap-4 rounded-full border border-border bg-muted px-8 py-4">
      <p className="font-space text-xs text-muted-foreground">TX</p>
      {isTransferTx && <TxSatusIcon executed={executed} />}
    </div>
  )
}
