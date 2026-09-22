# Building this extension from source

These are the instructions for reproducing the packaged extension from this
archive. They are written for [AMO source code
review](https://extensionworkshop.com/documentation/publish/source-code-submission/),
which we owe Mozilla because the shipped `popup.bundle.js` is bundled and
minified by webpack and so is not human readable. Everything needed to rebuild
it is in this archive, including the `bun.lock` lockfile.

The same steps work for anyone who wants to check that a published build
matches this source.

## Environment

- Linux or macOS. Our CI builds on `ubuntu-latest`.
- [Bun](https://bun.com/) `1.4.2`, pinned in `Dockerfile`. Bun is both the
  package manager and the script runner; there is no npm/yarn lockfile.
- `jq`, to stamp the version into the manifest.
- Optionally Docker, which removes the need to install Bun yourself.

No network access is needed beyond the dependency install.

## Build

`PLATFORM` is `firefox` or `chrome`. `VERSION` is the version of the submission
you are reviewing, and must match, because it is written into `manifest.json`
and is what the store checks.

### With Docker

```bash
PLATFORM=firefox \
VERSION=<version> \
  ./bin/package_extension.sh
```

The result is `screenly-<platform>-extension-<version>.zip`, plus the unpacked
build in `dist/`.

### Without Docker

```bash
bun install --frozen-lockfile

jq --arg version "<version>" '.version = $version' \
  src/manifest-firefox.json > src/manifest.json

bunx webpack --config webpack.prod.js
```

`dist/` now holds the extension. `src/manifest.json` is generated and
deliberately not committed — `src/manifest-chrome.json` and
`src/manifest-firefox.json` are the templates it is built from, and the only
difference between the two platforms is the `browser_specific_settings` block
Firefox needs.

## Verifying the result

```bash
bun run test        # unit tests
bun run lint:check  # ESLint
bunx web-ext lint --source-dir dist
```

Released builds also carry [GitHub build
provenance](https://docs.github.com/en/actions/security-for-github-actions/using-artifact-attestations),
so a `.zip` from our releases page can be tied back to the workflow run and
commit that produced it:

```bash
gh attestation verify screenly-firefox-extension-<tag>.zip --owner Screenly
```
