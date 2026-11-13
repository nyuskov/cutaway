#!/bin/bash
set -euo pipefail

# Local development without the app container: PostgreSQL stays in Docker,
# NestJS runs on the host with hot reload.
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR" || exit 1

APP_PORT="${APP_PORT:-3001}"

cleanup() {
    echo ""
    echo "🛑 Останавливаем приложение..."
    [ -n "${APP_PID:-}" ] && kill "$APP_PID" 2>/dev/null || true
    wait 2>/dev/null || true
    echo "✅ Приложение остановлено. PostgreSQL оставлен запущенным: docker compose stop db"
}

trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM

fail() {
    echo "❌ $1"
    exit 1
}

command -v node >/dev/null 2>&1 || fail "Не найден Node.js 22.18+."
command -v npm >/dev/null 2>&1 || fail "Не найден npm."
command -v docker >/dev/null 2>&1 || fail "Не найден Docker (нужен для PostgreSQL)."
docker compose version >/dev/null 2>&1 || fail "Не найден Docker Compose v2."

if ! node -e 'const [major, minor] = process.versions.node.split(".").map(Number); process.exit(major > 22 || (major === 22 && minor >= 18) ? 0 : 1)'; then
    fail "Нужен Node.js 22.18+, установлен $(node -v)."
fi

if command -v ss >/dev/null 2>&1 && ss -tln | grep -qE "[:.]${APP_PORT}[[:space:]]"; then
    fail "Порт $APP_PORT уже занят. Освободите его или запустите: APP_PORT=3001 ./dev-local.sh"
fi

echo "🐘 Поднимаем PostgreSQL..."
docker compose up -d --wait db

[ -f .env ] || cp .env.example .env

if [ ! -d node_modules ]; then
    echo "📦 Устанавливаем зависимости..."
    npm ci
fi

echo "🔧 Генерируем Prisma Client..."
npm run prisma:generate >/dev/null

echo "🗄️ Миграции и сид..."
npm run db:migrate
npm run db:seed

echo ""
echo "🌐 Apollo Sandbox: http://localhost:$APP_PORT/graphql"
echo "❤️  Healthcheck:    http://localhost:$APP_PORT/health"
echo "💡 Ctrl+C останавливает приложение; база остаётся в контейнере db."
echo "--------------------------------------------------------------------------------"

PORT="$APP_PORT" npm run start:dev &
APP_PID=$!
wait "$APP_PID"
