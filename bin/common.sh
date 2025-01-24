#!/usr/bin/env bash

# Validate that PLATFORM is either 'chrome' or 'firefox'
validate_platform() {
    local platform=$1
    if [[ ! $platform =~ ^(chrome|firefox)$ ]]; then
        echo "Invalid platform: $platform"
        echo "Platform should be either chrome or firefox"
        exit 1
    fi
}

# Generate manifest.json from platform-specific template
generate_manifest() {
    local platform=$1
    local version=${2:-0.0.0}

    cat "src/manifest-$platform.json" \
        | jq --arg version "$version" '.version = $version' \
        > src/manifest.json
}
