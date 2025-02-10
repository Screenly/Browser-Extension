#!/bin/bash

set -euo pipefail

# Run actionlint on the workflows directory
docker run --rm -v $(pwd):/repo --workdir /repo rhysd/actionlint:latest -color
