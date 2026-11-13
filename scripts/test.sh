#!/bin/bash
set -euo pipefail

# Runs the whole suite (unit + e2e with coverage) in the test image.
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR" || exit 1

command -v docker >/dev/null 2>&1 || {
    echo "❌ Docker не найден."
    exit 1
}

docker compose version >/dev/null 2>&1 || {
    echo "❌ Не найден Docker Compose v2."
    exit 1
}

echo "🐘 Поднимаем PostgreSQL..."
docker compose up -d --wait db

echo "🗄️ Проверяем тестовую базу cutaway_test..."
if ! docker compose exec -T db psql -U cutaway -d postgres -tAc \
    "SELECT 1 FROM pg_database WHERE datname = 'cutaway_test'" | grep -q 1; then
    docker compose exec -T db createdb -U cutaway cutaway_test
    echo "✅ База cutaway_test создана."
else
    echo "✅ База cutaway_test уже существует."
fi

echo "🧪 Запускаем тесты в контейнере (unit + e2e, coverage)..."
docker compose --profile test run --rm --build test

echo ""
echo "✅ Готово. HTML-отчёт покрытия: coverage/lcov-report/index.html"
