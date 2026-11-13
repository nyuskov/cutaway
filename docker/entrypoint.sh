#!/bin/sh
set -eu

echo "Applying database migrations..."
./node_modules/.bin/prisma migrate deploy

echo "Seeding the business card..."
node dist/seed/run-seed.js

echo "Starting the API..."
exec node dist/main.js
