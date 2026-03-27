import { useId, useMemo } from 'react'
import { Tooltip as ReactTooltip } from 'react-tooltip'

import { TOOLTIP_BASE_STYLE } from './tooltip-styles'

type Props = {
  tooltipId: string
  children: React.ReactNode
  content: string
}

export default function Tooltip({ tooltipId, children, content }: Props) {
  const id = useId()

  const tooltipIdWithId = useMemo(() => `${tooltipId}-${id}-tooltip`, [tooltipId, id])

  return (
    <div className="group relative flex h-fit w-fit items-center">
      <div className="flex items-center" data-tooltip-id={tooltipIdWithId}>
        {children}
      </div>
      <ReactTooltip
        id={tooltipIdWithId}
        style={{
          ...TOOLTIP_BASE_STYLE,
          maxWidth: '200px',
          wordWrap: 'break-word',
          wordBreak: 'break-word',
          whiteSpace: 'normal',
          lineHeight: '1.5',
          boxSizing: 'border-box'
        }}
        opacity={100}
      >
        {content}
      </ReactTooltip>
    </div>
  )
}
