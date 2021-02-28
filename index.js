import fetch from 'node-fetch'

class RbDataJsonServerProvider {
  constructor (apiURL) {
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

  async getOne(resource, { id }) {
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

  async createOne(resource) {
    return {}
  }

  async updateOne(resource) {
    return {}
  }

  async deleteOne(resource) {
    return {}
  }
}

function createProvider(apiURL) {
  return new RbDataJsonServerProvider(apiURL)
}

export default createProvider
