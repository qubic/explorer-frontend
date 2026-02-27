import { EVENT_TYPE_FILTER_OPTIONS, getEventTypeLabel } from '@app/store/apis/events'

type Props = {
  selectedType: number | undefined
  onSelectType: (type: number | undefined) => void
}

export default function EventTypeChips({ selectedType, onSelectType }: Props) {
  return (
    <div className="flex flex-wrap gap-8">
      {EVENT_TYPE_FILTER_OPTIONS.map((type) => (
        <button
          key={type}
          type="button"
          className={`rounded-full border px-8 py-4 text-xs transition-colors ${
            selectedType === type
              ? 'border-primary-30 bg-primary-60 text-primary-30'
              : 'border-primary-60 text-gray-50 hover:border-primary-50 hover:text-white'
          }`}
          onClick={() => onSelectType(selectedType === type ? undefined : type)}
        >
          {getEventTypeLabel(type)}
        </button>
      ))}
    </div>
  )
}
