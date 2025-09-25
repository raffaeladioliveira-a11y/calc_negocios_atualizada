#!/usr/bin/env sh
set -e

echo "⏳ Aguardando banco ${DB_HOST}:${DB_PORT:-3306}..."
until nc -z "$DB_HOST" "${DB_PORT:-3306}"; do
  sleep 1
done
echo "✅ Banco disponível!"

echo "🚀 Rodando migrations..."
npx sequelize-cli db:migrate

# Se quiser seeds iniciais:
# npx sequelize-cli db:seed:all

echo "✅ Migrations ok"
