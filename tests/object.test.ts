import validate from "../src";

test("good object", () => {
  expect(validate(
    {
      name: "test name",
      age: 26,
      role: "admin",
    },
    {
      name: String,
      age: Number,
      role: validate.either("user", "admin")
    },
  )).toMatchObject({
    name: "test name",
    age: 26,
    role: "admin",
  });
});

test("wrong object field", () => {
  expect(() => validate(
    {
      name: null,
      age: 47,
      role: "user",
    },
    {
      name: String,
      age: Number,
      role: validate.either("user", "admin")
    },
  )).toThrow(new validate.Error(["body", "name"], String, null));
});

test("missing object field", () => {
  expect(() => validate(
    {
      age: 13,
      role: "admin",
    },
    {
      name: String,
      age: Number,
      role: validate.either("user", "admin")
    },
  )).toThrow(new validate.Error(["body", "name"], String, undefined));
});

test("extra object field", () => {
  expect(() => validate(
    {
      name: "test name",
      age: 13,
      role: "admin",
      extraField: null,
    },
    {
      name: String,
      age: Number,
      role: validate.either("user", "admin")
    },
  )).toThrow(new validate.Error(["body", "extraField"], undefined, null));
});


