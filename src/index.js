import { RbDataProvider } from "rb-core-module";
import { defaultClient, renderQuerystring, retryCodes } from "./http.js";

class RbDataProviderJsonServer extends RbDataProvider {
  constructor(
    apiURL,
    {
      timeout = 5000,
      retries = 3,
      backoff = 500,
      client = defaultClient,
      tokenGetter = null,
      contentTypeParser = (data) => "application/json; charset=UTF-8",
      responseDataParser = (res) => res?.data || res,
      responseMetaParser = (res) => res?.meta || {},
      responseErrorParser = (res) =>
        res
          ? res.statusText || `request failed with status ${res.status}`
          : null,
      querystringRenderer = renderQuerystring,
      idempotentUpdate = false,
      cache = null,
    } = {}
  ) {
    super();
    this.apiURL = apiURL;
    this.timeout = timeout;
    this.retries = retries;
    this.backoff = backoff;
    this.getToken = tokenGetter;
    this.parseContentType = contentTypeParser;
    this.parseData = responseDataParser;
    this.parseMeta = responseMetaParser;
    this.parseError = responseErrorParser;
    this.renderQuerystring = querystringRenderer;
    this.client = client;
    this.runningReqs = new Map();
    this.idempotentUpdate = idempotentUpdate;
    this.cache = cache;
  }

  async getMany(
    resource,
    {
      filters = {},
      sort = "",
      order = "",
      offset = 0,
      limit = null,
      abort = null,
    } = {}
  ) {
    const base = `${this.apiURL}/${resource}`;
    const qs = this.renderQuerystring(filters, sort, order, offset, limit);
    const url = [base, qs].filter((v) => v).join("?");
    const res = await this._performRequest(
      url,
      {
        method: "GET",
        abort,
      },
      this.retries
    );
    return {
      data: this.parseData(res),
      meta: this.parseMeta(res),
    };
  }

  async getOne(resource, key, { filters = {}, abort = null } = {}) {
    let url = `${this.apiURL}/${resource}/${key}`;
    const qs = this.renderQuerystring(filters);
    if (qs) {
      url += `?${qs}`;
    }
    const res = await this._performRequest(
      url,
      {
        method: "GET",
        abort,
      },
      this.retries
    );
    return {
      data: this.parseData(res),
      meta: this.parseMeta(res),
    };
  }

  async createOne(resource, data, { filters = {}, abort = null } = {}) {
    let url = `${this.apiURL}/${resource}`;
    const ct = this.parseContentType(data);
    const qs = this.renderQuerystring(filters);
    if (qs) {
      url += `?${qs}`;
    }
    const res = await this._performRequest(
      url,
      {
        method: "POST",
        body: data,
        headers: {
          "Content-Type": ct,
        },
        abort,
      },
      this.retries
    );
    return {
      data: this.parseData(res),
      meta: this.parseMeta(res),
    };
  }

  async updateOne(resource, key, data, { filters = {}, abort = null } = {}) {
    let url = `${this.apiURL}/${resource}/${key}`;
    const ct = this.parseContentType(data);
    const qs = this.renderQuerystring(filters);
    if (qs) {
      url += `?${qs}`;
    }
    const res = await this._performRequest(
      url,
      {
        method: this.idempotentUpdate ? "PUT" : "PATCH",
        body: data,
        headers: {
          "Content-Type": ct,
        },
        abort,
      },
      this.retries
    );
    return {
      data: this.parseData(res),
      meta: this.parseMeta(res),
    };
  }

  async updateMany(resource, data, { filters = {}, abort = null } = {}) {
    let url = `${this.apiURL}/${resource}`;
    const ct = this.parseContentType(data);
    const qs = this.renderQuerystring(filters);
    if (qs) {
      url += `?${qs}`;
    }
    const res = await this._performRequest(
      url,
      {
        method: this.idempotentUpdate ? "PUT" : "PATCH",
        body: data,
        headers: {
          "Content-Type": ct,
        },
        abort,
      },
      this.retries
    );
    return {
      data: this.parseData(res),
      meta: this.parseMeta(res),
    };
  }

  async deleteOne(resource, key, { filters = {}, abort = null } = {}) {
    let url = `${this.apiURL}/${resource}/${key}`;
    const qs = this.renderQuerystring(filters);
    if (qs) {
      url += `?${qs}`;
    }
    await this._performRequest(
      url,
      {
        method: "DELETE",
        abort,
      },
      this.retries
    );
    return {
      data: key,
    };
  }

  async deleteMany(resource, keys, { filters = {}, abort = null } = {}) {
    let url = `${this.apiURL}/${resource}`;
    const qs = this.renderQuerystring(filters);
    if (qs) {
      url += `?${qs}`;
    }
    await this._performRequest(
      url,
      {
        method: "DELETE",
        body: keys,
        abort,
      },
      this.retries
    );
    return {
      data: keys,
    };
  }

  async _performRequest(url, options, retries, backoff) {
    const { abort, headers, ...opts } = options;
    const _backoff = backoff || this.backoff;
    const _token = this.getToken ? await this.getToken() : undefined;
    const _headers = {
      Authorization: _token && `Bearer ${_token}`,
      ...headers,
    };
    const _reqOpts = {
      timeout: this.timeout,
      ...opts,
      headers: _headers,
    };
    const _reqId = JSON.stringify({
      ..._reqOpts,
      url,
    });
    _reqOpts.abort = abort;

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
          return Promise.reject(this.parseError(res));
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
