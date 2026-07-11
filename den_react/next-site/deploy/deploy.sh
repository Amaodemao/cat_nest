#!/usr/bin/env bash
set -Eeuo pipefail

APP_DIR="${APP_DIR:-/srv/amao-den/app/den_react/next-site}"
ENV_FILE="${ENV_FILE:-/srv/amao-den/shared/.env.production}"
SERVICE_NAME="${SERVICE_NAME:-amao-den}"

cd "$APP_DIR"

git pull --ff-only
command -v pnpm > /dev/null || { echo "pnpm is not available in PATH" >&2; exit 1; }
pnpm install --frozen-lockfile
pnpm lint

set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

sudo systemctl stop "$SERVICE_NAME"
restart_on_error() {
  sudo systemctl start "$SERVICE_NAME" || true
}
trap restart_on_error ERR

# Enable this after the project starts tracking Payload migrations.
if [[ "${RUN_MIGRATIONS:-false}" == "true" ]]; then
  pnpm payload migrate
fi

pnpm build
sudo systemctl start "$SERVICE_NAME"
trap - ERR

sleep 2
curl --fail --silent --show-error http://127.0.0.1:3000/ > /dev/null
sudo systemctl --no-pager --full status "$SERVICE_NAME"
