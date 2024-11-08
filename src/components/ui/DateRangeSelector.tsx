import { parseAsStringEnum, useQueryState } from 'nuqs'
import Tooltip from './Tooltip'
import { Button } from './buttons'

function formatDate(date: Date) {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

const options = [
  {
    label: '7D',
    date: `${formatDate(new Date(new Date().setDate(new Date().getDate() - 7)))} – Today `
  },
  {
    label: '30D',
    date: `${formatDate(new Date(new Date().setDate(new Date().getDate() - 30)))} – Today`
  },
  {
    label: '3M',
    date: `${formatDate(new Date(new Date().setMonth(new Date().getMonth() - 3)))} – Today`
  },
  {
    label: '1Y',
    date: `${formatDate(new Date(new Date().setMonth(new Date().getMonth() - 12)))} – Today`
  },
  {
    label: 'ALL',
    date: `All time`
  }
]

export default function DateRangeSelector() {
  const [range, setRange] = useQueryState(
    'range',
    parseAsStringEnum(options.map((item) => item.label)).withDefault('ALL')
  )

  return (
    <div className="relative">
      <div className="inline-flex items-center gap-8 font-medium">
        {options.map((item) => (
          <Tooltip content={item.date} key={item.label}>
            <Button
              type="button"
              variant={range === item.label ? 'filled' : 'outlined'}
              size="sm"
              onClick={() => setRange(item.label)}
            >
              {item.label}
            </Button>
          </Tooltip>
        ))}
      </div>
    </div>
  )
}
