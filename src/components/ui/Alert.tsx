import { memo } from 'react'

import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  Infocon
} from '@app/assets/icons'
import { clsxTwMerge } from '@app/utils'

type Variant = 'info' | 'warning' | 'error' | 'success'

type Size = 'sm' | 'md' | 'lg'

type Props = {
  variant?: Variant
  size?: Size
  children: React.ReactNode
  className?: string
}

const variantClasses = {
  info: {
    bg: 'bg-info-90',
    text: 'text-info-40',
    icon: Infocon,
    iconClass: 'text-info-40'
  },
  warning: {
    bg: 'bg-warning-90',
    text: 'text-warning-40',
    icon: ExclamationTriangleIcon,
    iconClass: 'text-yellow-400'
  },
  error: {
    bg: 'bg-error-90',
    text: 'text-error-40',
    icon: ExclamationCircleIcon,
    iconClass: 'text-error-40'
  },
  success: {
    bg: 'bg-success-90',
    text: 'text-success-40',
    icon: CheckCircleIcon,
    iconClass: 'text-success-40'
  }
} as const

const sizeClasses = {
  sm: {
    container: 'gap-6',
    text: 'text-xs',
    icon: 'size-16 '
  },
  md: {
    container: 'gap-8',
    text: 'text-sm',
    icon: 'size-20'
  },
  lg: {
    container: 'gap-10',
    text: 'text-base',
    icon: 'size-24'
  }
} as const

function Alert({ children, variant = 'info', size = 'md', className }: Props) {
  const { bg: bgColor, text: textColor, icon: IconComponent, iconClass } = variantClasses[variant]
  const { container: containerSize, text: textSize, icon: iconSize } = sizeClasses[size]

  return (
    <div
      role="alert"
      className={clsxTwMerge('flex rounded-12 p-16', bgColor, containerSize, className)}
    >
      <IconComponent
        aria-label={`${variant} icon`}
        className={clsxTwMerge('flex-shrink-0', iconClass, iconSize)}
      />
      <div className={clsxTwMerge('font-sans', textColor, textSize)}>{children}</div>
    </div>
  )
}

const MemoizedAlert = memo(Alert)

export default MemoizedAlert
