import t from "tap";
import createProvider from "../src/index.js";

const successRes = {
  status: 200,
  statusText: "OK",
  ok: true,
  json: async () => ({}),
};

t.test("cache", async (t) => {
  t.test("without cache", async (t) => {
    let attempts = 0;
    const fakeHttp = async () => {
      attempts += 1;
      return successRes;
    };
    const opts = {
      client: fakeHttp,
      cache: null,
    };
    const provider = createProvider("https://example.com", opts);
    await provider.getMany("posts");
    await provider.getMany("posts");
    await provider.getMany("posts");
    t.equal(3, attempts, "should perform all requests");
  });
  t.test("with cache", async (t) => {
    let attempts = 0;
    const fakeHttp = async () => {
      attempts += 1;
      return successRes;
    };
    const opts = {
      client: fakeHttp,
      cache: new Map(),
    };
    const provider = createProvider("https://example.com", opts);
    await provider.getMany("posts");
    await provider.getMany("posts");
    await provider.getMany("posts");
    t.equal(1, attempts, "should cache the first response");
  });
});
