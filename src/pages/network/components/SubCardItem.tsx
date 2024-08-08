type Props = {
  title: string
  content: React.ReactNode
  variant?: 'primary'
}

export default function SubCardItem({ title, content, variant }: Props) {
  if (variant === 'primary') {
    return (
      <div className="flex flex-col gap-8 md:flex-row md:justify-between">
        <p className="font-space text-14 leading-18 text-gray-50">{title}</p>
        {content}
      </div>
    )
  }

  return (
    <div className="mb-12 flex flex-col gap-12 border-t-[1px] border-gray-70 pt-12 md:flex-row">
      <p className="w-120 font-space text-14 leading-20 text-gray-50">{title}</p>
      {content}
    </div>
  )
}
