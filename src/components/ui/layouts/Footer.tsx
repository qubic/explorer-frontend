import React, { memo } from 'react'
import { Link } from 'react-router-dom'

import { QubicExplorerLogoShort } from '@app/assets/icons/logo'
import { Routes } from '@app/router'

const footerTextClass = 'font-space text-xs text-white'

interface FooterLinkProps {
  label: string
  to: string
  isInternal: boolean
}

function FooterLink({ label, to, isInternal }: FooterLinkProps) {
  if (isInternal) {
    return (
      <Link className={footerTextClass} to={to}>
        {label}
      </Link>
    )
  }
  return (
    <a href={to} className={footerTextClass} target="_blank" role="button" rel="noreferrer">
      {label}
    </a>
  )
}

function Footer() {
  const linkItems: FooterLinkProps[] = [
    { label: 'Rich List', to: Routes.NETWORK.RICH_LIST(), isInternal: true },
    { label: 'Terms of Service', to: 'https://qubic.org/Terms-of-service', isInternal: false },
    { label: 'Privacy Policy', to: 'https://qubic.org/Privacy-policy', isInternal: false },
    { label: 'Network Status', to: 'https://status.qubic.li', isInternal: false }
  ]

  return (
    <footer className="flex flex-col items-center justify-center gap-10 px-12 py-20 md:flex-row md:gap-32 md:py-40">
      <div className="flex items-center gap-10">
        <QubicExplorerLogoShort />
        <p className="font-space text-xs text-gray-50">
          {'\u00A9'} {new Date().getFullYear()} Qubic.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-10">
        {linkItems.map((item, index) => (
          <React.Fragment key={item.label}>
            <FooterLink label={item.label} to={item.to} isInternal={item.isInternal} />
            {index < linkItems.length - 1 && <span className="text-gray-50">•</span>}
          </React.Fragment>
        ))}
      </div>
      <p className="font-space text-xs text-gray-50">Version 1.5</p>
    </footer>
  )
}

const MemoizedFooter = memo(Footer)

export default MemoizedFooter
