import { CameraIcon } from '@app/assets/icons'
import { Routes } from '@app/router'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

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
      <div className="mt-20 px-12 space-y-2">
        <p className="text-12 text-gray-50 font-space">{title}</p>
        <Link
          className="flex items-center gap-5 p-10 hover:bg-gray-70 break-all rounded-12"
          to={link}
          role="button"
          onClick={onClick}
        >
          {icon}
          <p className="text-xs font-sans">
            {result}
            <br />
            <span className="text-gray-50">{label}</span> <span className="font-light">{info}</span>
          </p>
        </Link>
      </div>
      {items && (
        <div className="mt-16 px-12 space-y-2">
          <p className="text-xs text-gray-50 font-space">{t('transactions')}</p>
          <ul className="grid gap-4">
            {items.map((item) => (
              <li key={item}>
                <Link
                  role="button"
                  className="text-xs flex items-center gap-5 px-10 py-8 hover:bg-gray-70 break-all rounded-12"
                  to={Routes.NETWORK.TX(item)}
                  onClick={onClick}
                >
                  <CameraIcon className="w-16 h-16 mr-6" />
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
