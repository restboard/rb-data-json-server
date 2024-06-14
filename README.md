# rb-data-provider-json-server

A [Restboard](https://restboard.github.io/) data provider for JSON REST server

[![Node.js CI](https://github.com/restboard/rb-data-provider-json-server/actions/workflows/node.js.yml/badge.svg)](https://github.com/restboard/rrb-data-provider-json-server/actions/workflows/node.js.yml)

## Getting started

```js
import createProvider from "rb-data-provider-json-server";

const provider = createProvider("https://jsonplaceholder.typicode.com");

provider
  .getMany("posts")
  .then((posts) => console.log(posts))
  .catch((err) => console.error(err));
```

Additional options can be configured during the data provider construction:

```js
const provider = createProvider("https://jsonplaceholder.typicode.com", {
  timeout: 3000,
  retries: 5,
  backoff: 300,
});
```

## REST Dialect

| Method       | API call                                 |
| ------------ | ---------------------------------------- |
| `getMany`    | `GET http://my.api.url/:resource`        |
| `getOne`     | `GET http://my.api.url/:resource/:id`    |
| `createOne`  | `POST http://my.api.url/:resource`       |
| `updateOne`  | `PATCH http://my.api.url/:resource/:id`  |
| `updateMany` | `PATCH http://my.api.url/:resource`      |
| `deleteOne`  | `DELETE http://my.api.url/:resource/:id` |
| `deleteMany` | `DELETE http://my.api.url/:resource`     |

## Options

| Name                  | Description                                           | Default     |
| --------------------- | ----------------------------------------------------- | ----------- |
| `timeout`             | The timeout (ms) for each single HTTP request attempt | `5000`      |
| `retries`             | The number of attempts before failing                 | `3`         |
| `backoff`             | The incremental delay (ms) between request attempts   | `500`       |
| `client`              | The HTTP client used to perform the requests          | `fetch`     |
| `tokenGetter`         | An async function to get the bearer token to be used  | `undefined` |
| `contentTypeParser`   | A function used to parse the content type of the request payload (if any) | `(data) => 'application/json; charset=UTF-8'` |
| `responseDataParser`  | A function to extract the payload from the response   | `undefined` |
| `responseMetaParser`  | A function to extract the meta details from the response (e.g. pagination data) | `undefined` |
| `responseErrorParser`  | A function to extract the details from an error response | `undefined` |
| `querystringRenderer` | A function to render the request querystring          | `undefined` |
| `idempotentUpdate`    | If true, the `PUT` method will be used on update requests | `false`     |
| `cache`               | An optional cache object to store request responses. Should implement the following API: `has(reqId)`, `get(reqId)`, `set(reqId,res)` | `undefined` |

## Test

```bash
npm test
```

## Contribute

If you want, you can also freely donate to fund the project development:

[![Donate](https://www.paypalobjects.com/en_US/i/btn/btn_donate_SM.gif)](https://paypal.me/EBertoldi)

## Have you found a bug?

Please open a new issue on:

<https://github.com/restboard/rb-data-provider-json-server/issues>

## Acknowledgements

This project is inspired by:

- [ra-data-json-server](https://github.com/marmelab/react-admin/tree/master/packages/ra-data-json-server)

## License

Copyright (c) Emanuele Bertoldi

[MIT License](http://en.wikipedia.org/wiki/MIT_License)
