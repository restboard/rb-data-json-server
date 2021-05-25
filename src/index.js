import fetch from 'node-fetch'
import { RbDataProvider } from 'rb-core-module'

const retryCodes = [408, 500, 502, 503, 504, 522, 524]

function _createQuerystring (filters, sort, order, offset, limit) {
  const params = []
  if (filters) {
    for (const key in filters) {
      params.push(`${key}=${filters[key]}`)
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

class RbDataJsonServerProvider extends RbDataProvider {
  constructor (apiURL, { timeout, retries, backoff, client } = {}) {
    super()
    this.apiURL = apiURL
    this.timeout = timeout || 5000
    this.retries = retries || 3
    this.backoff = backoff || 300
    this.client = client || ((...args) => fetch(...args))
  }

  async getMany (
    resource,
    { filters = {}, sort = '', order = '', offset = 0, limit = null } = {}
  ) {
    const base = `${this.apiURL}/${resource}`
    const qs = _createQuerystring(filters, sort, order, offset, limit)
    const url = [base, qs].filter((v) => v).join('?')
    const res = await this._performRequest(url, {
      method: 'GET'
    }, this.retries)
    return {
      data: res
    }
  }

  async getOne (resource, { id }) {
    const url = `${this.apiURL}/${resource}/${id}`
    const res = await this._performRequest(url, {
      method: 'GET'
    }, this.retries)
    return {
      data: res
    }
  }

  async createOne (resource, data) {
    const { id, ...attrs } = data
    const url = `${this.apiURL}/${resource}`
    const res = await this._performRequest(url, {
      method: 'POST',
      body: JSON.stringify(attrs),
      headers: {
        'Content-type': 'application/json; charset=UTF-8'
      }
    }, this.retries)
    return {
      data: res
    }
  }

  async updateOne (resource, { id, ...data }) {
    const url = `${this.apiURL}/${resource}/${id}`
    const res = await this._performRequest(url, {
      method: 'PATCH',
      body: JSON.stringify(data),
      headers: {
        'Content-type': 'application/json; charset=UTF-8'
      }
    }, this.retries)
    return {
      data: res
    }
  }

  async deleteOne (resource, { id }) {
    const url = `${this.apiURL}/${resource}/${id}`
    await this._performRequest(url, {
      method: 'DELETE'
    }, this.retries)
    return {
      data: { id }
    }
  }

  async _performRequest (url, options, retries, backoff) {
    const _backoff = backoff || this.backoff
    const res = await this.client(url, {
      timeout: this.timeout,
      ...options
    })
    if (!res.ok) {
      if (retries > 1 && retryCodes.includes(res.status)) {
        return new Promise((resolve, reject) => {
          setTimeout(async () => {
            try {
              const res = await this._performRequest(url, options, retries - 1, _backoff * 2)
              resolve(res)
            } catch (err) {
              reject(err)
            }
          }, _backoff)
        })
      } else {
        throw new Error(res.statusText)
      }
    }
    return res.json()
  }
}

function createProvider (apiURL, opts) {
  return new RbDataJsonServerProvider(apiURL, opts)
}

export default createProvider
