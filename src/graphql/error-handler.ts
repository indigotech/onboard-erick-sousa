import { unwrapResolverError } from '@apollo/server/errors'
export class CustomError extends Error {
  constructor(
    message: string,
    public code: number,
    public additionalInfo?: string
  ) {
    super(message)
  }
}

export function formatError(formattedError: Error, error: unknown) {
  const thrownError = unwrapResolverError(error)

  if (thrownError instanceof CustomError) {
    return {
      message: thrownError.message,
      code: thrownError.code,
      additionalInfo: thrownError.additionalInfo,
    }
  } else {
    return formattedError
  }
}
