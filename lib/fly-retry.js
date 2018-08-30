'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = flyRetry;

var _ = require('.');

var NAME_SPACE = 'FlyRetry';

var REFUSE_RESOLVE = null;

function getCurrentState(config) {
  var currentState = config[NAME_SPACE] || {};
  currentState.retryCount = currentState.retryCount || 0;
  config[NAME_SPACE] = currentState;
  return currentState;
}

function getRequestOptions(config, defaultOptions) {
  return _extends({}, defaultOptions, config);
}

function flyRetry(fly, defaultOptions) {
  fly.interceptors.request.use(function (config) {
    var currentState = getCurrentState(config);
    currentState.lastRequestTime = Date.now();
    return config;
  });

  fly.interceptors.response.use(REFUSE_RESOLVE, function (error) {
    var config = error.request;

    var _getRequestOptions = getRequestOptions(config, defaultOptions),
        _getRequestOptions$re = _getRequestOptions.retries,
        retries = _getRequestOptions$re === undefined ? 3 : _getRequestOptions$re,
        _getRequestOptions$re2 = _getRequestOptions.retryCondition,
        retryCondition = _getRequestOptions$re2 === undefined ? _.isRequestError : _getRequestOptions$re2,
        _getRequestOptions$re3 = _getRequestOptions.retryDelay,
        retryDelay = _getRequestOptions$re3 === undefined ? _.noDelay : _getRequestOptions$re3,
        _getRequestOptions$sh = _getRequestOptions.shouldResetTimeout,
        shouldResetTimeout = _getRequestOptions$sh === undefined ? false : _getRequestOptions$sh;

    var currentState = getCurrentState(config);

    var shouldRetry = retryCondition(error) && currentState.retryCount < retries;

    if (shouldRetry) {
      currentState.retryCount++;

      var delay = retryDelay(currentState.retryCount, error);

      if (!shouldResetTimeout && config.timeout && currentState.lastRequestTime) {
        var lastRequestDuration = Date.now() - currentState.lastRequestTime;

        config.timeout = Math.max(config.timeout - lastRequestDuration - delay, 1);
      }

      return new Promise(function (resolve) {
        return setTimeout(function () {
          return resolve(fly.request(config));
        }, delay);
      });
    }

    return Promise.reject(error);
  });
}
//# sourceMappingURL=fly-retry.js.map