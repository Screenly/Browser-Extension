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

* Bump `.version` in `src/manifest-chrome.json` and `src/manifest-firefox.json`
  to the new `YYYY.M.MICRO` version, and merge that to `master`.
* Tag the merged commit. `vYYYY.M.MICRO`, matching the manifests exactly — the
  first CalVer release was `v2026.9.0`:

```bash
$ git pull
$ git checkout master
$ git tag
[...]
$ git tag -a vYYYY.M.MICRO -m "tl;dr changelog."
$ git push origin vYYYY.M.MICRO
```
* Pushing the tag runs [`build.yaml`](/.github/workflows/build.yaml), which builds
  both extensions and opens a GitHub release for the tag as a **pre-release**,
  with generated notes and the two `.zip` files attached.
* Edit that release: give it a title, tidy the notes, and check the `.zip` files.
  * You can use `git diff <previous tag>..<new tag>` to diff between the current
    and previous release to help you with the changelog.
  * You can verify a downloaded `.zip` with the GitHub CLI by running
    `gh attestation verify path/to/release.zip --owner Screenly`.

## :package: Publishing to the Stores

Untick 'Set as a pre-release' and publish the release. That is the point of no
return: it fires [`publish.yaml`](/.github/workflows/publish.yaml), which
submits what is attached to the release rather than rebuilding it, and checks
each artifact's build provenance and version against the tag before it does.
Nothing publishes off a bare tag push.

For Chrome the workflow uploads the package and submits it for review. For
Firefox it uploads the package together with a source archive of the tagged
commit, which AMO requires from us because the build is bundled and minified;
see [`SOURCE_BUILD_INSTRUCTIONS.md`](/SOURCE_BUILD_INSTRUCTIONS.md). Both stores
then review by hand, so the new version goes live hours to days later. Neither
job waits for that.

### Re-running a Submission

If one store fails and the other succeeds, don't re-publish the release — run
`publish.yaml` from the Actions tab instead. It takes the tag, which store to
submit to, and a `dry_run` option that stops short of submitting: for Chrome it
leaves the package as an unsubmitted draft, for Firefox it only lints.

### Credentials

`publish.yaml` reads these from the `store-release` environment. Give that
environment required reviewers if you want submissions to need a second
approval.

| Secret | What it is |
| --- | --- |
| `CHROME_PUBLISHER_ID` | The publisher account ID, visible in the Developer Dashboard URL. Not the extension ID. |
| `GCP_WORKLOAD_IDENTITY_PROVIDER` | Resource name of the workload identity provider, `projects/.../locations/global/workloadIdentityPools/.../providers/...`. |
| `GCP_SERVICE_ACCOUNT` | Email of the service account the provider is allowed to impersonate. |
| `AMO_JWT_ISSUER`, `AMO_JWT_SECRET` | [AMO API credentials](https://addons.mozilla.org/en-US/developers/addon/api/key/). The secret is shown once. |

Only the last row is a credential. The Chrome side stores nothing that grants
access on its own: at run time GitHub mints an OIDC token for the workflow,
Google trades it for an access token good for an hour, and the authority for
that trade lives in an IAM binding on Google's side rather than in this
repository. There is no refresh token to obtain, store, rotate, or lose — which
also removes the trap where a Google refresh token quietly stops working after
six months unused, a span shorter than the gap between some of our releases.

Firefox has no equivalent. AMO authenticates with an issuer and secret that
have to be stored; the workflow uses them to sign short-lived JWTs, and they
don't expire on their own.

#### Setting up the Chrome side

One-time, and it needs both a Google Cloud project and Chrome Web Store
publisher access:

1. In the Cloud project, enable the **Chrome Web Store API** and the **IAM
   Service Account Credentials API**.
2. Create a service account. It needs no project roles.
3. In the Chrome Web Store Developer Dashboard, under **Account**, add that
   service account's email. A publisher can have only one, so this is worth
   agreeing on before creating it.
4. Create a workload identity pool and a GitHub OIDC provider in it, with the
   attribute condition restricted to this repository.
5. Grant the provider's principal `roles/iam.workloadIdentityUser` on the
   service account.

Google's guide to [using a service account with the Chrome Web Store
API](https://developer.chrome.com/docs/webstore/service-accounts) covers 1–3,
and [`google-github-actions/auth`](https://github.com/google-github-actions/auth)
covers 4–5.

If federation is more than you want to set up, the same action takes a service
account JSON key instead: replace `workload_identity_provider` with
`credentials_json: ${{ secrets.GCP_SERVICE_ACCOUNT_KEY }}` in `publish.yaml`.
That is a long-lived secret again, but unlike a refresh token it belongs to the
organisation rather than to whoever happened to click through the consent
screen, and it can be rotated without one.

#### A note on the API version

Chrome Web Store API v1.1 is switched off after 15 October 2026, and most of
the publishing actions on the GitHub Marketplace still speak it. `publish.yaml`
calls v2 directly, which is why it needs a publisher ID alongside the extension
ID. Anything that replaces `bin/publish_chrome.sh` needs to speak v2 too.
