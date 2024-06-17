import t from "tap";
import createProvider from "../src/index.js";

t.test("parseError", async (t) => {
  t.test("without promise", async (t) => {
    const provider = createProvider("https://jsonplaceholder.typicode.com", {
      responseErrorParser: () => "bar",
    });
    try {
      await provider.getMany("foo");
      t.fail("should throw an error");
    } catch (err) {
      t.equal("bar", err, "should return the parsed error");
    }
  });
  t.test("with promise", async (t) => {
    const provider = createProvider("https://jsonplaceholder.typicode.com", {
      responseErrorParser: () => Promise.resolve("bar"),
    });
    try {
      await provider.getMany("foo");
      t.fail("should throw an error");
    } catch (err) {
      t.equal("bar", err, "should return the resolved error");
    }
  });
  t.test("throwing an error inside the parser", async (t) => {
    const provider = createProvider("https://jsonplaceholder.typicode.com", {
      responseErrorParser: () => {
        throw new Error("bar");
      },
    });
    try {
      await provider.getMany("foo");
      t.fail("should throw an error");
    } catch (err) {
      t.equal("bar", err?.message, "should return the thrown error");
    }
  });
});
