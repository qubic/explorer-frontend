import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { CameraIcon } from '@app/assets/icons'
import { Routes } from '@app/router'

type Props = {
  icon: React.ReactNode
  title: string
  result: string
  label: string
  info: string
  link: string
  items?: string[]
  onClick?: () => void
}

function ResultItem({ icon, title, link, items, result, label, info, onClick }: Props) {
  const { t } = useTranslation('global')
  return (
    <>
      <div className="mt-20 space-y-2 px-12">
        <p className="font-space text-12 text-muted-foreground">{title}</p>
        <Link
          className="flex items-center gap-5 break-all rounded-12 p-10 hover:bg-muted"
          to={link}
          role="button"
          onClick={onClick}
        >
          {icon}
          <p className="font-sans text-xs">
            {result}
            <br />
            <span className="text-muted-foreground">{label}</span>{' '}
            <span className="font-light">{info}</span>
          </p>
        </Link>
      </div>
      {items && (
        <div className="mt-16 space-y-2 px-12">
          <p className="font-space text-xs text-muted-foreground">{t('transactions')}</p>
          <ul className="grid gap-4">
            {items.map((item) => (
              <li key={item}>
                <Link
                  role="button"
                  className="flex items-center gap-5 break-all rounded-12 px-10 py-8 text-xs hover:bg-muted"
                  to={Routes.NETWORK.TX(item)}
                  onClick={onClick}
                >
                  <CameraIcon className="mr-6 h-16 w-16" />
                  {item}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  )
}

export default ResultItem
