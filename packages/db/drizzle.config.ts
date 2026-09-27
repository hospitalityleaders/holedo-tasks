import { type Config } from "drizzle-kit";

import { resolvePostgresUrl } from "./src/postgres-url";

export default {
  schema: "./src/schema",
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: resolvePostgresUrl() ?? "",
    ssl: process.env.NODE_ENV === "production" ? true : false,
  },
  migrations: {
    prefix: "timestamp",
  },
} satisfies Config;
