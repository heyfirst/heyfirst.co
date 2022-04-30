#!/bin/sh
set -e

# Apply database migrations
echo "### Apply database migrations ###"
npx prisma migrate deploy --schema "./apps/heyfirst-api/prisma/schema.prisma"

# Start app
echo "### Starting app ###"
node ./apps/heyfirst-api/dist/index.js
