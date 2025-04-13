import express from "express";
import supertest from "supertest";
import validate from "../../src";


const todoSchema = {
  userId: validate.safeInteger,
  name: String,
  done: Boolean,
  creationTime: validate.parseDate,
  updateTime: validate.parseDate,
};

interface Todo {
  userId: number,
  name: String,
  done: Boolean,
  creationTime: Date,
  updateTime: Date,
  
}

function defaultTodos(): Todo[] {
  return [
    {
      userId: 0,
      name: "Do homework",
      done: false,
      creationTime: new Date("2009-08-20"),
      updateTime: new Date("2009-08-20"),
    },
    {
      userId: 1,
      name: "Publish feature branch on the git repository",
      done: true,
      creationTime: new Date("2010-07-12"),
      updateTime: new Date("2010-12-23"),
    },
    {
      userId: 0,
      name: "Do dishes",
      done: false,
      creationTime: new Date("2011-11-07"),
      updateTime: new Date("2012-05-18"),
    },
    {
      userId: 1,
      name: "Add tags on github issues",
      done: false,
      creationTime: new Date("2014-06-09"),
      updateTime: new Date("2014-06-09"),
    },
    {
      userId: 0,
      name: "Buy groceries",
      done: true,
      creationTime: new Date("2015-04-23"),
      updateTime: new Date("2019-06-13"),
    },
  ];
}

let todos: (Todo | undefined)[] = [];

const app = express()
  .use(express.json())
  .get("/todo", (_req, res) => {
    res.json(todos);
  })
  .get("/todo/:index", (req, res) => {
    const { index } = validate(req.params, { index: validate.parseSafeInteger }, ["urlParams"]);

    if (todos[index] === undefined) {
      res.sendStatus(404);
    } else {
      res.json(todos[index] ?? null);
    }
  })
  .post("/todo", (req, res) => {
    const index = todos.length;

    const now = new Date();
    todos.push({
      ...validate(req.body, {
        userId: validate.safeInteger,
        name: String,
        done: Boolean,
      }),
      creationTime: now,
      updateTime: now,
    });

    res.status(201).json(index);
  })
  .patch("/todo/index", (req, res) => {
    const patch = validate(req.body, {
      userId: validate.either(undefined, validate.safeInteger),
      name: validate.either(undefined, String),
      done: validate.either(undefined, Boolean),
    });

    const { index } = validate(req.params, { index: validate.parseSafeInteger }, ["urlParams"]);

    const todo = todos[index];
    if (todo === undefined) {
      res.sendStatus(404);
      return;
    }

    todo.updateTime = new Date();
    todo.userId = patch.userId ?? todo.userId;
    todo.name = patch.name ?? todo.name;
    todo.done = patch.done ?? todo.done;

    res.sendStatus(200);
  })
  .delete("/todo", (req, res) => {
    // Ensure the body is not defined so the API consumer doesn't expect behaviour from it.
    validate(req.body, undefined);

    const { index } = validate(req.params, { index: validate.parseSafeInteger }, ["urlParams"]);
    if (todos[index] === undefined) {
      res.sendStatus(404);
    } else {
      todos[index] = undefined;
      res.sendStatus(200);
    }
  });

beforeEach(() => {
  todos = defaultTodos();
});

describe("GET /todo", () => {
  test("List the default todos", async () => {
    const response = await supertest(app).get("/todo");

    expect(response.statusCode).toBe(200);
    console.log(response.body);
    validate(response.body, [
      {
        userId: 0,
        name: "Do homework",
        done: false,
        creationTime: "2009-08-20T00:00:00.000Z",
        updateTime: "2009-08-20T00:00:00.000Z",
      },
      {
        userId: 1,
        name: "Publish feature branch on the git repository",
        done: true,
        creationTime: "2010-07-12T00:00:00.000Z",
        updateTime: "2010-12-23T00:00:00.000Z",
      },
      {
        userId: 0,
        name: "Do dishes",
        done: false,
        creationTime: "2011-11-07T00:00:00.000Z",
        updateTime: "2012-05-18T00:00:00.000Z",
      },
      {
        userId: 1,
        name: "Add tags on github issues",
        done: false,
        creationTime: "2014-06-09T00:00:00.000Z",
        updateTime: "2014-06-09T00:00:00.000Z",
      },
      {
        userId: 0,
        name: "Buy groceries",
        done: true,
        creationTime: "2015-04-23T00:00:00.000Z",
        updateTime: "2019-06-13T00:00:00.000Z",
      },
    ]);
  });
});
