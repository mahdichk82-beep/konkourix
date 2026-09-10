export type OperationalErrorFields = {
  errorCode?: string
  errorName: string
}

export const operationalErrorFields = (
  error: unknown,
): OperationalErrorFields => {
  const candidateName = error instanceof Error ? error.name : 'UnknownError'
  const errorName = /^[A-Za-z][A-Za-z0-9_.:-]{0,63}$/.test(candidateName)
    ? candidateName
    : 'Error'
  const candidateCode =
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (typeof error.code === 'string' || typeof error.code === 'number')
      ? String(error.code)
      : undefined
  const errorCode =
    candidateCode && /^[A-Za-z0-9_.:-]{1,64}$/.test(candidateCode)
      ? candidateCode
      : undefined

  return {
    errorName,
    ...(errorCode === undefined ? {} : { errorCode }),
  }
}
