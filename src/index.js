import { RbDataProvider } from "rb-core-module";
import { defaultClient, renderQuerystring, retryCodes } from "./http.js";

class RbDataProviderJsonServer extends RbDataProvider {
  constructor(
    apiURL,
    {
      timeout,
      retries,
      backoff,
      client,
      tokenGetter,
      contentTypeParser,
      responseParser,
      querystringRenderer,
      idempotentUpdate,
      cache,
    } = {}
  ) {
    super();
    this.apiURL = apiURL;
    this.timeout = timeout || 5000;
    this.retries = retries || 3;
    this.backoff = backoff || 500;
    this.getToken = tokenGetter || (() => undefined);
    this.parseContentType = contentTypeParser || (() => 'application/json; charset=UTF-8');
    this.parseResponse = responseParser || ((res) => res.data || res);
    this.renderQuerystring = querystringRenderer || renderQuerystring;
    this.client = client || defaultClient;
    this.runningReqs = new Map();
    this.idempotentUpdate = idempotentUpdate || false;
    this.cache = cache || null;
  }

  async getMany(
    resource,
    { filters = {}, sort = "", order = "", offset = 0, limit = null } = {}
  ) {
    const base = `${this.apiURL}/${resource}`;
    const qs = this.renderQuerystring(filters, sort, order, offset, limit);
    const url = [base, qs].filter((v) => v).join("?");
    const res = await this._performRequest(
      url,
      {
        method: "GET",
      },
      this.retries
    );
    return {
      data: this.parseResponse(res),
    };
  }

  async getOne(resource, key, params = {}) {
    let url = `${this.apiURL}/${resource}/${key}`;
    const qs = this.renderQuerystring(params.filters);
    if (qs) {
      url += `?${qs}`;
    }
    const res = await this._performRequest(
      url,
      {
        method: "GET",
      },
      this.retries
    );
    return {
      data: this.parseResponse(res),
    };
  }

  async createOne(resource, data, params = {}) {
    let url = `${this.apiURL}/${resource}`;
    const ct = this.parseContentType(data);
    const qs = this.renderQuerystring(params.filters);
    if (qs) {
      url += `?${qs}`;
    }
    const res = await this._performRequest(
      url,
      {
        method: "POST",
        body: data,
        headers: {
          'Content-Type': ct
        }
      },
      this.retries
    );
    return {
      data: this.parseResponse(res),
    };
  }

  async updateOne(resource, key, data, params = {}) {
    let url = `${this.apiURL}/${resource}/${key}`;
    const ct = this.parseContentType(data);
    const qs = this.renderQuerystring(params.filters);
    if (qs) {
      url += `?${qs}`;
    }
    const res = await this._performRequest(
      url,
      {
        method: this.idempotentUpdate ? "PUT" : "PATCH",
        body: data,
        headers: {
          'Content-Type': ct
        }
      },
      this.retries
    );
    return {
      data: this.parseResponse(res),
    };
  }

  async updateMany(resource, data, params = {}) {
    let url = `${this.apiURL}/${resource}`;
    const ct = this.parseContentType(data);
    const qs = this.renderQuerystring(params.filters);
    if (qs) {
      url += `?${qs}`;
    }
    const res = await this._performRequest(
      url,
      {
        method: this.idempotentUpdate ? "PUT" : "PATCH",
        body: data,
        headers: {
          'Content-Type': ct
        }
      },
      this.retries
    );
    return {
      data: this.parseResponse(res),
    };
  }

  async deleteOne(resource, key, params = {}) {
    let url = `${this.apiURL}/${resource}/${key}`;
    const qs = this.renderQuerystring(params.filters);
    if (qs) {
      url += `?${qs}`;
    }
    await this._performRequest(
      url,
      {
        method: "DELETE",
      },
      this.retries
    );
    return {
      data: key,
    };
  }

  async deleteMany(resource, keys, params = {}) {
    let url = `${this.apiURL}/${resource}`;
    const qs = this.renderQuerystring(params.filters);
    if (qs) {
      url += `?${qs}`;
    }
    await this._performRequest(
      url,
      {
        method: "DELETE",
        body: keys,
      },
      this.retries
    );
    return {
      data: keys,
    };
  }

  async _performRequest(url, options, retries, backoff) {
    const _backoff = backoff || this.backoff;
    const _token = await this.getToken();
    const _headers = {
      Authorization: _token && `Bearer ${_token}`,
      ...options.headers,
    };
    const _reqOpts = {
      timeout: this.timeout,
      ...options,
      headers: _headers,
    };
    const _reqId = JSON.stringify({
      ..._reqOpts,
      url,
    });

    // Caching
    if (this.cache && (await this.cache.has(_reqId))) {
      return this.cache.get(_reqId);
    }

    // Batching
    if (this.runningReqs.has(_reqId)) {
      return this.runningReqs.get(_reqId);
    }

    const req = this.client(url, _reqOpts)
      .finally(() => this.runningReqs.delete(_reqId))
      .then((res) => {
        if (res.ok) {
          return res.json();
        }
        // Retry on failure
        if (retries > 1 && retryCodes.includes(res.status)) {
          return new Promise((resolve, reject) => {
            const retryRequest = () => {
              this._performRequest(url, options, retries - 1, _backoff * 2)
                .then(resolve)
                .catch(reject);
            };
            setTimeout(retryRequest, _backoff);
          });
        } else {
          throw new Error(
            res.statusText || `request failed with status ${res.status}`
          );
        }
      })
      .then((res) => {
        if (this.cache) {
          this.cache.set(_reqId, res);
        }
        return res;
      });

    this.runningReqs.set(_reqId, req);

    return req;
  }
}

function createProvider(apiURL, opts) {
  return new RbDataProviderJsonServer(apiURL, opts);
}

export default createProvider;
