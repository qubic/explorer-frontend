import { useId, useMemo } from 'react'
import { Tooltip as ReactTooltip } from 'react-tooltip'

type Props = {
  tooltipId: string
  children: React.ReactNode
  content: string
}

export default function Tooltip({ tooltipId, children, content }: Props) {
  const id = useId()

  const tooltipIdWithId = useMemo(() => `${tooltipId}-${id}-tooltip`, [tooltipId, id])

  return (
    <div className="group relative h-fit w-fit">
      <div data-tooltip-id={tooltipIdWithId}>{children}</div>
      <ReactTooltip
        id={tooltipIdWithId}
        style={{ backgroundColor: '#202E3C', borderRadius: 10, fontSize: 11 }}
        opacity={100}
      >
        {content}
      </ReactTooltip>
    </div>
  )
}
