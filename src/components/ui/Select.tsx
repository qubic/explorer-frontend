import { ChevronDownIcon } from '@app/assets/icons'
import { clsxTwMerge } from '@app/utils'
import { Label, Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react'
import { useState } from 'react'

export type Option = {
  readonly label: string
  readonly value: string
}

type Props = {
  label: string
  options: readonly Option[]
  onSelect: (option: Option) => void
  name?: string
  showLabel?: boolean
  defaultValue?: Option
  className?: string
}

export default function Select({
  label,
  options,
  onSelect,
  defaultValue,
  name = `select-${label}`,
  showLabel = false,
  className
}: Props) {
  const [selected, setSelected] = useState(defaultValue || options[0])

  const handleSelect = (option: Option) => {
    setSelected(option)
    onSelect(option)
  }

  return (
    <Listbox value={selected} onChange={handleSelect} name={name}>
      <Label
        className={clsxTwMerge(
          'leading-6 mb-6 block text-sm font-normal text-gray-400',
          !showLabel && 'sr-only'
        )}
      >
        {label}
      </Label>
      <div className={clsxTwMerge('relative w-[200px] font-space sm:w-[225px]', className)}>
        <ListboxButton className="sm:leading-6 text-primary-700 relative w-full cursor-default rounded-md border border-gray-500 bg-primary-70 py-8 pl-12 pr-16 text-left text-sm shadow-sm hover:cursor-pointer hover:border-white focus:border-gray-60 focus:outline-none focus:ring-2 focus:ring-gray-60 sm:py-16 sm:pl-14 sm:pr-32 sm:text-base">
          <span className="block truncate leading-tight">{selected?.label}</span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-10">
            <ChevronDownIcon
              aria-hidden="true"
              className="h-18 w-18 text-gray-50 sm:h-20 sm:w-20"
            />
          </span>
        </ListboxButton>

        <ListboxOptions
          transition
          className="bg-primary-80 absolute z-10 mt-1 w-full overflow-auto rounded-md py-5 text-base shadow-2xl ring-1 ring-black ring-opacity-5 drop-shadow-2xl scrollbar-thin scrollbar-thumb-rounded-full data-[closed]:data-[leave]:opacity-0 data-[leave]:transition data-[leave]:duration-100 data-[leave]:ease-in focus:outline-none sm:text-sm"
        >
          {options.map((option) => (
            <ListboxOption
              key={option.value}
              value={option}
              className="text-primary-700 group relative cursor-default select-none px-10 py-8 font-space text-sm data-[focus]:bg-[#232A31] data-[selected]:bg-[#18222C] data-[focus]:text-white hover:cursor-pointer sm:px-16 sm:py-10 sm:text-base"
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
