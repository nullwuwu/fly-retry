# fly-retry

fly plugin that intercepts failed requests and retries them whenever possible.

## Installation

```bash
npm install fly-retry
or
yarn add fly-retry
```

## Usage

```js
// CommonJS
// const flyRetry = require('fly-retry');

// ES6
import flyRetry from 'fly-retry';

flyRetry(fly, { retries: 3 });

fly.get('http://example.com/test') // The first request fails and the second returns 'ok'
  .then(result => {
    result.data; // 'ok'
  });

// Exponential back-off retry delay between requests
flyRetry(fly, { retryDelay: flyRetry.exponentialDelay});

// Custom retry delay
flyRetry(fly, { retryDelay: (retryCount) => {
  return retryCount * 1000;
}});

// Works with custom fly instances
const client = fly.create({ baseURL: 'http://example.com' });
flyRetry(client, { retries: 3 });

client.get('/test') // The first request fails and the second returns 'ok'
  .then(result => {
    result.data; // 'ok'
  });

// Allows request-specific configuration
client
  .get('/test', {
    'FlyRetry': {
      retries: 0
    }
  })
  .catch(error => { // The first request fails
    error !== undefined
  });
```

**Note:** Unless `shouldResetTimeout` is set, the plugin interprets the request timeout as a global value, so it is not used for each retry but for the whole request lifecycle.

## Options

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| retries | `Number` | `3` | The number of times to retry before failing. |
| retryCondition | `Function` | `isNetworkOrIdempotentRequestError` | A callback to further control if a request should be retried.  By default, it retries if it is a network error or a 5xx error on an idempotent request (GET, HEAD, OPTIONS, PUT or DELETE). |
| shouldResetTimeout | `Boolean` | false | Defines if the timeout should be reset between retries |
| retryDelay | `Function` | `function noDelay() { return 0; }` | A callback to further control the delay between retried requests. By default there is no delay between retries. Another option is exponentialDelay ([Exponential Backoff](https://developers.google.com/analytics/devguides/reporting/core/v3/errors#backoff)). The function is passed `retryCount` and `error`. |

## Contribute

1.  Fork it!
2.  Create your feature branch: `git checkout -b my-new-feature`
3.  Commit your changes: `git commit -am 'Add some feature'`
4.  Push to the branch: `git push origin my-new-feature`
5.  Submit a pull request :D
