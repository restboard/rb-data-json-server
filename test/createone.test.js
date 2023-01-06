import t from "tap";
import createProvider from "../src/index.js";

t.test("createOne", async (t) => {
  const provider = createProvider("https://jsonplaceholder.typicode.com");
  const data = {
    title: "foo",
    body: "bar",
    userId: 1,
  };
  const res = await provider.createOne("posts", data);
  const { id, ...details } = res.data || {};
  t.ok(id, "should return a new resource with an id");
  t.same(details, data, "the resource should have the given attributes");
});
