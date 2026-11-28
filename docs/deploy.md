# Deploying to Kamal

No host name, address, port, account or secret belongs in this file or anywhere else in the repo.
Every real value lives in `.env` (see `.env.example` for the key names); `bin/k` loads it.

## What gets built

- One image, built for arm64. Bun builds and Bun runs the server.
- `SITE_URL` (the FINAL domain, from `DEPLOY_SITE_URL`) and `STAGING_ORIGIN` (from
  `DEPLOY_STAGING_ORIGIN`) are build arguments, because EmDash bakes them in. So is the uploads path.
- The build gets no database setting. The container reads `PGHOST`, `PGPORT`, `PGUSER`,
  `PGPASSWORD` and `PGDATABASE` at run time, as Kamal secrets (`.kamal/secrets` maps them from `.env`, so they stay out of `kamal config` output and the deploy logs). In `.env` they are `DEPLOY_PGHOST` and so on: the prefix keeps them out of local
  runs, because Bun loads `.env` into every command and a bare `PGHOST` would point tests at the shared server. `config/deploy.yml` sets `PGSSLMODE=disable`: the link is
  the private encrypted tailnet.
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

## First deploy: staging is the site URL for now

`DEPLOY_SITE_URL`, `DEPLOY_STAGING_ORIGIN` and `PROXY_HOST` all name the staging host for now, so
passkeys bind to it. At cutover (ticket 08) the site URL moves to the final domain with EmDash's
Change domain flow, and the admin registers a passkey again there.

There is no throwaway host. The staging name's DNS record exists before the container does, and
EmDash's setup wizard lets whoever reaches it first create the admin. The staging name is already
public, so the only protection is a short window: do steps 1 to 4 in one sitting, with the passkey
device at hand. A Cloudflare Access rule on `/_emdash/*` closes the window completely if you want one.

1. `.env` has `EMDASH_FIRST_MIGRATE=1`, `EMDASH_TOKEN` empty, and `bun run deploy:check` passes.
2. `bin/k setup`. The container starts and the window opens.
3. Open `https://<staging host>/_emdash/admin`, finish the setup wizard, register a passkey, then
   create an API token (Settings, API tokens). Put it in `.env` as `EMDASH_TOKEN`, with
   `EMDASH_URL=https://<staging host>`.
4. `bun run check:admin`. Setup must be complete and exactly one admin must exist. Do not continue
   if it fails.
5. Copy the fingerprint the first run printed into `EMDASH_EXPECTED_FINGERPRINT` in `.env`, remove
   `EMDASH_FIRST_MIGRATE`, and run `bin/k deploy`.
6. Write or paste content in the admin.

## Run the image locally against the compose Postgres

```sh
docker compose up -d --wait
docker build --build-arg SITE_URL=http://localhost:3000 -t heyfirst-local .
docker run --rm -p 127.0.0.1:3000:3000 --network <compose project>_default \
  -v heyfirst-local-uploads:/data/uploads \
  -e PGHOST=postgres -e PGUSER=ci -e PGPASSWORD=ci -e PGDATABASE=ci heyfirst-local
```
