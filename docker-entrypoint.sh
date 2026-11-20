#!/bin/sh
set -eu

# One connection string for the tools that want one, built from the PG* variables the app reads.
DATABASE_URL="$(bun -e '
const e = process.env;
const url = new URL("postgres://placeholder");
url.hostname = e.PGHOST;
url.port = e.PGPORT ?? "5432";
url.username = e.PGUSER;
url.password = e.PGPASSWORD;
url.pathname = `/${e.PGDATABASE}`;
if (e.PGSSLMODE) url.searchParams.set("sslmode", e.PGSSLMODE);
process.stdout.write(url.href);
')"
export DATABASE_URL

# The collector key arrives as one secret; the exporter wants it as a header.
if [ -n "${HYPERDX_API_KEY:-}" ]; then
  export OTEL_EXPORTER_OTLP_HEADERS="authorization=${HYPERDX_API_KEY}"
fi

emdash="bun --bun ./node_modules/.bin/emdash"

# The pinned fingerprint is what the operator reviewed; never one read from this same run.
if [ -n "${EMDASH_EXPECTED_FINGERPRINT:-}" ]; then
  $emdash migrate --expected-target-fingerprint "$EMDASH_EXPECTED_FINGERPRINT"
elif [ "${EMDASH_FIRST_MIGRATE:-}" = "1" ]; then
  $emdash migrate --expected-target-fingerprint "$($emdash migrate --check --json 2>/dev/null |
    bun -e 'process.stdout.write(JSON.parse(await Bun.stdin.text()).target.fingerprint)')"
else
  echo "migrate refused: EMDASH_EXPECTED_FINGERPRINT is not set." >&2
  echo "current target fingerprint: $($emdash migrate --check --json 2>/dev/null |
    bun -e 'process.stdout.write(JSON.parse(await Bun.stdin.text()).target.fingerprint)')" >&2
  echo "next step: first deploy only, set EMDASH_FIRST_MIGRATE=1, deploy, then pin the printed fingerprint as EMDASH_EXPECTED_FINGERPRINT and unset EMDASH_FIRST_MIGRATE." >&2
  exit 1
fi
bun scripts/migrate.ts

exec bun --preload ./docker-preload.ts --preload ./src/observability/preload.ts ./dist/server/entry.mjs
