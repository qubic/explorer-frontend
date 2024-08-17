import type React from 'react'

import { Infocon } from '@app/assets/icons'
import { clsxTwMerge } from '@app/utils'
import { memo } from 'react'

type Variant = 'info' | 'warning' | 'error' | 'success'

type Props = {
  variant?: Variant
  children: React.ReactNode
  className?: string
}

const variantBgClasses: Record<Variant, string> = {
  info: 'bg-info-90',
  warning: 'bg-warning-90',
  error: 'bg-error-90',
  success: 'bg-success-90'
}

const variantTextClasses: Record<Variant, string> = {
  info: 'text-info-40',
  warning: 'text-warning-40',
  error: 'text-error-40',
  success: 'text-success-40'
}
// TODO: Add the correct icon for each variant
const variantIcons: Record<Variant, { icon: React.ElementType; className: string }> = {
  info: {
    icon: Infocon,
    className: 'text-info-40'
  },
  warning: {
    icon: Infocon,
    className: 'text-yellow-400'
  },
  error: {
    icon: Infocon,
    className: 'text-error-40'
  },
  success: {
    icon: Infocon,
    className: 'text-success-40'
  }
}

function Alert({ variant = 'info', children, className }: Props) {
  const IconComponent = variantIcons[variant].icon
  return (
    <div
      role="alert"
      className={clsxTwMerge(
        'flex items-center gap-10 rounded-12 p-16 text-sm',
        variantBgClasses[variant],
        className
      )}
    >
      <IconComponent
        aria-label={`${variant} icon`}
        className={clsxTwMerge('size-16', variantIcons[variant].className)}
      />
      <div className={clsxTwMerge('font-sans text-sm', variantTextClasses[variant])}>
        {children}
      </div>
    </div>
  )
}

const MemoizedAlert = memo(Alert)

export default MemoizedAlert
