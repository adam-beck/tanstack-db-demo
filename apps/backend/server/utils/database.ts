import { Kysely } from "kysely";
import { DB } from "kysely-codegen";
import { PostgresJSDialect } from "kysely-postgres-js";
import postgres from "postgres";

export const db = new Kysely<DB>({
  dialect: new PostgresJSDialect({
    postgres: postgres({
      host: process.env.POSTGRES_HOST,
      port: Number(process.env.POSTGRES_PORT),
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      max: 10,
    }),
  }),
});
