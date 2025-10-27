export const COPY_BUTTON_TYPES = {
  ADDRESS: 'address',
  TRANSACTION: 'transaction',
  GENERIC: 'generic'
} as const

export type CopyTextButtonType = (typeof COPY_BUTTON_TYPES)[keyof typeof COPY_BUTTON_TYPES]
