import Elysia, { t } from "elysia";
import cors from "@elysiajs/cors";
import { html } from "@elysiajs/html";
import { eq } from "drizzle-orm";

import { httpResponse } from "./@warcayac/const-elysia";
import wlogger from "./@warcayac/wlogger";

import { TTodo, db, tbTodos } from "./db";


export const app = new Elysia();

app
  .use(html())
  .use(cors({methods: '*'}))
  .use(wlogger(true))
  .get('/', ({html}) => html(
    <BaseHtml>
      <body 
        class="flex w-full h-screen justify-center items-center"
        hx-get="/todos"
        hx-trigger="load"
        hx-swap="innerHTML"
      >
      </body>
    </BaseHtml>
  ))
  .get('/public/style.css', () => Bun.file('public/style.css'))
  // .get('/public/htmx.js', () => Bun.file('node_modules/htmx.org/dist/htmx.min.js'))
  .post('/clicked', ({html}) => html(
    <div class="text-blue-600">
      I'm from the server!
    </div>
  ))
  .get('/todos', async ({html}) => {
    const data = await db.select().from(tbTodos).all();
    return html(<TodoList todos={data} />)
  })
  .post(
    '/todos/toggle/:id', 
    async ({html, params: {id}}) => {
      const oldTodo = await db
        .select()
        .from(tbTodos)
        .where(eq(tbTodos.id, id))
        .get()
      ;
      const newTodo = !oldTodo
        ? undefined
        : await db
          .update(tbTodos)
          .set({completed: !oldTodo.completed})
          .where(eq(tbTodos.id, id))
          .returning()
          .get()
        ;
      
      if (newTodo) return html(<TodoItem {...newTodo}/>);
    },
    {
      params: t.Object({
        id: t.Numeric(),
      })
    }
  )
  .delete(
    '/todos/:id',
    async ({html, params: {id}}) => {
      await db.delete(tbTodos).where(eq(tbTodos.id, id)).run();
      return html('');
    },
    {
      params: t.Object({
        id: t.Numeric(),
      })
    }
  )
  .post(
    '/todos',
    async ({html, body}) => {
      const newTodo = await db
        .insert(tbTodos)
        .values(body)
        .returning()
        .get()
      ;
      return html(<TodoItem {...newTodo}/>);
    },
    {
      body: t.Object({
        content: t.String({minLength: 3}),
      })
    }
  )
  .all('*', () => httpResponse[404]('Path name not found'))
  .listen(
    process.env.PORT || 3001,
    () => console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`)
  )
;

function BaseHtml({ children }: { children: JSX.Element }) {
  return (
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />

      <script src="https://unpkg.com/htmx.org@1.9.10" integrity="sha384-D1Kt99CQMDuVetoL1lrYwg5t+9QdHe7NLX/SoJYkXDFfX37iInKRy5xLSi8nO7UC" crossorigin="anonymous"></script>
      <script src="https://unpkg.com/hyperscript.org@0.9.12"></script>

      <link href="public/style.css" rel="stylesheet" type="text/css" />

      <title>The BETH Stack</title>
    </head>

    {children}
  </html>
  );
}

// Código suprimido después de crear una base de datos persistente
/*
type Todo = { 
  id: number, 
  content: string, 
  completed: boolean 
};

const db: Todo[] = [
  { id: 1, content: 'learn the beth stack', completed: true },
  { id: 2, content: 'learn vim', completed: false },
];

let lastID = 2;
*/

function TodoItem({ content, completed, id }: TTodo) {
  return (
    <div class="flex flex-row space-x-3">
      <p>{content}</p>
      <input 
        type="checkbox" 
        checked={completed} 
        hx-post={`/todos/toggle/${id}`}
        hx-target="closest div"
        hx-swap="outerHTML"
      />
      <button 
        class="text-red-500"
        hx-delete={`/todos/${id}`}
        hx-target="closest div"
        hx-swap="outerHTML"
      >X</button>
    </div>
  );
}

function TodoList({todos}: {todos: TTodo[]}) {
  return (
    <div>
      { todos.map(todo => <TodoItem {...todo} />) }
      <TodoForm />
    </div>
  );
}

// see: https://hyperscript.org/docs/#introduction
function TodoForm() {
  return (
    <form 
      class="flex flex-row space-x-3"
      hx-post="/todos"
      hx-swap="beforebegin"
      _="on submit target.reset()"
    >
      <input type="text" name="content" class="border border-black"/>
      <button type="submit">Add</button>
    </form>
  )
}