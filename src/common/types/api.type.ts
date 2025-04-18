export interface IResponseError {
  code: string
  message: string
}

export interface IResponse<T> {
  success: boolean
  data?: T
  error?: IResponseError
}
