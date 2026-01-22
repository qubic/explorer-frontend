import { clsxTwMerge } from '@app/utils'

// Time input width constant - fits HH:MM:SS format with step controls
const TIME_INPUT_WIDTH = 'w-[110px]'

type Props = {
  id: string
  label: string
  value: string | undefined
  defaultTime: string
  onChange: (datetime: string | undefined) => void
}

export default function DateTimeInput({ id, label, value, defaultTime, onChange }: Props) {
  const datePart = value?.split('T')[0] || ''
  const timePart = value?.split('T')[1] || defaultTime

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDatePart = e.target.value
    if (newDatePart) {
      const existingTime = value?.split('T')[1] || defaultTime
      onChange(`${newDatePart}T${existingTime}`)
    } else {
      onChange(undefined)
    }
  }

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTimePart = e.target.value
    const currentDatePart = value?.split('T')[0]
    if (currentDatePart && newTimePart) {
      onChange(`${currentDatePart}T${newTimePart}`)
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
          value={timePart}
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
