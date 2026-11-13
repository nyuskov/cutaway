#!/bin/bash
set -euo pipefail

# Run everything from the project directory, wherever the script is called from.
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR" || exit 1

APP_URL="http://localhost:3001"
GRAPHQL_URL="$APP_URL/graphql"

cleanup() {
    echo ""
    echo "🛑 Останавливаем контейнеры..."
    docker compose down
    echo "✅ Остановлено. Данные PostgreSQL остались в volume cutaway_pgdata."
    exit 0
}

trap cleanup SIGINT SIGTERM

if ! command -v docker >/dev/null 2>&1; then
    echo "❌ Docker не найден. Установите Docker Engine и повторите."
    exit 1
fi

if ! docker compose version >/dev/null 2>&1; then
    echo "❌ Не найден Docker Compose v2 (команда 'docker compose')."
    exit 1
fi

echo "🚀 Поднимаем стек: PostgreSQL + NestJS (GraphQL, Prisma)..."

docker compose up -d --build --remove-orphans

wait_for() {
    local name="$1"
    local url="$2"
    local attempts="$3"

    echo "⏳ Ждём $name ($url)..."

    for ((i = 1; i <= attempts; i++)); do
        if curl -fsS "$url" >/dev/null 2>&1; then
            echo "✅ $name готов: $url"
            return 0
        fi

        if [ "$i" -eq "$attempts" ]; then
            echo "⚠️ $name не ответил за ${attempts} с, смотрите логи ниже."
            docker compose logs --tail=80 app
            return 1
        fi

        sleep 1
    done
}

if command -v curl >/dev/null 2>&1; then
    if ! wait_for "API" "$APP_URL/health" 180; then
        exit 1
    fi
else
    echo "⚠️ curl не найден — пропускаю проверку готовности."
fi

echo ""
echo "🌐 Apollo Sandbox: $GRAPHQL_URL"
echo "🔌 GraphQL API:    $GRAPHQL_URL"
echo "❤️  Healthcheck:    $APP_URL/health"
echo "🐘 PostgreSQL:     localhost:5434 (cutaway / cutaway)"
echo ""
echo "💡 Миграции и сид выполняются контейнером app автоматически при каждом старте."
echo "🛑 Ctrl+C останавливает контейнеры, данные БД сохраняются."
echo "--------------------------------------------------------------------------------"

docker compose logs -f app
