import type { ReactNode } from 'react'

type Props = {
  id: string
  label: string
  children: ReactNode
}

export default function MobileFilterSection({ id, label, children }: Props) {
  return (
    <div id={id}>
      <h3 className="mb-8 text-sm font-medium text-white">{label}</h3>
      {children}
    </div>
  )
}
