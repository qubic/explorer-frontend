import { ChevronDownIcon } from '@app/assets/icons'
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react'

type Props = Readonly<{
  label: string | React.ReactNode
  children: React.ReactNode
  as?: keyof JSX.IntrinsicElements
  className?: string
}>

export default function Accordion({ label, children, as = 'div', className }: Props) {
  return (
    <Disclosure as={as} className={className}>
      <DisclosureButton className="group flex w-full items-center justify-between py-2 text-start text-gray-400">
        {label}
        <ChevronDownIcon className="size-14 transition-transform duration-300 ease-in-out group-data-[open]:rotate-180" />
      </DisclosureButton>
      <DisclosurePanel className="grid text-gray-500">{children}</DisclosurePanel>
    </Disclosure>
  )
}
