#!/usr/bin/env bash

# Builds the source archive that accompanies a Firefox submission. AMO requires
# one whenever the shipped code has been bundled or minified, which ours is.
# See SOURCE_BUILD_INSTRUCTIONS.md for what a reviewer does with it.

set -euo pipefail
IFS=$'\n\t'

VERSION=${VERSION:-0.0.0}
REF=${REF:-HEAD}

ARCHIVE="screenly-extension-source-$VERSION.zip"

git archive \
    --format=zip \
    --prefix="screenly-extension-$VERSION/" \
    --output "$ARCHIVE" \
    "$REF"

echo "$ARCHIVE"
