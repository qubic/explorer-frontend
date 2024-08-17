// eslint-disable-next-line import/prefer-default-export
export const handleThunkError = (
  error: unknown,
  defaultMessage = 'An unknown error occurred'
): string => {
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === 'string') {
    return error
  }
  return JSON.stringify(error) || defaultMessage
}
