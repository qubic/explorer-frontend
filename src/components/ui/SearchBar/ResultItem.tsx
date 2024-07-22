import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

type Props = {
  icon: React.ReactNode
  title: string
  content: React.ReactNode
  link: string
  items?: string[]
  onClick?: () => void
}

function ResultItem({ icon, title, content, link, items, onClick }: Props) {
  const { t } = useTranslation('global')
  return (
    <>
      <div className="mt-20 px-12 ">
        <p className="text-12 text-gray-50 font-space">{title}</p>
        <Link
          className="flex items-center gap-5 py-8 hover:bg-gray-70 break-all"
          to={link}
          role="button"
          onClick={onClick}
        >
          {icon}
          {content}
        </Link>
      </div>
      {items && (
        <div className="mt-20 px-12 ">
          <p className="text-12 text-gray-50 font-space">{t('transactions')}</p>
          {(items || []).map((item) => (
            <Link
              key={item}
              role="button"
              className="flex items-center gap-5 py-8 hover:bg-gray-70 break-all"
              // TODO: Use path from routes obj
              to={`/network/tx/${item}`}
              onClick={onClick}
            >
              <img className="w-16 h-16 mr-6" src="assets/icons/camera.svg" alt="transaction" />
              {item}
            </Link>
          ))}
        </div>
      )}
    </>
  )
}

export default ResultItem
