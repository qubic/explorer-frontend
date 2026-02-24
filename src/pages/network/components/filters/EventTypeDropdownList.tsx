import { EVENT_TYPE_FILTER_OPTIONS, getEventTypeLabel } from '@app/store/apis/events'

type Props = {
  onSelect: (type: number) => void
}

export default function EventTypeDropdownList({ onSelect }: Props) {
  return (
    <ul className="flex flex-col">
      {EVENT_TYPE_FILTER_OPTIONS.map((type) => (
        <li key={type}>
          <button
            type="button"
            className="w-full rounded px-8 py-6 text-left font-space text-xs text-gray-50 hover:bg-primary-60 hover:text-white"
            onClick={() => onSelect(type)}
          >
            {getEventTypeLabel(type)}
          </button>
        </li>
      ))}
    </ul>
  )
}
