import validate from "../src";

test("expected number or string got number", () => {
  expect(validate(3281.8, validate.either(Number, String))).toBe(3281.8);
});

test("expected number or string got string", () => {
  expect(validate("dhiqzd", validate.either(Number, String))).toBe("dhiqzd");
});


test("expected number or string got null", () => {
  expect(() => validate(null, validate.either(Number, String)))
    .toThrow(new validate.ValidationError(["body"], validate.either(Number, String), null));
});
