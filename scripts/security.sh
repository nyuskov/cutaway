#!/bin/bash
set -euo pipefail

# Security checks: dependency audit, secret scan and container hardening.
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR" || exit 1

fail() {
    echo "❌ $1"
    exit 1
}

command -v docker >/dev/null 2>&1 || fail "Docker не найден."
command -v npm >/dev/null 2>&1 || fail "npm не найден."
command -v git >/dev/null 2>&1 || fail "git не найден."

echo "1/4. Аудит production-зависимостей (high/critical)..."
npm audit --omit=dev --audit-level=high

echo ""
echo "2/4. Проверка, что секреты не попали в репозиторий..."
if git ls-files --error-unmatch .env >/dev/null 2>&1; then
    fail ".env отслеживается git — удалите его из индекса: git rm --cached .env"
fi

if git grep --untracked -nE 'BEGIN (RSA|OPENSSH|EC|DSA) PRIVATE KEY|AKIA[0-9A-Z]{16}|ghp_[A-Za-z0-9]{36}' \
    -- . ':!package-lock.json' >/tmp/cutaway-secret-scan.txt 2>/dev/null; then
    cat /tmp/cutaway-secret-scan.txt
    fail "Найдены похожие на секреты строки (см. вывод выше)."
fi

rm -f /tmp/cutaway-secret-scan.txt
echo "✅ .env не отслеживается, секретов в git не найдено."

echo ""
echo "3/4. Проверка контейнера: non-root пользователь и healthcheck..."
docker compose build app >/dev/null

RUN_AS="$(docker compose run --rm --no-deps --entrypoint id app 2>/dev/null || true)"
echo "$RUN_AS"
echo "$RUN_AS" | grep -q 'uid=0' && fail "Контейнер запускается от root."

docker image inspect cutaway-app:latest --format '{{.Config.Healthcheck.Test}}' | grep -q 'health' \
    || fail "В образе не настроен healthcheck."
echo "✅ Контейнер работает от непривилегированного пользователя, healthcheck задан."

echo ""
echo "4/4. Тесты настроек безопасности..."
if [ -d node_modules ]; then
    npm run test:security
else
    echo "⚠️ node_modules отсутствует — пропускаю локальные security-тесты."
    echo "   Установите зависимости: npm ci"
fi

echo ""
echo "✅ Проверка безопасности завершена."
