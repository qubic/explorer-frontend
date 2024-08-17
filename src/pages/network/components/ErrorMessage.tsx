import { useTranslation } from 'react-i18next'

function ErrorMessage() {
  const { t } = useTranslation('network-page')

  return (
    <div className="w-full bg-warning-90 py-12">
      <p className="w-full text-center text-15 leading-36 text-warning-40">{t('errorMessage')}</p>
    </div>
  )
}

export default ErrorMessage
