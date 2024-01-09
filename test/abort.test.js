import t from "tap";
import createProvider from "../src/index.js";

t.test("aborting", async (t) => {
  const provider = createProvider("https://jsonplaceholder.typicode.com");
  const abort = new AbortController();
  abort.abort();
  try {
    await provider.getMany("posts", { abort });
    t.fail("should abort the request");
  } catch (err) {
    t.equal(err.name, "AbortError");
  }
});
