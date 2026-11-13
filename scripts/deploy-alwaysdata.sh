#!/bin/bash
set -euo pipefail

# Deploy to alwaysdata without running `npm ci` on the shared host.
# alwaysdata kills npm installs above the account memory limit, so the
# production dependency tree is assembled locally and uploaded as a bundle.
#
# Usage:
#   ALWAYSDATA_REMOTE=pismo@ssh-pismo.alwaysdata.net ./scripts/deploy-alwaysdata.sh
#
# The remote ~/cutaway/.env must contain DATABASE_URL (see README).

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR" || exit 1

REMOTE="${ALWAYSDATA_REMOTE:-pismo@ssh-pismo.alwaysdata.net}"
REMOTE_DIR="${ALWAYSDATA_DIR:-cutaway}"
BUNDLE="$(mktemp -d)"
trap 'rm -rf "$BUNDLE"' EXIT

echo "📦 Собираем приложение..."
npm ci --no-audit --no-fund
npm run build

echo "📦 Готовим production-зависимости..."
cp package.json package-lock.json "$BUNDLE/"
(
    cd "$BUNDLE"
    npm ci --omit=dev --no-audit --no-fund
)
cp -a dist prisma prisma.config.ts tsconfig.json package.json package-lock.json "$BUNDLE/"

echo "🗜️  Упаковываем..."
tar -czf "$BUNDLE/cutaway-deploy.tgz" -C "$BUNDLE" \
    node_modules dist prisma prisma.config.ts package.json package-lock.json tsconfig.json

echo "🚚 Загружаем на $REMOTE..."
scp "$BUNDLE/cutaway-deploy.tgz" "$REMOTE:cutaway-deploy.tgz"

echo "🚀 Раскладываем и обновляем базу..."
ssh "$REMOTE" "set -e
cd ~/$REMOTE_DIR
rm -rf node_modules dist
tar -xzf ~/cutaway-deploy.tgz
rm -f ~/cutaway-deploy.tgz
./node_modules/.bin/prisma migrate deploy
node dist/seed/run-seed.js"

echo "✅ Готово."
