import { ChevronDownIcon } from '@app/assets/icons'
import { clsxTwMerge } from '@app/utils'
import { Label, Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react'
import { useEffect, useState } from 'react'

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

  useEffect(() => {
    if (options && defaultValue) {
      setSelected((prev) => options.find((option) => option.value === prev.value) || options[0])
      onSelect(selected)
    }
  }, [defaultValue, onSelect, options, selected])

  return (
    <div>
      <Listbox value={selected} onChange={handleSelect} name={name}>
        <Label
          className={clsxTwMerge(
            'mb-6 block font-normal leading-6 text-gray-400',
            sizeClasses[size].label,
            !showLabel && 'sr-only'
          )}
        >
          {label}
        </Label>
        <div className={clsxTwMerge('relative w-full font-space', className)}>
          <ListboxButton
            className={clsxTwMerge(
              'text-primary-800 relative w-full cursor-default rounded-md border border-primary-60 bg-primary-70 text-left shadow-sm hover:cursor-pointer hover:border-primary-50 focus:border-primary-50 focus:outline-none focus:ring-1 focus:ring-primary-50 active:ring-primary-50',
              sizeClasses[size].button
            )}
          >
            <span
              className={clsxTwMerge('block truncate leading-tight', !selected && 'text-gray-50')}
            >
              {selected ? selected.label : label}
            </span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-6">
              <ChevronDownIcon
                aria-hidden="true"
                className={clsxTwMerge(sizeClasses[size].icon, 'text-gray-50')}
              />
            </span>
          </ListboxButton>

          <ListboxOptions
            transition
            className="absolute z-10 mt-1 w-full overflow-auto rounded-md bg-primary-70 shadow-2xl ring-1 ring-black ring-opacity-5 drop-shadow-2xl scrollbar-thin scrollbar-thumb-rounded-full focus:outline-none"
          >
            {options.map((option, index) => (
              <ListboxOption
                key={JSON.stringify(option)}
                value={option}
                className={clsxTwMerge(
                  index === 0 && 'rounded-t-md',
                  'text-primary-800 group relative cursor-default select-none font-space data-[focus]:bg-primary-60 data-[selected]:bg-primary-60/50 data-[focus]:text-white hover:cursor-pointer',
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
