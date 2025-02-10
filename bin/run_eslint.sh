#!/usr/bin/env bash

set -euo pipefail
IFS=$'\n\t'

# -v mount under same path as on host to make the paths used by arc lint work.
docker run \
    --rm \
    -v $(pwd):/app:delegated \
    -v /app/node_modules \
    sce_webpack:latest \
    npx eslint "$@"
