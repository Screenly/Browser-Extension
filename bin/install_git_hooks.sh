#!/bin/bash

set -e

HOOK_DIR="$(git rev-parse --git-dir)/hooks"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Create pre-commit hook
cat > "${HOOK_DIR}/pre-commit" << 'EOF'
#!/bin/bash

set -e

# Get the root directory of the git repository
ROOT_DIR=$(git rev-parse --show-toplevel)

# Run actionlint check
echo "Running actionlint check..."
"${ROOT_DIR}/bin/run_actionlint.sh"

# Run eslint check
echo "Running eslint check..."
"${ROOT_DIR}/bin/host_eslint.sh"

# If we got here, all checks passed
exit 0
EOF

# Make the hooks executable
chmod +x "${HOOK_DIR}/pre-commit"
chmod +x "${SCRIPT_DIR}/run_actionlint.sh"

echo "Git hooks installed successfully!"
