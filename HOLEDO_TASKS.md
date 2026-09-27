# Holedo Tasks

Holedo Tasks is packaged in the same operational shape as Holedo Office: an
immutable web image, a run-once migration image, runtime configuration through
Portainer, and a token-protected presentation panel at `/admin`.

## Demo deployment

Use `compose.holedo.production.yml` as the Portainer stack. Configure these
required stack variables:

- `POSTGRES_URL`: the managed PostgreSQL connection string.
- `BETTER_AUTH_SECRET`: a random secret of at least 32 characters.
- `ADMIN_TOKEN`: the token used to open `/admin`.
- `ADMIN_SESSION_SECRET`: a second random secret used to sign the eight-hour
  admin session cookie.
- `TASKS_IMAGE_TAG`: optional; defaults to `edge`, the image published from the
  default branch. Change it to `latest` after the first tagged release.

The supplied demo configuration enables email-and-password accounts and turns
email delivery off. Visit `/signup` once to create the demonstration user. A
personal workspace and a `My Tasks` board with Capture, Next, Waiting and Done
are created automatically for every new identity.

## UpCloud resources

Tasks can share the existing Holedo managed service instances while remaining
logically isolated from Office data. It does not need NFS, File Storage, Block
Storage, or a writable application volume.

In the existing Managed PostgreSQL service, create:

- logical database `holedo_tasks`
- application user `holedo_tasks`, with its own generated password
- ownership of `holedo_tasks` and its `public` schema granted to that user

The migration image creates the application tables and enables `uuid-ossp` and
`pg_trgm`; both extensions are supported by UpCloud Managed PostgreSQL. Use the
private database hostname and the existing assigned port. The Portainer value
has this form:

```text
POSTGRES_URL=postgresql://holedo_tasks:<URL-ENCODED-PASSWORD>@holedo-postgresql-production-gympboioheqo.db.upclouddatabases.com:11569/holedo_tasks?sslmode=require
```

In the existing Managed Object Storage instance at
`https://gdrv6.upcloudobjects.com`, create two private buckets:

- `holedo-tasks-avatars`
- `holedo-tasks-attachments`

Create a separate Object Storage user named `holedo-tasks-app`, grant it read,
write, list, and delete access to those two buckets, and generate a dedicated
access-key pair. Do not reuse the Office application keys. Keep public network
access to the S3 endpoint enabled so signed image and download URLs work, but do
not make either bucket anonymously readable. The current UI proxies uploads
through Tasks, so bucket CORS is not required for the first deployment.

Add these stack variables in Portainer:

```text
POSTGRES_URL=<the connection URI above>
S3_ACCESS_KEY_ID=<holedo-tasks-app access key>
S3_SECRET_ACCESS_KEY=<holedo-tasks-app secret key>
S3_REGION=<the region shown on the UpCloud Object Storage overview>
```

The endpoint, storage domain, virtual-hosted addressing, and bucket names are
already defaulted in `compose.holedo.production.yml`. They can still be
overridden with `S3_ENDPOINT`, `NEXT_PUBLIC_STORAGE_URL`,
`NEXT_PUBLIC_STORAGE_DOMAIN`, `S3_FORCE_PATH_STYLE`,
`NEXT_PUBLIC_USE_VIRTUAL_HOSTED_URLS`, `NEXT_PUBLIC_AVATAR_BUCKET_NAME`, and
`NEXT_PUBLIC_ATTACHMENTS_BUCKET_NAME` if the UpCloud instance changes.

Redis/Valkey is optional for this single-container demo. Without `REDIS_URL`,
rate limiting uses the process's in-memory store. Configure Managed Valkey only
when Tasks is scaled to multiple web replicas.

## Holedo identity / OIDC handoff

The application already uses generic OpenID Connect, so Keycloak is supported
without a Keycloak-specific code path. Tanish only needs to configure:

- `OIDC_CLIENT_ID`
- `OIDC_CLIENT_SECRET`
- `OIDC_DISCOVERY_URL`, for example the realm's well-known discovery URL

The login screen presents the configured provider as **Holedo**. Better Auth
stores the provider account relationship while the application owns its local
workspace, board, list and card data. No Office, profile, calendar or other
Holedo business data is read in this version.

After OIDC has been verified, set `NEXT_PUBLIC_ALLOW_CREDENTIALS` to `false`
in the stack to remove password access. Leave `NEXT_PUBLIC_DISABLE_SIGN_UP` as
`false` if any authenticated Holedo member may create their Tasks account on
first sign-in. Set it to `true` only if new accounts must be invitation-only.

## Runtime presentation settings

Open `https://tasks.holedo.com/admin/` and enter `ADMIN_TOKEN`. The panel can
change the public headline and subline, Holedo navigation, SEO copy, login and
sign-up destinations, and legal links without rebuilding the image. Settings
are stored in PostgreSQL and the public page refreshes them on a short cache.

## Images

The repository's existing GitHub workflow publishes both images:

- `ghcr.io/hospitalityleaders/holedo-tasks`
- `ghcr.io/hospitalityleaders/holedo-tasks-migrate`

Tagged releases publish `latest`; the default branch publishes `edge`.
