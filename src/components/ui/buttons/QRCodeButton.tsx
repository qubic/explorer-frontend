import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { QRCodeSVG } from 'qrcode.react'

import { QRCodeIcon, XmarkIcon } from '@app/assets/icons'
import { clsxTwMerge } from '@app/utils'
import Modal from '../Modal'
import Tooltip from '../Tooltip'

type Props = {
  address: string
  className?: string
}

export default function QRCodeButton({ address, className }: Props) {
  const { t } = useTranslation('network-page')
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleOpenModal = () => {
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  return (
    <>
      <Tooltip content={t('showQRCode')} tooltipId="qrcode-button">
        <button
          type="button"
          className={clsxTwMerge(
            'flex items-center justify-center rounded-8 text-gray-50 hover:text-white',
            className
          )}
          onClick={handleOpenModal}
          aria-label={t('showQRCode')}
        >
          <QRCodeIcon className="size-14" />
        </button>
      </Tooltip>

      <Modal
        id="qrcode-modal"
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        closeOnOutsideClick
        className="top-1/2 flex -translate-y-1/2 items-center justify-center"
      >
        <div className="relative mx-16 w-full max-w-[340px] rounded-12 bg-primary-70 p-16 shadow-xl sm:p-20">
          {/* Close button */}
          <button
            type="button"
            onClick={handleCloseModal}
            className="absolute right-12 top-12 text-gray-50 hover:text-white"
            aria-label="Close"
          >
            <XmarkIcon className="size-20" />
          </button>

          {/* Modal content */}
          <div className="flex flex-col items-center">
            <h2 className="mb-20 font-space text-lg text-white sm:text-xl" id="qrcode-modal-title">
              {t('qrcodeModalTitle')}
            </h2>

            {/* QR Code */}
            <div className="mb-16 bg-white p-6">
              <QRCodeSVG value={address} size={220} level="H" includeMargin={false} />
            </div>

            {/* Address text */}
            <p className="break-all text-center font-space text-xs text-gray-50 sm:text-sm">
              {address}
            </p>
          </div>
        </div>
      </Modal>
    </>
  )
}
