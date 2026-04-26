#!/usr/bin/env sh
set -eu

cd /var/www/html

if [ -z "${APP_KEY:-}" ]; then
  echo "APP_KEY is required."
  exit 1
fi

if [ "${DB_CONNECTION:-}" = "sqlite" ] && [ -n "${DB_DATABASE:-}" ]; then
  case "${DB_DATABASE}" in
    /app/*)
      DB_DATABASE="/var/www/html/${DB_DATABASE#/app/}"
      export DB_DATABASE
      ;;
  esac
  mkdir -p "$(dirname "${DB_DATABASE}")"
  touch "${DB_DATABASE}"
fi

php artisan config:clear >/dev/null 2>&1 || true
php artisan cache:clear >/dev/null 2>&1 || true
php artisan route:clear >/dev/null 2>&1 || true
php artisan view:clear >/dev/null 2>&1 || true

php artisan migrate --force

if [ "${APP_SEED_ON_BOOT:-false}" = "true" ]; then
  php artisan db:seed --force
fi

if [ "${RUN_QUEUE_WORKER:-false}" = "true" ]; then
  exec php artisan queue:work database --tries=1 --timeout="${QUEUE_WORKER_TIMEOUT:-90}" --verbose
fi

if [ "${PORT:-9000}" != "9000" ]; then
  exec php artisan serve --host=0.0.0.0 --port="${PORT}"
fi

exec "$@"
