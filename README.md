# rb-data-json-server

A [Restboard](https://github.com/zuck/restboard) data provider for JSON REST server

## Getting started

```js
import jsonServerDataProvider from 'rb-data-json-server'

const provider = jsonServerDataProvider('https://jsonplaceholder.typicode.com')
const posts = await provider.getList('posts')
```

## REST Dialect

| Method          | API call                                                   |
| --------------- | ---------------------------------------------------------- |
| `getMany`       | `GET http://my.api.url/resource`                           |
| `getOne`        | `GET http://my.api.url/resource/:id`                       |
| `createOne`     | `POST http://my.api.url/resource`                          |
| `updateOne`     | `PATCH http://my.api.url/resource/:id`                     |
| `deleteOne`     | `DELETE http://my.api.url/resources/:id`                   |

## Test

```bash
npm test
```

## Acknowledgements

This project is inspired by:

* [ra-data-json-server](https://github.com/marmelab/react-admin/tree/master/packages/ra-data-json-server)

## License

Copyright (c) Emanuele Bertoldi

[MIT License](http://en.wikipedia.org/wiki/MIT_License)
