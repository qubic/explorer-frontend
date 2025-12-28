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
    <div className="group relative flex h-fit w-fit items-center">
      <div className="flex items-center" data-tooltip-id={tooltipIdWithId}>
        {children}
      </div>
      <ReactTooltip
        id={tooltipIdWithId}
        style={{
          backgroundColor: '#202E3C',
          borderRadius: 10,
          fontSize: 11,
          maxWidth: '200px', // Set a fixed maximum width for tooltips
          wordWrap: 'break-word', // Breaks long words when necessary
          wordBreak: 'break-word', // Breaks word at any point if necessary
          whiteSpace: 'normal', // Allows text to break to the next line
          lineHeight: '1.5', // Adds spacing between lines
          padding: '5px', // Adds padding inside the tooltip
          boxSizing: 'border-box' // Ensures padding doesn't overflow the tooltip
        }}
        opacity={100}
      >
        {content}
      </ReactTooltip>
    </div>
  )
}
