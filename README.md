# heyfirst.co

First Sutham's blog: [Astro](https://astro.build) on [EmDash](https://github.com/emdash-cms/emdash), running on Bun with Postgres, deployed with [Kamal](https://kamal-deploy.org).

## Develop

```sh
cp .env.example .env     # fill in the keys
bun install
bun run dev
bun run verify           # check, lint, unit, database and HTTP tests
```

`verify` needs a Postgres reachable through `DATABASE_URL`; `compose.yaml` starts one.

## Deploy

`bin/k` wraps Kamal. Every deploy value lives in `.env`; `.env.example` lists the keys. `bun run deploy:check` validates the config.

## License

[MIT](LICENSE)
