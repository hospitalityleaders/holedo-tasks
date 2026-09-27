type DatabaseEnvironment = Partial<
  Record<
    | "POSTGRES_URL"
    | "DB_HOST"
    | "DB_PORT"
    | "DB_NAME"
    | "DB_USER"
    | "DB_PASSWORD"
    | "DB_SSL"
    | "DB_SSL_REJECT_UNAUTHORIZED",
    string
  >
>;

const isTrue = (value: string | undefined) => value?.toLowerCase() === "true";

export const resolvePostgresUrl = (
  environment: DatabaseEnvironment = process.env as DatabaseEnvironment,
): string | undefined => {
  if (environment.POSTGRES_URL) return environment.POSTGRES_URL;

  const { DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD } = environment;
  if (!DB_HOST || !DB_PORT || !DB_NAME || !DB_USER || !DB_PASSWORD) {
    return undefined;
  }

  const credentials = `${encodeURIComponent(DB_USER)}:${encodeURIComponent(DB_PASSWORD)}`;
  const database = encodeURIComponent(DB_NAME);
  const sslMode = isTrue(environment.DB_SSL)
    ? environment.DB_SSL_REJECT_UNAUTHORIZED?.toLowerCase() === "false"
      ? "?sslmode=no-verify"
      : "?sslmode=verify-full"
    : "";

  return `postgresql://${credentials}@${DB_HOST}:${DB_PORT}/${database}${sslMode}`;
};
