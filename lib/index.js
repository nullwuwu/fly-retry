import isRetryAllowed from './error'

const ERROR_MSG = 'ECONNABORTED'

const HTTP_METHODS = ['get', 'head', 'options', 'delete', 'put']

export function isNetWorkError (error) {
  return (
    !error.response &&
    !!error.code &&
    error.code !== ERROR_MSG &&
    isRetryAllowed(error)
  )
}

export function isRetryableError (error) {
  return (
    error.code !== ERROR_MSG &&
    (
      !error.response || (error.response.status >= 500 && error.response.status <= 599)
    )
  )
}

export function isRequestError (error) {
  if (!error.request) {
    return false
  }

  return isRetryableError(error) && !~HTTP_METHODS.indexOf(error.request.method)
}

export const noDelay = () => 0
