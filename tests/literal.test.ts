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

test("expected null got null", () => {
  expect(validate(null, null)).toBe(null);
});

test("expected undefined got undefined", () => {
  expect(validate(null, null)).toBe(null);
});

test("expected undefined got null", () => {
  expect(() => validate(null, undefined)).toThrow(new validate.ValidationError(["body"], undefined, null));
});

test("expected null got undefined", () => {
  expect(() => validate(undefined, null)).toThrow(new validate.ValidationError(["body"], null, undefined));
});

test("expected boolean got false", () => {
  expect(validate(false, Boolean)).toBe(false);
});

test("expected boolean got true", () => {
  expect(validate(true, Boolean)).toBe(true);
});

test("expected boolean got null", () => {
  expect(() => validate(null, Boolean)).toThrow(new validate.ValidationError(["body"], Boolean, null));
});

test("expected boolean got undefined", () => {
  expect(() => validate(undefined, Boolean)).toThrow(new validate.ValidationError(["body"], Boolean, undefined));
});

test("expected boolean got object", () => {
  expect(() => validate({}, Boolean)).toThrow(new validate.ValidationError(["body"], Boolean, {}));
});

test("expected true got true", () => {
  expect(validate(true, true)).toBe(true);
});

test("expected true got false", () => {
  expect(() => validate(false, true)).toThrow(new validate.ValidationError(["body"], true, false));
});

test("expected true got object", () => {
  expect(() => validate({}, true)).toThrow(new validate.ValidationError(["body"], true, {}));
});

test("expected number got positive integer", () => {
  expect(validate(32823, Number)).toBe(32823);
});

test("expected number got negative integer", () => {
  expect(validate(-9322, Number)).toBe(-9322);
});

test("expected number got positive float", () => {
  expect(validate(892.18, Number)).toBe(892.18);
});

test("expected number got negative float", () => {
  expect(validate(-37289.280493, Number)).toBe(-37289.280493);
});

test("expected number got null", () => {
  expect(() => validate(null, Number)).toThrow(new validate.ValidationError(["body"], Number, null));
});

test("expected array of number got empty array", () => {
  expect(validate([], [Number])).toStrictEqual([]);
});

test("expected array of number got array of number", () => {
  expect(validate([1, 84932, -89242, 0, Number.POSITIVE_INFINITY, Number.NaN], [Number]))
    .toStrictEqual([1, 84932, -89242, 0, Number.POSITIVE_INFINITY, Number.NaN]);
});

test("expected array of number got object", () => {
  expect(() => validate({}, [Number])).toThrow(new validate.ValidationError(["body"], [Number], {}));
});

test("expected tuple of 2 number got tuple of 2 numbers", () => {
  expect(validate([32, -28.3], [Number, Number])).toStrictEqual([32, -28.3]);
});

test("expected tuple of 2 number found tuple of 3 numbers", () => {
  expect(() => validate([32, -28.3, 3], [Number, Number])).toThrow(new validate.ValidationError(["body"], [Number, Number], [32, -28.3, 3]));
});
