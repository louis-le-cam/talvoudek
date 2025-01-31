/**
 * Key for attaching metadata on custom validator functions for displaying purposes
 *
 * The value at that key should be a {@link validate.CustomMetadata},
 * if not, it will be ignored
 *
 * @example
 * const customValidator = Object.assign(
 *   (value: unknown, path: (string | number)[]): string => {
 *     if (typeof value !== "string" || value.length < 8) {
 *       throw new validate.Error(path, customValidator, value);
 *     }
 * 
 *     return value;
 *   },
 *   { [validate.customMetadataSymbol]: new validate.CustomMetadata("customValidator") }
 * );
 */
validate.customMetadataSymbol = Symbol();

/**
 * Class for attaching metadata on custom validator functions for displaying purposes
 *
 * This value should be attached with the {@link validate.CustomMetadataSymbol} symbol
 *
 * @example
 * const customValidator = Object.assign(
 *   (value: unknown, path: (string | number)[]): string => {
 *     if (typeof value !== "string" || value.length < 8) {
 *       throw new validate.Error(path, customValidator, value);
 *     }
 * 
 *     return value;
 *   },
 *   { [validate.customMetadataSymbol]: new validate.CustomMetadata("customValidator") }
 * );
 */
validate.CustomMetadata = class {
  public readonly name: string;
  public readonly schemas?: Schema[];
  public readonly separator: string;

  constructor(name: string = "custom_validator", schemas?: Schema[], separator: string = ", ") {
    this.name = name;
    this.schemas = schemas;
    this.separator = separator;
  }
}

/**
 * Validate data with unknown type against a schema
 *
 * The {@link validate.Error} thrown is safe to display in most case,
 * see {@link validate.Error} or more informations
 *
 * For a list of all possible schema kind, see {@link Schema}
 *
 * @throws {validate.Error} If a value doesn't match the schema
 *
 * @example
 * function createUserRoute(req: Request, res: Response) {
 *   const body = validate(req.body, {
 *     name: String;
 *     role: validate.either("user", "admin"),
 *     age: validate.safeInteger,
 *     coordinates: [Number, Number],
 *   });
 * }
 */
export default function validate<S extends Schema>(
  value: unknown,
  schema: S,
  path: (string | number)[] = ["body"]
): SchemaToValue<S> {
  if (schema === undefined) {
    if (value !== undefined) {
      throw new validate.Error(path, schema, value);
    }

    // @ts-ignore
    return undefined;
  } else if (schema === null) {
    if (value !== null) {
      throw new validate.Error(path, schema, value);
    }

    // @ts-ignore
    return null;
  } else if (typeof schema === "boolean") {
    // @ts-ignore
    if (value !== schema) {
      throw new validate.Error(path, schema, value);
    }

    // @ts-ignore
    return value;
  } else if (typeof schema === "number") {
    // @ts-ignore
    if (value !== schema) {
      throw new validate.Error(path, schema, value);
    }

    // @ts-ignore
    return value;
  } else if (typeof schema === "string") {
    // @ts-ignore
    if (value !== schema) {
      throw new validate.Error(path, schema, value);
    }

    // @ts-ignore
    return value;
    // @ts-ignore
  } else if (schema === Boolean) {
    if (typeof value !== "boolean") {
      throw new validate.Error(path, schema, value);
    }

    // @ts-ignore
    return value;
    // @ts-ignore
  } else if (schema === Number) {
    if (typeof value !== "number") {
      throw new validate.Error(path, schema, value);
    }

    // @ts-ignore
    return value;
    // @ts-ignore
  } else if (schema === String) {
    if (typeof value !== "string") {
      throw new validate.Error(path, schema, value);
    }

    // @ts-ignore
    return value;
  } else if (Array.isArray(schema) && schema.length === 1) {
    if (!Array.isArray(value)) {
      throw new validate.Error(path, schema, value);
    }

    // @ts-ignore
    return value.map((value, i) => validate(value, schema[0], [...path, i]));
  } else if (Array.isArray(schema)) {
    if (!Array.isArray(value) || schema.length !== value.length) {
      throw new validate.Error(path, schema, value);
    }

    // @ts-ignore
    return value.map((value, i) => validate(value, schema[i], [...path, i]));
  } else if (typeof schema === "object") {
    if (typeof value !== "object" || Array.isArray(value) || value === null) {
      throw new validate.Error(path, schema, value);
    }

    for (const field in schema) {
      if (!(field in value)) {
        throw new validate.Error([...path, field], schema[field], undefined);
      }
    }

    // @ts-ignore
    return Object.fromEntries(Object.entries(value).map(([key, value]) => [key, validate(value, schema[key], [...path, key])]));
  } else if (typeof schema === "function") {
    return schema(value, path);
  } else {
    throw new Error("invalid schema");
  }
}

validate.either = function either<S extends Schema[]>(...schemas: S): (value: unknown, path: (string | number)[]) => TupleToUnion<{ [K in keyof S]: SchemaToValue<S[K]> }> {
  const handler = Object.assign(
    (value: unknown, path: (string | number)[]) => {
      for (const schema of schemas) {
        try {
          return validate(value, schema, path);
        } catch (err) {
          if (!(err instanceof validate.Error)) {
            throw err;
          }
        }
      }

      throw new validate.Error(path, handler, value);
    },
    { [validate.customMetadataSymbol]: new validate.CustomMetadata("either", schemas, " | ") },
  );

  return handler;
};

/**
 * @deprecated currently this function may produce invalid behaviour
 * if you use objects directly in it because of object intersection,
 * there are also other theoretical problems making it not type-safe
 *
 * If you still want to use a feature similar in a safer way,
 * you can use custom function to validate a value manually,
 * see {@link Schema} for an example of a custom validator
 */
validate.all = <S extends Schema[]>(...schemas: S): (value: unknown, path: (string | number)[]) => TupleToIntersection<{ [K in keyof S]: SchemaToValue<S[K]> }> => {
  const handler = Object.assign(
    (value: unknown, path: (string | number)[]) => {
      for (const schema of schemas) {
        value = validate(value, schema, path);
      }

      return value as TupleToIntersection<{ [K in keyof S]: SchemaToValue<S[K]> }>;
    },
    { [validate.customMetadataSymbol]: new validate.CustomMetadata("all", schemas, " & ") },
  );

  return handler;
};

/**
 * Validate a number that is an integer in the safe integer range,
 * see {@link Number.isSafeInteger} for more information on safe integers
 *
 * @example
 * validate(4, validate.safeInteger); // Ok
 * validate(4.5, validate.safeInteger); // Error
 * validate(Number.MAX_SAFE_INTEGER + 1, validate.safeInteger); // Error
 * validate(-242889244, validate.safeInteger); // Ok
 */
validate.safeInteger = Object.assign(
  (value: unknown, path: (string | number)[]): number => {
    if (typeof value === "number" && Number.isSafeInteger(value)) {
      return value;
    } else {
      throw new validate.Error(path, validate.safeInteger, value);
    }
  },
  { [validate.customMetadataSymbol]: new validate.CustomMetadata("safeInteger") },
);

/**
 * Format a field path into a string displayable to end-users
 *
 * The result of this function should be safe to display as long as the field names and indices of the value
 * or the schema don't contain sensitive informations (they should not)
 *
 * A path like `["body", "example_array", 8, "example_field"]`
 * will be formatted as `body.example_array[8].example_field`
 */
validate.prettyPath = function prettyPath(path: (string | number)[]): string {
  return path.map((segment, i) =>
    typeof segment === "number" ? `[${segment}]` : `${i === 0 ? "" : "."}${segment}`
  ).join("");
};

/**
 * Format a {@link Schema} into a string displayable to end-users
 *
 * The result of this function should be safe to display as long as you're schema
 * doesn't contains sensitive data in explicit literals (it should not)
 *
 * The {@link identation} field is the base number of spaces used when going to a newline
 * The {@link identationIncrement} field is the number added to {@link identation} for each nesting levels
 */
validate.prettySchema = function prettySchema(schema: Schema, identationIncrement: number = 2, identation: number = 0): string {
  if (schema === undefined) {
    return "undefined";
  } else if (schema === null) {
    return "null";
  } else if (typeof schema === "boolean") {
    return `${schema}`;
  } else if (typeof schema === "number") {
    return `${schema}`;
  } else if (typeof schema === "string") {
    return `"${schema}"`;
  } else if (schema === Boolean) {
    return "boolean";
  } else if (schema === Number) {
    return "number";
  } else if (schema === String) {
    return "string";
  } else if (Array.isArray(schema) && schema.length === 1) {
    return `${prettySchema(schema[0], identationIncrement, identation)}[]`;
  } else if (Array.isArray(schema)) {
    return `[${schema.map(schema => prettySchema(schema, identationIncrement, identation)).join(", ")}]`;
  } else if (typeof schema === "object") {
    const entries = Object.entries(schema);
    if (entries.length === 0) {
      return "{}";
    }

    return `{\n${entries.map(([field, schema]) =>
      `${" ".repeat(identation + identationIncrement)}${field}: ${prettySchema(schema, identationIncrement, identation + identationIncrement)
      },\n`
    ).join("")}${" ".repeat(identation)}}`;
  } else if (typeof schema === "function") {
    if (validate.customMetadataSymbol in schema) {
      // @ts-ignore: why you can't get by symbols in typescript ???
      const metadata = schema[validate.customMetadataSymbol];

      if (metadata instanceof validate.CustomMetadata) {
        return `${metadata.name}${metadata.schemas === undefined ? "" : `(${metadata.schemas
          .map(schema => prettySchema(schema, identationIncrement, identation))
          .join(metadata.separator)
        })`}`;
      }
    }

    return "custom_validator"
  } else {
    return "unknown";
  }
};

/**
 * Error thrown when a value being validated doesn't match the schema
 *
 * The {@link message} of the parent class {@link Error} should be safe to display to an end-user
 * as long as you as you're schema doesn't contains sensitive data in explicit literals (it should not)
 * or that the path of a value or the schema could contains sensitive informations (they should not)
 */
validate.Error = class extends Error {
  /**
   * The path of the field that was mismatched
   *
   * {@link number} elements represent array indexing
   *
   * {@link string} elements represent field accessing
   *
   * This field should be safe to display as long as the fields names and indices of the value
   * or the schema don't contain sensitive informations (they should not)
   */
  public readonly path: (string | number)[];
  /**
   * The path of the field that was mismatched formatted using {@link validate.prettyPath} function.
   *
   * This field should be safe to display as long as the fields names and indices of the value
   * or the schema don't contain sensitive informations (they should not)
   *
   * A path like `["body", "example_array", 8, "example_field"]`
   * will be formatted as `body.example_array[8].example_field`
   */
  public readonly prettyPath: string;
  /**
   * Schema expected for this field
   *
   * This field is safe to display to an end-user as long as you're schema doesn't contains
   * sensitive data in explicit literals (it should not)
   *
   * If you want to display it you may want to use {@link prettySchema} field
   * or {@link validate.prettySchema} function
   */
  public readonly schema: Schema;
  /**
   * Schema expected for the field, formatted using {@link validate.prettySchema} function.
   *
   * This field is safe to display to an end-user as long as you're schema doesn't contains
   * sensitive data in explicit literals (it should not)
   *
   * It is formatted with a base identation of 2 and an identation increment of 2.
   * If you want other identation rules, you can use {@link validate.prettySchema} directly with the field {@link schema}.
   */
  public readonly prettySchema: string;
  /**
   * Type of the unexpected value found
   *
   * This field should be safe to display to an end-user as the type is narrowed down to primitives
   */
  public readonly valueType: "unknown" | "object" | "array" | "string" | "number" | "boolean" | "null" | "undefined";

  /**
   * Creates a {@link validate.Error} based the path of the mismatched value,
   * the expected schema of that value, and the value that was found
   *
   * The error is safe to display to end-user even if the value contains
   * sensitive informations as the only thing taken out of the value is a
   * narrowed type stored in {@link valueType} field
   */
  constructor(path: (string | number)[], schema: Schema, value: unknown) {
    let valueType: "unknown" | "object" | "array" | "string" | "number" | "boolean" | "null" | "undefined";
    if (value === undefined) {
      valueType = "undefined";
    } else if (value === null) {
      valueType = "null";
    } else if (typeof value === "boolean") {
      valueType = "boolean";
    } else if (typeof value === "number") {
      valueType = "number";
    } else if (typeof value === "string") {
      valueType = "string";
    } else if (Array.isArray(value)) {
      valueType = "array";
    } else if (typeof value === "object") {
      valueType = "object";
    } else {
      valueType = "unknown";
    }

    const prettyPath = validate.prettyPath(path);
    const prettySchema = validate.prettySchema(schema, 2, 2);

    super(`validation error on field '${prettyPath}'\n  expected '${prettySchema}'\n  got '${valueType}'`);

    this.path = path;
    this.prettyPath = prettyPath;
    this.schema = schema;
    this.prettySchema = prettySchema;
    this.valueType = valueType;
  }
}

/**
 * Any schema that can be accepted by {@link validate}
 *
 * Note: literals may be forgotten by typescript and converted into their more generic form
 * you can bypass this by wrapping the literal in a {@link validate.either}
 *
 * Schema types:
 * - objects: { [string]: {@link Schema} }
 * - arrays: [{@link Schema}]
 * - tuples: [{@link Schema}, {@link Schema}, ...]
 * - string: {@link String}
 * - number: {@link Number}
 * - boolean: {@link Boolean}
 * - number: {@link Number}
 * - string literal: `"<any_string>"`
 * - number literal: `<any_number>`
 * - boolean literal: `true | false`
 * - null: null
 * - undefined: undefined
 *
 * @example
 * const userList = [{
 *   name: String,
 *   role: validate.either("user", "admin"),
 *   age: validate.safeInteger,
 *   coordinates: [Number, Number],
 *   password: validatePassword,
 * }];
 *
 * // Custom validator function
 * function validatePassword(value: unknown, path: (string | number)[]): string {
 *   if (typeof value !== "string" || value.length < 8) {
 *     throw new validate.Error(path, validatePassword, value);
 *   }
 *
 *   return value;
 * }
 */
type Schema =
  | ((value: any, path: (string | number)[]) => any)
  | { [K in string]: Schema }
  | [Schema]
  | Schema[]
  | StringConstructor
  | NumberConstructor
  | BooleanConstructor
  | string
  | number
  | boolean
  | null
  | undefined;

/**
 * Convert a {@link Schema} into the target value type
 */
type SchemaToValue<S> =
  S extends ((value: unknown, path: (string | number)[]) => infer T) ? T
  : S extends { [K in string]: Schema } ? { [K in keyof S]: SchemaToValue<S[K]> }
  : S extends [Schema] ? SchemaToValue<S[0]>[]
  : S extends [Schema, Schema, ...Schema[]] ? { [K in keyof S]: SchemaToValue<S[K]> }
  : S extends StringConstructor ? string
  : S extends NumberConstructor ? number
  : S extends BooleanConstructor ? boolean
  : S extends string ? S
  : S extends number ? S
  : S extends boolean ? S
  : S extends undefined ? undefined
  : S extends null ? null
  : never;

type TupleToUnion<T> = T extends { [K: number]: unknown } ? T[number] : never;
type TupleToIntersection<T> = {
  [K in keyof T]: (x: T[K]) => void
} extends {
  [K: number]: (x: infer I) => void
} ? I : never
