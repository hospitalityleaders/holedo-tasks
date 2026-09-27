import { describe, expect, it } from "vitest";

import { resolvePostgresUrl } from "./postgres-url";

describe("resolvePostgresUrl", () => {
  it("prefers an explicit PostgreSQL URL", () => {
    expect(
      resolvePostgresUrl({ POSTGRES_URL: "postgresql://explicit/database" }),
    ).toBe("postgresql://explicit/database");
  });

  it("builds the Office-style split configuration safely", () => {
    expect(
      resolvePostgresUrl({
        DB_HOST: "database.example.com",
        DB_PORT: "11569",
        DB_NAME: "holedo_tasks",
        DB_USER: "holedo_tasks",
        DB_PASSWORD: "a password/with:symbols",
        DB_SSL: "true",
        DB_SSL_REJECT_UNAUTHORIZED: "false",
      }),
    ).toBe(
      "postgresql://holedo_tasks:a%20password%2Fwith%3Asymbols@database.example.com:11569/holedo_tasks?sslmode=no-verify",
    );
  });

  it("returns undefined when neither configuration is complete", () => {
    expect(resolvePostgresUrl({ DB_HOST: "database.example.com" })).toBeUndefined();
  });
});
