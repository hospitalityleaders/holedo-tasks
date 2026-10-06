# Holedo Tasks

Holedo Tasks is packaged in the same operational shape as Holedo Office: one
web service, runtime configuration written directly into the Portainer YAML,
and a token-protected administration panel at `/admin`.

## Demo deployment

Use `compose.holedo.production.yml` as the Portainer stack. Like the Office
stack, its database, storage, image and secret settings are written directly
into the YAML. Replace each underscored placeholder inside Portainer's private
YAML editor before deployment. No Portainer stack environment variables are
required.

The public Login and Sign Up Free actions go to Holedo's central account pages;
Tasks does not expose a separate public password form. Until SSO is connected,
an administrator can sign into `/admin` with `ADMIN_TOKEN` and select **Open
demo workspace**. The application creates or reuses the private demo identity
named by `DEMO_USER_EMAIL` without displaying another password. A personal
workspace and a `My Tasks` board with Capture, Next, Waiting and Done are
created automatically for that identity. Public credential registration remains
disabled; the temporary identity can be provisioned only through the protected
admin action.

## UpCloud resources

Tasks can share the existing Holedo managed service instances while remaining
logically isolated from Office data. It does not need NFS, File Storage, Block
Storage, or a writable application volume.

In the existing Managed PostgreSQL service, create:

- logical database `holedo_tasks`
- application user `holedo_tasks`, with its own generated password
- ownership of `holedo_tasks` and its `public` schema granted to that user

The live Tasks database was prepared when the stack was first installed. There
is no second application and no data import in the production stack. Any future
schema change is a release operation, not a continuously running service. Use
the private database hostname and the existing assigned port. Tasks accepts the
same split `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_SSL`
and `DB_SSL_REJECT_UNAUTHORIZED` fields as Office, so the password does not need
URL encoding.

In the existing Managed Object Storage instance at
`https://gdrv6.upcloudobjects.com`, create two private buckets:

- `holedo-tasks-avatars`
- `holedo-tasks-attachments`

Use the separate Object Storage user named `holedo_tasks`, grant it read,
write, list, and delete access to those two buckets, and generate a dedicated
access-key pair. Do not reuse the Office application keys. Keep public network
access to the S3 endpoint enabled so signed image and download URLs work, but do
not make either bucket anonymously readable. The current UI proxies uploads
through Tasks, so bucket CORS is not required for the first deployment.

Replace the underscored database password, S3 access key, S3 secret key,
authentication secret, admin token and admin-session secret directly in
Portainer's copy of the YAML.

The endpoint, storage username and both bucket names are already recorded in
`compose.holedo.production.yml`. Provider-specific addressing and region
defaults are handled inside the application rather than exposed in the stack.

Redis/Valkey is optional for this single-container demo. Without `REDIS_URL`,
rate limiting uses the process's in-memory store. Configure Managed Valkey only
when Tasks is scaled to multiple web replicas.

## Holedo identity / OIDC handoff

The application already uses generic OpenID Connect, so Keycloak is supported
without a Keycloak-specific code path. Tanish only needs to configure:

- `OIDC_CLIENT_ID`
- `OIDC_CLIENT_SECRET`
- `OIDC_DISCOVERY_URL`, for example the realm's well-known discovery URL

Holedo remains the user-facing identity provider. The internal authentication
library stores the secure session and provider relationship while the
application owns its local workspace, board, list and card data. No Office,
profile, calendar or other Holedo business data is read in this version.

After OIDC has been verified, set `NEXT_PUBLIC_ALLOW_CREDENTIALS` to `false` to
disable the temporary administrator demo action. Each authenticated Holedo
member receives a private personal workspace on first sign-in. A member can
also belong to one company workspace, while their personal workspace remains
private.

## Runtime presentation settings

Open `https://tasks.holedo.com/admin/` and enter `ADMIN_TOKEN`. The panel can
change the public page copy, illustration copy, feature cards, navigation,
fonts, independent navigation and hero colours, accent colour, SEO and social
metadata, account destinations, legal labels and URLs, theme presentation and
trusted header/footer code injection without rebuilding the image. It also
provides the temporary demo entry point and company-workspace provisioning.
Settings are stored in PostgreSQL.

## Images

The repository's GitHub workflow publishes
`ghcr.io/hospitalityleaders/holedo-tasks`. Tagged releases publish `latest`;
the default branch publishes `edge`.
