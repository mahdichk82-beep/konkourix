export type ApiSuccessResponse<T> = {
  success: true
  data: T
  requestId: string
}

export type ApiErrorResponse = {
  success: false
  error: {
    code: string
    message: string
    details?: unknown
  }
  requestId: string
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse

export const successResponse = <T>(
  data: T,
  requestId: string,
): ApiSuccessResponse<T> => ({
  success: true,
  data,
  requestId,
})

export const errorResponse = (
  code: string,
  message: string,
  requestId: string,
  details?: unknown,
): ApiErrorResponse => ({
  success: false,
  error: {
    code,
    message,
    ...(details === undefined ? {} : { details }),
  },
  requestId,
})
