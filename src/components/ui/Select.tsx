import { ChevronDownIcon } from '@app/assets/icons'
import { clsxTwMerge } from '@app/utils'
import { Label, Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react'
import { useEffect, useState } from 'react'

export type Option<ValueType = string> = Readonly<{
  label: string
  value: ValueType
}>

type Props<ValueType> = Readonly<{
  label: string
  options: Option<ValueType>[]
  onSelect: (option: Option<ValueType>) => void
  name?: string
  showLabel?: boolean
  defaultValue?: Option<ValueType>
  className?: string
}>

export default function Select<ValueType = string>({
  label,
  options,
  onSelect,
  defaultValue,
  name = `select-${label}`,
  showLabel = false,
  className
}: Props<ValueType>) {
  const [selected, setSelected] = useState<Option<ValueType> | null>(defaultValue || null)

  const handleSelect = (option: Option<ValueType>) => {
    setSelected(option)
    onSelect(option)
  }

  useEffect(() => {
    if (options && defaultValue) {
      const initialSelected = options.find((option) => option.value === defaultValue.value) || null
      setSelected(initialSelected)
      if (initialSelected) onSelect(initialSelected)
    }
  }, [defaultValue, onSelect, options])

  return (
    <Listbox value={selected} onChange={handleSelect} name={name}>
      <Label
        className={clsxTwMerge(
          'mb-6 block text-sm font-normal leading-6 text-gray-400',
          !showLabel && 'sr-only'
        )}
      >
        {label}
      </Label>
      <div className={clsxTwMerge('relative w-full font-space', className)}>
        <ListboxButton className="text-primary-800 relative w-full cursor-default rounded-md border border-primary-60 bg-primary-70 py-8 pl-12 pr-16 text-left text-sm shadow-sm hover:cursor-pointer hover:border-primary-50 focus:border-primary-50 focus:outline-none focus:ring-1 focus:ring-primary-50 active:ring-primary-50 sm:py-16 sm:pl-14 sm:pr-32 sm:text-base sm:leading-6">
          <span
            className={clsxTwMerge('block truncate leading-tight', !selected && 'text-gray-50')}
          >
            {selected ? selected.label : label}
          </span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-10">
            <ChevronDownIcon
              aria-hidden="true"
              className="h-18 w-18 text-gray-50 sm:h-20 sm:w-20"
            />
          </span>
        </ListboxButton>

        <ListboxOptions
          transition
          className="absolute z-10 mt-1 w-full overflow-auto rounded-md bg-primary-70 py-5 text-base shadow-2xl ring-1 ring-black ring-opacity-5 drop-shadow-2xl scrollbar-thin scrollbar-thumb-rounded-full data-[closed]:data-[leave]:opacity-0 data-[leave]:transition data-[leave]:duration-100 data-[leave]:ease-in focus:outline-none sm:text-sm"
        >
          {options.map((option, index) => (
            <ListboxOption
              key={JSON.stringify(option)}
              value={option}
              className={clsxTwMerge(
                index === 0 && 'rounded-t-md',
                'text-primary-800 group relative cursor-default select-none px-10 py-8 font-space text-sm data-[focus]:bg-primary-60 data-[selected]:bg-primary-60/50 data-[focus]:text-white hover:cursor-pointer sm:px-16 sm:py-10 sm:text-base'
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
  )
}
