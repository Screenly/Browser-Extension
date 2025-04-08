#!/usr/bin/env bash

set -euo pipefail

VERSION=${VERSION:-0.0.0}
PLATFORM=${PLATFORM:-chrome}

source "$(dirname "$0")/common.sh"

validate_platform "$PLATFORM"
generate_manifest "$PLATFORM" "$VERSION"

docker compose build

docker run \
    --rm -ti \
    -v $(pwd):/app:delegated \
    -v /app/node_modules \
    sbe_webpack:latest \
    /bin/bash -c "npm test"

