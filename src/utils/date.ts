// eslint-disable-next-line import/prefer-default-export -- Remove this comment when adding more functions
export function formatDate<T extends boolean = false>(
  dateString: string | undefined,
  options?: { split?: T }
): T extends true ? { date: string; time: string } : string {
  const defaultResult = (options?.split ? { date: '', time: '' } : '') as T extends true
    ? { date: string; time: string }
    : string
  const formatDateTime = (date: Date, dateTimeFormatOptions: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat('en-US', dateTimeFormatOptions).format(date)

  if (!dateString) return defaultResult

  const dateOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }

  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    timeZoneName: 'short',
    hour12: true
  }

  const date = new Date(dateString.includes('T') ? dateString : parseInt(dateString, 10))

  if (Number.isNaN(date.getTime())) return defaultResult

  return (
    options?.split
      ? { date: formatDateTime(date, dateOptions), time: formatDateTime(date, timeOptions) }
      : formatDateTime(date, { ...dateOptions, ...timeOptions })
  ) as T extends true ? { date: string; time: string } : string
}
