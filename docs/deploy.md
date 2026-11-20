# Deploying to Kamal

No host name, address, port, account or secret belongs in this file or anywhere else in the repo.
Every real value lives in `.env` (see `.env.example` for the key names); `bin/k` loads it.

## What gets built

- One image, built for arm64. Bun builds and Bun runs the server.
- `SITE_URL` (the FINAL domain, from `DEPLOY_SITE_URL`) and `STAGING_ORIGIN` (from
  `DEPLOY_STAGING_ORIGIN`) are build arguments, because EmDash bakes them in. So is the uploads path.
- The build gets no database setting. The container reads `PGHOST`, `PGPORT`, `PGUSER`,
  `PGPASSWORD`, `PGDATABASE` and `PGSSLMODE` at run time. Use `PGSSLMODE=require` unless the link is
  a private encrypted network.
- The entrypoint runs `emdash migrate` (guarded, see below), then `scripts/migrate.ts` (search), then starts the server.
  The server does not listen until both are done, so `/up` returning 200 means a migrated database.
- Uploads live in the `heyfirst-uploads` volume and survive redeploys.
- The astro build needs about 2 GB of free memory. A Docker VM with 2 GB in total is killed by the
  kernel while it bundles; give the VM 4 GB before `bin/k deploy`.

## Migration guard

The entrypoint passes `--expected-target-fingerprint` from `EMDASH_EXPECTED_FINGERPRINT`, a value you
pinned, never one read from the same run. With it unset the container prints the current fingerprint
and the next step, then exits 1, unless `EMDASH_FIRST_MIGRATE=1`. The first deploy sets
`EMDASH_FIRST_MIGRATE=1`; afterwards copy the fingerprint it printed into `EMDASH_EXPECTED_FINGERPRINT`
in `.env` and remove `EMDASH_FIRST_MIGRATE`. A changed database target then fails the deploy.

`bin/k` exports `GIT_SHA` from `git rev-parse --short HEAD`; `DEPLOYMENT_ENVIRONMENT` comes from
`.env` and defaults to `staging`.

## Checks before any deploy

```sh
bun run env:check     # names every key .env lacks or leaves empty; never prints a value
bun run deploy:check  # the same, then renders the kamal config to /dev/null
```

Never paste the rendered kamal config anywhere.

## First deploy: create the admin before the real name routes

EmDash's setup wizard lets whoever reaches it first create the admin. So the first deploy answers
only to a throwaway name, and that name's certificate is requested only in the same sitting as the
admin creation, so the open window is minutes.

The certificate for the throwaway host is public in certificate-transparency logs the moment it is
issued. Anyone watching those logs can find the host. The unguessable label does not hide it; the
short window does.

1. Do steps 1 to 5 in one sitting. Have the passkey device at hand before you start.
2. In `.env` set `PROXY_HOST` to a throwaway host under the final domain (passkeys bind to the final
   domain, so it must be a subdomain) and `DEPLOY_STAGING_ORIGIN=https://<that host>`. Set
   `EMDASH_FIRST_MIGRATE=1`. Leave `EMDASH_TOKEN` empty. Create the DNS record only now.
3. `bun run deploy:check`, then `bin/k setup`. The certificate is requested here; the window opens.
4. Open `https://<throwaway host>/_emdash/admin`, finish the setup wizard, register a passkey, then
   create an API token. Put it in `.env` as `EMDASH_TOKEN` with `EMDASH_URL=https://<that host>`.
5. Run `bun run check:admin`. It asks the setup status and the user list: setup must be complete and
   exactly one admin must exist. Do not continue if it fails.
6. Only after it passes, switch `PROXY_HOST` and `DEPLOY_STAGING_ORIGIN` to the real staging name,
   point `EMDASH_URL` at it, pin `EMDASH_EXPECTED_FINGERPRINT` from the first run's output, remove
   `EMDASH_FIRST_MIGRATE`, and run `bin/k deploy`. The image is rebuilt because the origin is a build
   argument. Remove the throwaway DNS record, then `bun run import` and `bun run verify:content`.

## Run the image locally against the compose Postgres

```sh
docker compose up -d --wait
docker build --build-arg SITE_URL=http://localhost:3000 -t heyfirst-local .
docker run --rm -p 127.0.0.1:3000:3000 --network <compose project>_default \
  -v heyfirst-local-uploads:/data/uploads \
  -e PGHOST=postgres -e PGUSER=ci -e PGPASSWORD=ci -e PGDATABASE=ci heyfirst-local
```
