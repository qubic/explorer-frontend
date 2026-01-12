import { useEffect, useState } from 'react'
import { Label, Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react'

import { ChevronDownIcon } from '@app/assets/icons'
import { clsxTwMerge } from '@app/utils'

export type Option<ValueType = string> = Readonly<{
  label: string
  value: ValueType
}>

type Size = 'sm' | 'md' | 'lg'

type Props<ValueType> = Readonly<{
  label: string
  options: Option<ValueType>[]
  onSelect: (option: Option<ValueType>) => void
  name?: string
  showLabel?: boolean
  defaultValue?: Option<ValueType>
  className?: string
  size?: Size
}>

const sizeClasses = {
  sm: {
    label: 'text-xs',
    button: 'py-6 pl-10 pr-14 text-xs',
    options: 'py-6 px-10 text-xs',
    icon: 'h-14 w-14'
  },
  md: {
    label: 'text-sm',
    button: 'py-8 pl-12 pr-16 text-sm',
    options: 'py-5 px-10 text-sm',
    icon: 'h-18 w-18'
  },
  lg: {
    label: 'text-base',
    button: 'py-10 pl-14 pr-18 text-base',
    options: 'py-6 px-12 text-base',
    icon: 'h-20 w-20'
  }
} as const

export default function Select<ValueType = string>({
  label,
  options,
  onSelect,
  defaultValue,
  name = `select-${label}`,
  showLabel = false,
  className,
  size = 'md'
}: Props<ValueType>) {
  const [selected, setSelected] = useState<Option<ValueType>>(
    defaultValue || { label, value: '' as ValueType }
  )

  const handleSelect = (option: Option<ValueType>) => {
    setSelected(option)
    onSelect(option)
  }

  // Sync internal state with defaultValue when it changes
  useEffect(() => {
    if (defaultValue) {
      setSelected(defaultValue)
    }
  }, [defaultValue])

  return (
    <div>
      <Listbox value={selected} onChange={handleSelect} name={name}>
        <Label
          className={clsxTwMerge(
            'mb-6 block font-normal leading-6 text-muted-foreground',
            sizeClasses[size].label,
            !showLabel && 'sr-only'
          )}
        >
          {label}
        </Label>

        <div className={clsxTwMerge('relative w-full font-space', className)}>
          <ListboxButton
            className={clsxTwMerge(
              'relative w-full cursor-default rounded-md border border-border bg-card text-left text-foreground shadow-sm hover:cursor-pointer hover:border-primary-50 focus:border-primary-50 focus:outline-none focus:ring-1 focus:ring-ring active:ring-ring',
              sizeClasses[size].button
            )}
          >
            <span
              className={clsxTwMerge(
                'block truncate leading-tight',
                !selected && 'text-muted-foreground'
              )}
            >
              {selected ? selected.label : label}
            </span>

            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-6">
              <ChevronDownIcon
                aria-hidden="true"
                className={clsxTwMerge(sizeClasses[size].icon, 'text-muted-foreground')}
              />
            </span>
          </ListboxButton>

          <ListboxOptions
            transition
            className="absolute z-10 mt-1 w-full overflow-auto rounded-md bg-popover shadow-2xl ring-1 ring-border/40 drop-shadow-2xl scrollbar-thin scrollbar-thumb-muted-foreground scrollbar-thumb-rounded-full focus:outline-none"
          >
            {options.map((option, index) => (
              <ListboxOption
                key={JSON.stringify(option)}
                value={option}
                className={clsxTwMerge(
                  index === 0 && 'rounded-t-md',
                  'group relative cursor-default select-none font-space text-foreground data-[focus]:bg-muted data-[selected]:bg-muted/70 data-[focus]:text-foreground hover:cursor-pointer',
                  sizeClasses[size].options
                )}
              >
                <span className="block truncate font-normal group-data-[selected]:font-semibold">
                  {option.label}
                </span>
              </ListboxOption>
            ))}
          </ListboxOptions>
        </div>
      </Listbox>
    </div>
  )
}
