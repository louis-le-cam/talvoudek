# Talvoudek

A simple yet powerful data validation library for being safe manipulating data from the outside

## Examples

With `express.js`

```ts
import validate from "@louis_le_cam/talvoudek";

app.post("/user", (req, res) => {
  const user = validate(req.body, {
    name: String,
    email: String,
    role: validate.either("user", "admin"),
  });

  // insert the user in the database ...
});
```

In tests (with `jest` or others)

```ts
import validate from "@louis_le_cam/talvoudek";

test("function should return object with correct format", () => {
  validate(listUsers(), [{
    name: String,
    email: String,
    role: validate.either("user", "admin"),
  }]);
});
```
