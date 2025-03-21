#!/usr/bin/env bash

set -euo pipefail
IFS=$'\n\t'

VERSION=${VERSION:-0.0.0}
PLATFORM=${PLATFORM:-chrome}

source "$(dirname "$0")/common.sh"

validate_platform "$PLATFORM"
generate_manifest "$PLATFORM" "$VERSION"

docker compose down -v
docker compose up --build
