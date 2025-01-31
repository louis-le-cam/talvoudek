# Talvoudek

A simple yet powerful data validation library for being safe manipulating data from the outside

## Examples

With `express.js`

```ts
import validate from "talvoudek";

app.post("/user", (req, res) => {
  const user = validate(req.body, {
    name: String,
    email: String,
    role: validate.either("user", "admin"),
  });

  // insert the user in the database ...
});
```
