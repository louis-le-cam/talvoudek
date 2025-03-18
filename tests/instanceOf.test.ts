import validate from "../src";

class Foo {}

class Bar {}

test("good instanceOf", () => {
  expect(validate(new Foo(), validate.instanceOf(Foo))).toBeInstanceOf(Foo);
});

test("bad instanceOf on other class", () => {
  expect(() => validate(new Bar(), validate.instanceOf(Foo))).toThrow(validate.ValidationError);
});

test("bad instanceOf on number", () => {
  expect(() => validate(834820, validate.instanceOf(Foo))).toThrow(validate.ValidationError);
});

test("bad instanceOf on null", () => {
  expect(() => validate(null, validate.instanceOf(Foo))).toThrow(validate.ValidationError);
});

test("bad instanceOf on undefined", () => {
  expect(() => validate(undefined, validate.instanceOf(Foo))).toThrow(validate.ValidationError);
});
