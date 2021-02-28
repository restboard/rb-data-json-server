class RbDataJsonServerProvider {
  constructor (baseURL) {
    this.baseURL = baseURL
  }

  async getList (params) {
    return {}
  }

  async getOne(params) {
    return {}
  }

  async getMany(params) {
    return {}
  }

  async create(params) {
    return {}
  }

  async update(params) {
    return {}
  }

  async updateMany(params) {
    return {}
  }

  async delete(params) {
    return {}
  }
}

function createProvider(opts) {
  return new RbDataJsonServerProvider(...opts)
}

export default createProvider
