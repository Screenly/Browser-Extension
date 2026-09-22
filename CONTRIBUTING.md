# Contributing

First off, thank you for considering contributing to this project! It's people like you that make open source such a great community.

For a complete guide on how to contribute to open source projects on GitHub, please read the [GitHub Open Source Guide](https://opensource.guide/how-to-contribute/).

## :raised_hands: How Can I Contribute?

### :lady_beetle: Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

* Use a clear and descriptive title
* Describe the exact steps to reproduce the problem
* Provide specific examples to demonstrate the steps
* Describe the behavior you observed and what behavior you expected
* Include screenshots if possible
* Include your environment details like OS, Browser, Docker, and Node.js version.

### :sparkles: Pull Requests

For a guide on how to open a pull request, please read [this documentation from GitHub](https://opensource.guide/how-to-contribute/#opening-a-pull-request).

1. Fork the repo and create your branch from `master`.
2. If you've added code that should be tested, add tests.
3. Ensure all the unit tests pass.
4. Make sure your code passes the linter check.
5. Make sure that the changes works in both Chrome and Firefox.
6. Update the documentation if needed.
7. Push to your fork and submit a pull request with the base branch set to `master`
   and the repository set to `Screenly/Browser-Extension`.

## :rocket: Release Process

### Versioning

Releases use CalVer `YYYY.M.MICRO`, with no zero padding on the month:
`2026.9.0`, `2026.10.0`. A new month resets MICRO to `0`; a second release
within the same month increments it. Tags carry a `v` prefix — `v2026.9.0` —
which is what `build.yaml` triggers on.

**The version lives in the manifests.** `src/manifest-chrome.json` and
`src/manifest-firefox.json` both carry it, and it is what the stores read. Bump
both on `master` first, then tag that commit, and keep the tag and the manifests
equal.

Nothing checks that yet. `build.yaml` and `test.yaml` still derive `.version`
from the git ref and write it over the manifest on the way into the build, which
is how the committed number came to differ from every released one. Replacing
that with a check is a follow-up; until it lands, the tag and the manifests
agreeing is a convention rather than a guarantee.

`package.json` is the build tooling's own manifest (`sce-webpack`, `private`),
not the extension's. Its version is unrelated and is not bumped for a release.

Chrome Web Store versions may only ever increase, so the move from `1.x` to
CalVer is one-way.

### Creating a Release

* Generate a new release tag in `git`:

```bash
$ git pull
$ git checkout master
$ git tag
[...]
$ git tag -a v2026.9.0 -m "tl;dr changelog."
$ git push origin v2026.9.0
```
* Navigate to the [GitHub releases](https://github.com/Screenly/Browser-Extension/releases) and click 'Draft a new release'.
* Select the tag you just created above and provide a release title and description.
  * You can use `git diff v1.6.1..v2026.9.0` to diff between the current and previous release to help you with the changelog.
* Go to the [CI Job](https://github.com/Screenly/Browser-Extension/actions/workflows/build.yaml) and pull down the release `.zip` files for the release you created.
  * You can verify the `.zip` files you downloaded with the GitHub CLI by running `gh attestation verify path/to/release.zip --owner Screenly`.

### Publishing to Stores

#### Chrome

* Navigate to [Chrome Web Store Developer Dashboard](https://chrome.google.com/u/1/webstore/devconsole/).
* Select the right publisher account and upload `screenly-chrome-extension.zip` you downloaded before.

#### Firefox

* Navigate to Firefox's [Add-on Developer Hub](https://addons.mozilla.org/en-US/developers/).
* Upload `screenly-firefox-extension.zip` you downloaded before.
