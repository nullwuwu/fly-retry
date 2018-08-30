'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.noDelay = undefined;
exports.isNetWorkError = isNetWorkError;
exports.isRetryableError = isRetryableError;
exports.isRequestError = isRequestError;

var _error = require('./error');

var _error2 = _interopRequireDefault(_error);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ERROR_MSG = 'ECONNABORTED';

var HTTP_METHODS = ['get', 'head', 'options', 'delete', 'put'];

function isNetWorkError(error) {
  return !error.response && !!error.code && error.code !== ERROR_MSG && (0, _error2.default)(error);
}

function isRetryableError(error) {
  return error.code !== ERROR_MSG && (!error.response || error.response.status >= 500 && error.response.status <= 599);
}

function isRequestError(error) {
  if (!error.request) {
    return false;
  }

  return isRetryableError(error) && !~HTTP_METHODS.indexOf(error.request.method);
}

var noDelay = exports.noDelay = function noDelay() {
  return 0;
};
//# sourceMappingURL=index.js.map