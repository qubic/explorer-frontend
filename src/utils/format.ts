/**
 * Formats a string or number for display with proper locale formatting
 * @param string - The value to format
 * @returns Formatted string with locale-specific number formatting
 */
export const formatString = (string: string | number | undefined | null) => {
  if (string === undefined || string === null) return '0'

  if (!Number.isNaN(Number(string)))
    return Number(string).toLocaleString('en-US', {
      maximumFractionDigits: 2
    })

  return String(string)
}

/**
 * Formats a string with ellipsis in the middle
 * @param str - The string to format
 * @returns String with ellipsis if longer than 10 characters (e.g., "ABCDE...FGHIJ")
 */
export function formatEllipsis(str = '') {
  if (str.length > 10) {
    return `${str.slice(0, 5)}...${str.slice(-5)}`
  }
  return str
}

/**
 * Converts hex string to base64
 * @param hex - The hex string to convert
 * @returns Base64 encoded string
 */
export function formatBase64(hex: string | undefined) {
  if (hex) {
    const bytes = hex.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || []
    const uint8Array = new Uint8Array(bytes)
    const byteArray = Array.from(uint8Array)
    const byteString = String.fromCharCode.apply(null, byteArray)
    const base64String = btoa(byteString)
    return base64String
  }
  return ''
}

/**
 * Formats a Qubic price value to display as "price per billion"
 * @param price - The price value (e.g., 0.000000978)
 * @returns Formatted string like "$978 / bQUBIC"
 */
export function formatQubicPrice(price: number | undefined | null): string {
  const pricePerBillion = (price ?? 0) * 1_000_000_000
  return `$${formatString(pricePerBillion)} / bQUBIC`
}

/**
 * Converts base64 to hex string
 * @param base64 - The base64 string to convert
 * @returns Hex encoded string
 */
export function formatHex(base64: string | undefined): string {
  if (!base64) return ''
  try {
    const binaryString = atob(base64)
    return Array.from(binaryString, (char) =>
      char.charCodeAt(0).toString(16).padStart(2, '0')
    ).join('')
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('formatHex: Failed to decode base64 string', error)
  }
  return ''
}
