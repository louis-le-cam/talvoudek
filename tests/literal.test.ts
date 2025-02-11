import validate from "../src";

test("good string literal", () => {
  expect(validate("test string literal", "test string literal"))
    .toBe("test string literal");
});

test("wrong string literal", () => {
  expect(() => validate("value", "schema"))
    .toThrow(new validate.ValidationError(["body"], "schema", "value"));
});

test("good number literal", () => {
  expect(validate(42, 42)).toBe(42);
});

test("wrong number literal", () => {
  expect(() => validate(42, 89)).toThrow(new validate.ValidationError(["body"], 89, 42));
});

test("good nan number literal", () => {
  expect(validate(NaN, NaN)).toBe(NaN);
});

test("unexpected nan number literal", () => {
  expect(() => validate(NaN, 3853)).toThrow(new validate.ValidationError(["body"], 3853, NaN));
});

test("expected nan number literal", () => {
  expect(() => validate(3853, NaN)).toThrow(new validate.ValidationError(["body"], NaN, 3853));
});

test("good infinity number literal", () => {
  expect(validate(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY)).toBe(Number.POSITIVE_INFINITY);
});

test("unexpected infinity number literal", () => {
  expect(() => validate(Number.POSITIVE_INFINITY, -82242)).toThrow(new validate.ValidationError(["body"], -82242, Number.POSITIVE_INFINITY));
});

test("expected infinity number literal", () => {
  expect(() => validate(-82242, Number.POSITIVE_INFINITY)).toThrow(new validate.ValidationError(["body"], Number.POSITIVE_INFINITY, -82242));
});

test("good -infinity number literal", () => {
  expect(validate(Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY)).toBe(Number.NEGATIVE_INFINITY);
});

test("unexpected -infinity number literal", () => {
  expect(() => validate(Number.NEGATIVE_INFINITY, -82242)).toThrow(new validate.ValidationError(["body"], -82242, Number.NEGATIVE_INFINITY));
});

test("expected -infinity number literal", () => {
  expect(() => validate(-82242, Number.NEGATIVE_INFINITY)).toThrow(new validate.ValidationError(["body"], Number.NEGATIVE_INFINITY, -82242));
});
