import { Typography } from '@app/components/ui'

type Props = {
  title: string
  content: React.ReactNode
  variant?: string
}

function SubCardItem({ title, content, variant }: Props) {
  if (variant === 'primary') {
    return (
      <div className="flex flex-col md:flex-row md:justify-between gap-8">
        <Typography className="text-14 leading-18 font-space text-gray-50">{title}</Typography>
        {content}
      </div>
    )
  }

  return (
    <div className="flex flex-col md:flex-row gap-12 pt-12 mb-12 border-t-[1px] border-gray-70">
      <Typography className="w-120 text-14 leading-20 font-space text-gray-50">{title}</Typography>
      {content}
    </div>
  )
}

export default SubCardItem
