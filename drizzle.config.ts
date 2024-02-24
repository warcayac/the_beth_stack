// see: https://orm.drizzle.team/docs/migrations#create-the-config
// see: https://orm.drizzle.team/learn/tutorials/drizzle-with-db/drizzle-with-db

import type { Config } from 'drizzle-kit';


export default {
  schema: './src/db/schema/index.ts',
  out: 'migrations',
  driver: 'turso', // 'pg' | 'mysql2' | 'better-sqlite' | 'libsql' | 'turso'
  dbCredentials: {
    url: process.env.DATABASE_URL!,
    authToken: process.env.DATABASE_AUTH_TOKEN!,
  },
  verbose: true,
  strict: true,
} satisfies Config;