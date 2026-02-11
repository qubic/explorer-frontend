import { XmarkIcon } from '@app/assets/icons'

type Props = {
  label: string
  onClear: () => void
}

export default function ActiveFilterChip({ label, onClear }: Props) {
  return (
    <button
      type="button"
      onClick={onClear}
      className="flex shrink-0 items-center gap-4 rounded border border-primary-30 bg-primary-60 px-8 py-6 text-xs text-primary-30 transition-colors"
    >
      <span className="max-w-[150px] truncate">{label}</span>
      <span className="flex items-center justify-center rounded-full p-2 hover:bg-primary-50">
        <XmarkIcon className="h-10 w-10" />
      </span>
    </button>
  )
}
