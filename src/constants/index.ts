export const TRANSACTION_OPTIONS = [
  { label: 'All transactions', value: 'all' },
  { label: 'Transfer transactions', value: 'transfer' },
  { label: 'Approved transactions', value: 'approved' }
] as const

export const TRANSACTION_OPTIONS_MOBILE = [
  { label: 'All', value: 'all' },
  { label: 'Transfer', value: 'transfer' },
  { label: 'Approved', value: 'approved' }
] as const

export default { TRANSACTION_OPTIONS, TRANSACTION_OPTIONS_MOBILE }
