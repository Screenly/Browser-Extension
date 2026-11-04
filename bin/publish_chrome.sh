#!/usr/bin/env bash

# Uploads a packaged extension to the Chrome Web Store and submits it for
# review, against API v2. Authentication is an OAuth access token that the
# caller supplies in ACCESS_TOKEN: the workflow has GitHub mint a short-lived
# one for a service account, so there is no long-lived store credential to
# keep. API reference: https://developer.chrome.com/docs/webstore/api
#
#   ACCESS_TOKEN=... PUBLISHER_ID=... EXTENSION_ID=... ./bin/publish_chrome.sh
#
# Set SUBMIT=false to upload without submitting for review, which leaves the
# package in the dashboard as an unsubmitted draft.

set -euo pipefail
IFS=$'\n\t'

: "${ACCESS_TOKEN:?ACCESS_TOKEN is required}"
: "${PUBLISHER_ID:?PUBLISHER_ID is required}"
: "${EXTENSION_ID:?EXTENSION_ID is required}"

PACKAGE=${PACKAGE:-extension.zip}
SUBMIT=${SUBMIT:-true}
UPLOAD_TIMEOUT=${UPLOAD_TIMEOUT:-300}
POLL_INTERVAL=${POLL_INTERVAL:-5}

API="https://chromewebstore.googleapis.com"
ITEM="publishers/$PUBLISHER_ID/items/$EXTENSION_ID"

call() {
    local method=$1 url=$2
    shift 2
    curl \
        --silent --show-error --fail-with-body \
        --request "$method" \
        --header "Authorization: Bearer $ACCESS_TOKEN" \
        "$@" \
        "$url"
}

fail() {
    echo "$1" >&2
    if [[ -n ${2:-} ]]; then
        jq . <<< "$2" >&2 2>/dev/null || echo "$2" >&2
    fi
    exit 1
}

if [[ ! -f $PACKAGE ]]; then
    fail "No package at $PACKAGE."
fi

echo "Uploading $PACKAGE to $EXTENSION_ID..."
if ! response=$(call POST "$API/upload/v2/$ITEM:upload" \
    --header 'X-Goog-Upload-Protocol: raw' \
    --header "X-Goog-Upload-File-Name: $(basename "$PACKAGE")" \
    --header 'Content-Type: application/zip' \
    --data-binary "@$PACKAGE"); then
    fail "The Chrome Web Store rejected the upload." "$response"
fi

state=$(jq -r '.uploadState // "UPLOAD_STATE_UNSPECIFIED"' <<< "$response")

# Larger packages are processed asynchronously, so the upload call can answer
# IN_PROGRESS and leave the real outcome to be read back from the item.
waited=0
while [[ $state == IN_PROGRESS && $waited -lt $UPLOAD_TIMEOUT ]]; do
    sleep "$POLL_INTERVAL"
    waited=$((waited + POLL_INTERVAL))
    if ! status=$(call GET "$API/v2/$ITEM:fetchStatus"); then
        fail "Could not read the item's status back." "$status"
    fi
    state=$(jq -r '.lastAsyncUploadState // "UPLOAD_STATE_UNSPECIFIED"' <<< "$status")
    echo "Upload state after ${waited}s: $state"
done

case $state in
    SUCCEEDED) echo "Upload succeeded." ;;
    IN_PROGRESS) fail "Upload still processing after ${UPLOAD_TIMEOUT}s." "$response" ;;
    *) fail "Upload finished in state $state." "$response" ;;
esac

if [[ $SUBMIT != true ]]; then
    echo "SUBMIT is $SUBMIT, leaving the package as an unsubmitted draft."
    exit 0
fi

echo "Submitting for review..."
if ! response=$(call POST "$API/v2/$ITEM:publish" \
    --header 'Content-Type: application/json' \
    --data '{"publishType":"DEFAULT_PUBLISH"}'); then
    fail "The Chrome Web Store rejected the submission." "$response"
fi

echo "Submitted. Store state: $(jq -r '.state // "unknown"' <<< "$response")"
