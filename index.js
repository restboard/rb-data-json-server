import fetch from 'node-fetch'
import { RbDataProvider } from 'rb-core-module'

class RbDataJsonServerProvider extends RbDataProvider {
  constructor (apiURL) {
    super()
    this.apiURL = apiURL
  }

  async getMany (resource) {
    const url = `${this.apiURL}/${resource}`
    const res = await fetch(url, {
      method: 'GET'
    })
    if (!res.ok) {
      throw new Error(res.statusText)
    }
    return {
      data: await res.json()
    }
  }

  async getOne (resource, { id }) {
    const url = `${this.apiURL}/${resource}/${id}`
    const res = await fetch(url, {
      method: 'GET'
    })
    if (!res.ok) {
      throw new Error(res.statusText)
    }
    return {
      data: await res.json()
    }
  }

  async createOne (resource, data) {
    const { id, ...attrs } = data
    const url = `${this.apiURL}/${resource}`
    const res = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(attrs),
      headers: {
        'Content-type': 'application/json; charset=UTF-8'
      }
    })
    if (!res.ok) {
      throw new Error(res.statusText)
    }
    return {
      data: await res.json()
    }
  }

  async updateOne (resource, { id, ...data }) {
    const url = `${this.apiURL}/${resource}/${id}`
    const res = await fetch(url, {
      method: 'PATCH',
      body: JSON.stringify(data),
      headers: {
        'Content-type': 'application/json; charset=UTF-8'
      }
    })
    if (!res.ok) {
      throw new Error(res.statusText)
    }
    return {
      data: await res.json()
    }
  }

  async deleteOne (resource, { id }) {
    const url = `${this.apiURL}/${resource}/${id}`
    const res = await fetch(url, {
      method: 'DELETE'
    })
    if (!res.ok) {
      throw new Error(res.statusText)
    }
    return {
      data: { id }
    }
  }
}

function createProvider (apiURL) {
  return new RbDataJsonServerProvider(apiURL)
}

export default createProvider
