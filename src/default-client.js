import fetch from 'cross-fetch'

async function defaultClient (url, options) {
  const opts = { ...options }
  const contentType = opts.headers && opts.headers['Content-Type']
  const shouldStringifyBody = (
    !contentType ||
    contentType.startsWith('application/json') ||
    contentType.startsWith('text/')
  )
  const isBodyString = typeof opts.body === 'string'
  if (shouldStringifyBody && !isBodyString && opts.body) {
    opts.body = JSON.stringify(opts.body)
  }
  return fetch(url, {
    credentials: 'include',
    ...opts,
    headers: {
      'Content-Type': 'application/json; charset=UTF-8',
      Accept: 'application/json',
      ...opts.headers
    }
  })
}

export default defaultClient
