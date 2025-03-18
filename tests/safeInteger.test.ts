import validate from "../src";

test("positive small integer", () => {
  expect(validate(43, validate.safeInteger)).toBe(43);
});

test("negative small integer", () => {
  expect(validate(-82, validate.safeInteger)).toBe(-82);
});

test("MAX_SAFE_INTEGER", () => {
  expect(validate(Number.MAX_SAFE_INTEGER, validate.safeInteger)).toBe(Number.MAX_SAFE_INTEGER);
});

test("MIN_SAFE_INTEGER", () => {
  expect(validate(Number.MIN_SAFE_INTEGER, validate.safeInteger)).toBe(Number.MIN_SAFE_INTEGER);
});

test("MAX_SAFE_INTEGER + 1", () => {
  expect(() => validate(Number.MAX_SAFE_INTEGER + 1, validate.safeInteger))
    .toThrow(new validate.ValidationError(["body"], validate.safeInteger, Number.MAX_SAFE_INTEGER));
});

test("MIN_SAFE_INTEGER - 1", () => {
  expect(() => validate(Number.MIN_SAFE_INTEGER - 1, validate.safeInteger))
    .toThrow(new validate.ValidationError(["body"], validate.safeInteger, Number.MIN_SAFE_INTEGER));
});
