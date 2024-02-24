// See: https://orm.drizzle.team/docs/goodies
// See: https://orm.drizzle.team/docs/sql-schema-declaration

import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";


export const tbTodos = sqliteTable('todos', {
  id: integer('id', {mode:'number'}).primaryKey({autoIncrement: true}),
  content: text('content').notNull(),
  completed: integer('completed', {mode:'boolean'}).notNull().default(false),
});

export type TTodo = typeof tbTodos.$inferSelect;
export type TNewTodo = typeof tbTodos.$inferInsert;
