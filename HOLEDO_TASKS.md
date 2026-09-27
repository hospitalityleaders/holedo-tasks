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
- `TASKS_IMAGE_TAG`: optional; defaults to `latest`. Use `edge` when testing a
  build published from the default branch.

The supplied demo configuration enables email-and-password accounts and turns
email delivery off. Visit `/signup` once to create the demonstration user. A
personal workspace and a `My Tasks` board with Capture, Next, Waiting and Done
are created automatically for every new identity.

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
