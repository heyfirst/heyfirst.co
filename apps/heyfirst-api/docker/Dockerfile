FROM node:16-alpine3.15 as builder

WORKDIR /usr/app
RUN npm install -g pnpm

COPY package.json .
COPY pnpm-lock.yaml .
COPY pnpm-workspace.yaml .
COPY turbo.json .

COPY apps/heyfirst-api apps/heyfirst-api/

# install dependencies
RUN pnpm --filter "heyfirst-api" install --frozen-lockfile

# generate prisma-client-js
RUN pnpm --filter "heyfirst-api" run db:generate

# compile ts to js and minify
RUN pnpm --filter "heyfirst-api" run build

# install only prod related dependencies
# https://pnpm.io/cli/prune does not work for monorepo
RUN pnpm recursive exec -- rm -rf ./node_modules
RUN pnpm --filter "heyfirst-api" install --frozen-lockfile --prod

# * ====================
FROM node:16-alpine3.15 as main

WORKDIR /usr/app/

COPY --from=builder /usr/app/node_modules node_modules
COPY --from=builder /usr/app/apps/heyfirst-api/node_modules apps/heyfirst-api/node_modules
COPY --from=builder /usr/app/apps/heyfirst-api/prisma/ apps/heyfirst-api/prisma/
COPY --from=builder /usr/app/apps/heyfirst-api/dist apps/heyfirst-api/dist

ENV NODE_ENV production

CMD ["./apps/heyfirst-api/docker/docker-entrypoint.sh"]

EXPOSE 8080
