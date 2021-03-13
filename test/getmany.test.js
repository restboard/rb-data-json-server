import * as t from "tap";
import createProvider from "../index";

t.test("getMany", async (t) => {
  t.test("without params", async (t) => {
    const provider = createProvider("https://jsonplaceholder.typicode.com");
    const res = await provider.getMany("users");
    t.equal(res.data.length, 10, "should return all requested resources");
  });
  t.test("with filters", async (t) => {
    const provider = createProvider("https://jsonplaceholder.typicode.com");
    const res = await provider.getMany("comments", {
      filters: {
        postId: 1,
      },
    });
    t.equal(res.data.length, 5, "should return only matching results");
  });
  t.test("with sorting", async (t) => {
    const provider = createProvider("https://jsonplaceholder.typicode.com");
    const res = await provider.getMany("posts", {
      sort: "id",
      order: "desc",
    });
    t.equal(res.data[0].id, 100, "should return ordered results");
  });
  t.test("with pagination", async (t) => {
    const provider = createProvider("https://jsonplaceholder.typicode.com");
    const res = await provider.getMany("posts", {
      offset: 10,
      limit: 3,
    });
    t.equal(res.data.length, 3, "should return paginated results");
  });
});
