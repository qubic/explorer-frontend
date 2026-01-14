export type MenuItem = {
  i18nKey: string
  href: string
}

export type NavigationMenuItem = {
  i18nKey: string
  items?: MenuItem[]
  className?: string
}
