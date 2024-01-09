import fetch from "cross-fetch";

export const retryCodes = [408, 500, 502, 503, 504, 522, 524];

export async function defaultClient(url, options) {
  const { abort, ...opts } = options;
  const headers = {
    Accept: "application/json",
    ...opts.headers,
  };
  const contentType = opts.headers ? opts.headers["Content-Type"] : undefined;
  if (contentType === undefined) {
    delete headers["Content-Type"];
  } else {
    headers["Content-Type"] = contentType;
    const shouldStringifyBody =
      contentType && contentType.startsWith("application/json");
    const isBodyString = typeof opts.body === "string";
    if (opts.body && shouldStringifyBody && !isBodyString) {
      opts.body = JSON.stringify(opts.body);
    }
  }
  return fetch(url, {
    credentials: "include",
    ...opts,
    headers,
    signal: abort?.signal,
  });
}

export function renderQuerystring(filters, sort, order, offset, limit) {
  const params = [];
  if (filters) {
    for (const key in filters) {
      const filterValue = filters[key];
      let values = [filterValue];
      if (Array.isArray(filterValue)) {
        values = filterValue;
      } else if (filterValue !== null && typeof filterValue === "object") {
        values = Object.keys(filterValue).filter((val) => !!filterValue[val]);
      }
      values.forEach((val) => params.push(`${key}=${val}`));
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
