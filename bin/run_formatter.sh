#!/usr/bin/env bash

set -euo pipefail
IFS=$'\n\t'

MODE="${MODE:-check}"

if [[ ! "$MODE" =~ ^(check|write)$ ]]; then
    echo "Invalid mode: $MODE"
    echo "\$MODE should be either \`check\` or \`write\`"
    exit 1
fi

docker run \
    --rm \
    -v $(pwd):/app:delegated \
    -v /app/node_modules \
    screenly-browser-extension:latest \
    npm run format:${MODE}
