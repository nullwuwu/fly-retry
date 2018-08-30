import { isRequestError, noDelay } from '.'

const NAME_SPACE = 'FlyRetry'

const REFUSE_RESOLVE = null

function getCurrentState (config) {
  const currentState = config[NAME_SPACE] || {}
  currentState.retryCount = currentState.retryCount || 0
  config[NAME_SPACE] = currentState
  return currentState
}

function getRequestOptions (config, defaultOptions) {
  return {
    ...defaultOptions,
    ...config
  }
}

export default function flyRetry (fly, defaultOptions) {
  fly.interceptors.request.use(config => {
    const currentState = getCurrentState(config)
    currentState.lastRequestTime = Date.now()
    return config
  })

  fly.interceptors.response.use(REFUSE_RESOLVE, error => {
    const config = error.request

    const {
      retries = 3,
      retryCondition = isRequestError,
      retryDelay = noDelay,
      shouldResetTimeout = false
    } = getRequestOptions(config, defaultOptions)

    const currentState = getCurrentState(config)

    const shouldRetry = retryCondition(error) && currentState.retryCount < retries

    if (shouldRetry) {
      currentState.retryCount++

      const delay = retryDelay(currentState.retryCount, error)

      if (!shouldResetTimeout && config.timeout && currentState.lastRequestTime) {
        const lastRequestDuration = Date.now() - currentState.lastRequestTime

        config.timeout = Math.max(config.timeout - lastRequestDuration - delay, 1)
      }

      return new Promise(resolve => setTimeout(() => resolve(fly.request(config)), delay))
    }

    return Promise.reject(error)
  })
}
