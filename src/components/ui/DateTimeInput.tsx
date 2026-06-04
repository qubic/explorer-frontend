import { clsxTwMerge } from '@app/utils'

// Time input width constant - fits HH:MM:SS format with step controls
const TIME_INPUT_WIDTH = 'w-[110px]'

type Props = {
  id: string
  label: string
  // ISO 8601 UTC string (e.g. "2026-06-04T15:00:00.000Z"). Stored in this format
  // in the URL so the same value yields the same instant across timezones; the
  // inputs display the user's local representation of that instant.
  value: string | undefined
  defaultTime: string
  onChange: (datetime: string | undefined) => void
}

const pad = (n: number) => String(n).padStart(2, '0')

function isoToLocalParts(iso: string | undefined): { datePart: string; timePart: string } {
  if (!iso) return { datePart: '', timePart: '' }
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return { datePart: '', timePart: '' }
  return {
    datePart: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    timePart: `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
  }
}

function localPartsToIso(datePart: string, timePart: string): string | undefined {
  if (!datePart || !timePart) return undefined
  const d = new Date(`${datePart}T${timePart}`)
  if (Number.isNaN(d.getTime())) return undefined
  return d.toISOString()
}

export default function DateTimeInput({ id, label, value, defaultTime, onChange }: Props) {
  const { datePart, timePart } = isoToLocalParts(value)
  const displayTime = timePart || defaultTime

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value
    if (newDate) {
      onChange(localPartsToIso(newDate, timePart || defaultTime))
    } else {
      onChange(undefined)
    }
  }

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value
    if (datePart && newTime) {
      onChange(localPartsToIso(datePart, newTime))
    }
  }

  return (
    <div>
      <label htmlFor={`${id}-date`} className="mb-4 block text-xs text-gray-50">
        {label}
      </label>
      <div className="flex gap-6">
        <input
          id={`${id}-date`}
          type="date"
          value={datePart}
          onChange={handleDateChange}
          className={clsxTwMerge(
            'flex-1 rounded bg-primary-60 px-10 py-6 text-base focus:outline-none focus:ring-1 focus:ring-primary-30 md:text-xs [&::-webkit-calendar-picker-indicator]:invert',
            value
              ? 'text-white [&::-webkit-calendar-picker-indicator]:opacity-100'
              : 'text-gray-50 [&::-webkit-calendar-picker-indicator]:opacity-50'
          )}
        />
        <input
          id={`${id}-time`}
          type="time"
          step="1"
          value={displayTime}
          onChange={handleTimeChange}
          disabled={!value}
          className={clsxTwMerge(
            TIME_INPUT_WIDTH,
            'rounded bg-primary-60 px-10 py-6 text-base focus:outline-none focus:ring-1 focus:ring-primary-30 md:text-xs [&::-webkit-calendar-picker-indicator]:invert',
            value ? 'text-white' : 'cursor-not-allowed text-gray-50 opacity-50'
          )}
        />
      </div>
    </div>
  )
}
