import fetch from "node-fetch";
import { RbDataProvider } from "rb-core-module";

function _createQuerystring(filters, sort, order, offset, limit) {
  let params = [];
  if (filters) {
    for (const key in filters) {
      params.push(`${key}=${filters[key]}`);
    }
  }
  if (sort) {
    const _sort = Array.isArray(sort) ? sort.join(",") : sort;
    params.push(`_sort=${_sort}`);
  }
  if (order) {
    params.push(`_order=${order}`);
  }
  if (offset) {
    params.push(`_start=${offset}`);
  }
  if (limit) {
    params.push(`_limit=${limit}`);
  }
  return params.join("&");
}

class RbDataJsonServerProvider extends RbDataProvider {
  constructor(apiURL) {
    super();
    this.apiURL = apiURL;
  }

  async getMany(
    resource,
    { filters = {}, sort = "", order = "", offset = 0, limit = null } = {}
  ) {
    const base = `${this.apiURL}/${resource}`;
    const qs = _createQuerystring(filters, sort, order, offset, limit);
    const url = [base, qs].filter((v) => v).join("?");
    const res = await fetch(url, {
      method: "GET",
    });
    if (!res.ok) {
      throw new Error(res.statusText);
    }
    return {
      data: await res.json(),
    };
  }

  async getOne(resource, { id }) {
    const url = `${this.apiURL}/${resource}/${id}`;
    const res = await fetch(url, {
      method: "GET",
    });
    if (!res.ok) {
      throw new Error(res.statusText);
    }
    return {
      data: await res.json(),
    };
  }

  async createOne(resource, data) {
    const { id, ...attrs } = data;
    const url = `${this.apiURL}/${resource}`;
    const res = await fetch(url, {
      method: "POST",
      body: JSON.stringify(attrs),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    });
    if (!res.ok) {
      throw new Error(res.statusText);
    }
    return {
      data: await res.json(),
    };
  }

  async updateOne(resource, { id, ...data }) {
    const url = `${this.apiURL}/${resource}/${id}`;
    const res = await fetch(url, {
      method: "PATCH",
      body: JSON.stringify(data),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    });
    if (!res.ok) {
      throw new Error(res.statusText);
    }
    return {
      data: await res.json(),
    };
  }

  async deleteOne(resource, { id }) {
    const url = `${this.apiURL}/${resource}/${id}`;
    const res = await fetch(url, {
      method: "DELETE",
    });
    if (!res.ok) {
      throw new Error(res.statusText);
    }
    return {
      data: { id },
    };
  }
}

function createProvider(apiURL) {
  return new RbDataJsonServerProvider(apiURL);
}

export default createProvider;
