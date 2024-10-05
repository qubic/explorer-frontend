type Props = {
  children: React.ReactNode
  content: string
}

export default function Tooltip({ children, content }: Props) {
  return (
    <div className="group relative">
      <div>{children}</div>
      <div className="absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 transform group-hover:block">
        <div className="w-max max-w-[50vw] break-words rounded-8 bg-primary-60 px-8 py-6 text-xxs text-white xs:text-xs md:max-w-512">
          {content}
        </div>
        <svg
          className="absolute left-1/2 top-full h-3 w-full -translate-x-1/2 transform text-primary-60"
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
