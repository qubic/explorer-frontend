import { QubicExplorerLogoShort } from '@app/assets/icons/logo'
import { memo } from 'react'

function Footer() {
  return (
    <footer className="px-12 py-20 sm:py-40 flex flex-col sm:flex-row justify-center items-center gap-10 sm:gap-32">
      <div className="flex items-center gap-10">
        <QubicExplorerLogoShort />
        <p className="text-12 font-space text-gray-50">
          {'\u00A9'} {new Date().getFullYear()} Qubic.
        </p>
      </div>
      <div className="flex items-center gap-10">
        <a
          href="https://qubic.org/Terms-of-service"
          className="text-12 font-space text-white"
          target="_blank"
          role="button"
          rel="noreferrer"
        >
          Terms of service
        </a>
        <span className="text-gray-50">•</span>
        <a
          href="https://qubic.org/Privacy-policy"
          className="text-12 font-space text-white"
          target="_blank"
          role="button"
          rel="noreferrer"
        >
          Privacy Policy
        </a>
        <span className="text-gray-50">•</span>
        <a
          href="https://status.qubic.li"
          className="text-12 font-space text-white"
          target="_blank"
          role="button"
          rel="noreferrer"
        >
          Network Status
        </a>
      </div>
      <p className="text-12 font-space text-gray-50">Version 1.5</p>
    </footer>
  )
}

const MemoFooter = memo(Footer)

export default MemoFooter
