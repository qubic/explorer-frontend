type Props = {
  children: React.ReactNode
  content: string
}

export default function Tooltip({ children, content }: Props) {
  return (
    <div className="group relative">
      <div>{children}</div>
      <div className="absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 transform group-hover:block">
        <div className="whitespace-nowrap rounded-8 bg-gray-70 px-8 py-4 text-xs text-white">
          {content}
        </div>
        <svg
          className="absolute left-1/2 top-full h-3 w-full -translate-x-1/2 transform text-gray-70"
          x="0px"
          y="0px"
          viewBox="0 0 255 255"
          xmlSpace="preserve"
        >
          <polygon className="fill-current" points="0,0 127.5,127.5 255,0" />
        </svg>
      </div>
    </div>
  )
}
