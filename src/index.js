import { RbDataProvider } from 'rb-core-module'
import defaultClient from './default-client'

const retryCodes = [408, 500, 502, 503, 504, 522, 524]

function _renderQuerystring (filters, sort, order, offset, limit) {
  const params = []
  if (filters) {
    for (const key in filters) {
      const filterValue = filters[key]
      let values = [filterValue]
      if (Array.isArray(filterValue)) {
        values = filterValue
      } else if (filterValue !== null && typeof filterValue === 'object') {
        values = Object.keys(filterValue).filter(val => !!filterValue[val])
      }
      values.forEach(val => params.push(`${key}=${val}`))
    }
  }
  if (sort) {
    const _sort = Array.isArray(sort) ? sort.join(',') : sort
    params.push(`_sort=${_sort}`)
  }
  if (order) {
    params.push(`_order=${order}`)
  }
  if (offset) {
    params.push(`_start=${offset}`)
  }
  if (limit) {
    params.push(`_limit=${limit}`)
  }
  return params.join('&')
}

class RbDataProviderJsonServer extends RbDataProvider {
  constructor (
    apiURL,
    {
      timeout,
      retries,
      backoff,
      client,
      tokenGetter,
      responseParser,
      querystringRenderer
    } = {}
  ) {
    super()
    this.apiURL = apiURL
    this.timeout = timeout || 5000
    this.retries = retries || 3
    this.backoff = backoff || 300
    this.getToken = tokenGetter || (() => undefined)
    this.parseResponse = responseParser || (res => res.data || res)
    this.renderQuerystring = querystringRenderer || _renderQuerystring
    this.client = client || defaultClient
    this.runningReqs = new Map()
  }

  async getMany (
    resource,
    { filters = {}, sort = '', order = '', offset = 0, limit = null } = {}
  ) {
    const base = `${this.apiURL}/${resource}`
    const qs = this.renderQuerystring(filters, sort, order, offset, limit)
    const url = [base, qs].filter(v => v).join('?')
    const res = await this._performRequest(
      url,
      {
        method: 'GET'
      },
      this.retries
    )
    return {
      data: this.parseResponse(res)
    }
  }

  async getOne (resource, { id }) {
    const url = `${this.apiURL}/${resource}/${id}`
    const res = await this._performRequest(
      url,
      {
        method: 'GET'
      },
      this.retries
    )
    return {
      data: this.parseResponse(res)
    }
  }

  async createOne (resource, data) {
    const { id, ...attrs } = data
    const url = `${this.apiURL}/${resource}`
    const res = await this._performRequest(
      url,
      {
        method: 'POST',
        body: attrs
      },
      this.retries
    )
    return {
      data: this.parseResponse(res)
    }
  }

  async updateOne (resource, { id, ...data }) {
    const url = `${this.apiURL}/${resource}/${id}`
    const res = await this._performRequest(
      url,
      {
        method: 'PATCH',
        body: data
      },
      this.retries
    )
    return {
      data: this.parseResponse(res)
    }
  }

  async updateMany (resource, data) {
    const url = `${this.apiURL}/${resource}`
    const res = await this._performRequest(
      url,
      {
        method: 'PATCH',
        body: data
      },
      this.retries
    )
    return {
      data: this.parseResponse(res)
    }
  }

  async deleteOne (resource, { id }) {
    const url = `${this.apiURL}/${resource}/${id}`
    await this._performRequest(
      url,
      {
        method: 'DELETE'
      },
      this.retries
    )
    return {
      data: { id }
    }
  }

  async _performRequest (url, options, retries, backoff) {
    const _backoff = backoff || this.backoff
    const _token = await this.getToken()
    const _headers = {
      Authorization: _token && `Bearer ${_token}`,
      ...options.headers
    }
    const _reqOpts = {
      timeout: this.timeout,
      ...options,
      headers: _headers
    }
    const _reqId = JSON.stringify({
      ..._reqOpts,
      url
    })

    // Batching
    if (this.runningReqs.has(_reqId)) {
      return this.runningReqs.get(_reqId)
    }
    const req = this.client(url, _reqOpts).finally(() =>
      this.runningReqs.delete(_reqId)
    )
    this.runningReqs.set(_reqId, req)

    // Retry on failure
    return req.then(res => {
      if (res.ok) {
        return res.json()
      }
      if (retries > 1 && retryCodes.includes(res.status)) {
        return new Promise((resolve, reject) => {
          const retryRequest = () => {
            this._performRequest(url, options, retries - 1, _backoff * 2)
              .then(resolve)
              .catch(reject)
          }
          setTimeout(retryRequest, _backoff)
        })
      } else {
        throw new Error(
          res.statusText || `request failed with status ${res.status}`
        )
      }
    })
  }
}

function createProvider (apiURL, opts) {
  return new RbDataProviderJsonServer(apiURL, opts)
}

export default createProvider
