# rb-data-provider-json-server

A [Restboard](https://github.com/restboard/restboard) data provider for JSON REST server

## Getting started

```js
import createJsonServerDataProvider from 'rb-data-provider-json-server'

const provider = createJsonServerDataProvider('https://jsonplaceholder.typicode.com')

provider.getMany('posts')
  .then(posts => console.log(posts))
  .catch(err => console.error(err))
```

Additional options can be configured during the data provider construction:

```js
const provider = createJsonServerDataProvider('https://jsonplaceholder.typicode.com', {
  timeout: 3000,
  retries: 5,
  backoff: 300
})
```

## REST Dialect

| Method          | API call                                                   |
| --------------- | ---------------------------------------------------------- |
| `getMany`       | `GET http://my.api.url/:resource`                          |
| `getOne`        | `GET http://my.api.url/:resource/:id`                      |
| `createOne`     | `POST http://my.api.url/:resource`                         |
| `updateOne`     | `PATCH http://my.api.url/:resource/:id`                    |
| `deleteOne`     | `DELETE http://my.api.url/:resource/:id`                   |

## Options

| Name            | Description                                           | Default |
| --------------- | ------------------------------------------------------| ------- |
| `timeout`       | The timeout (ms) for each single HTTP request attempt | 5000    |
| `retries`       | The number of attempts before failing                 | 3       |
| `backoff`       | The incremental delay (ms) between request attempts   | 300     |
| `client`        | The HTTP client used to perform the requests          | `fetch` |

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

* [ra-data-json-server](https://github.com/marmelab/react-admin/tree/master/packages/ra-data-json-server)

## License

Copyright (c) Emanuele Bertoldi

[MIT License](http://en.wikipedia.org/wiki/MIT_License)
